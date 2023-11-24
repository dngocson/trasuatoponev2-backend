import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { UserModel } from "../model/userModal";
import AppError from "../util/appError";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { sendEmail } from "../util/email";
import { helperFunction } from "../util/helperFunction";
import validatedENV from "../util/processEnvironment";

const { signToken, signRefreshToken, validateInputfn, removeKeysFromResponse } =
  helperFunction;
///////////////////////////////////////////////////////////////////////////////////////////
type CreateTokensProps = {
  signToken: (id: string) => string;
  signRefreshToken: (id: string) => string;
  id: string;
  res: Response;
};
const createTokensAndCookies = function ({
  signToken,
  signRefreshToken,
  id,
  res,
}: CreateTokensProps) {
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(validatedENV.ACCESS_COOKIE_EXPIRES_IN) * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (validatedENV.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("accessToken", signToken(id), cookieOptions);
  return {
    accessToken: signToken(id),
    refreshToken: signRefreshToken(id),
  };
};

///////////////////////////////////////////////////////////////////////////////////////////
// 1A. Validate User Input
const baseUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 kí tự"),
  passwordConfirm: z.string().min(8, "Mật khẩu cần ít nhất 8 kí tự"),
});

const ZodUserSignupSchema = baseUserSchema.refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: "Password không trùng nhau",
    path: ["passwordConfirm"],
  }
);

const ZodUserLoginSchema = baseUserSchema.pick({
  email: true,
  password: true,
});

const ZodForgotPasswordSchema = baseUserSchema.pick({
  email: true,
});

const ZodResetPasswordSchema = baseUserSchema
  .pick({
    password: true,
    passwordConfirm: true,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Password không trùng nhau",
    path: ["passwordConfirm"],
  });

const ZodUpdatePasswordSchema = baseUserSchema
  .pick({
    password: true,
    passwordConfirm: true,
  })
  .extend({ newPassword: z.string().min(8, "Mật khẩu cần ít nhất 8 kí tự") })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    message: "Password không trùng nhau",
    path: ["passwordConfirm"],
  });

// 1B. Validate JWT_token
const ZodAuthSchema = z.object({
  authorization: z
    .string()
    .min(1, "JWT token không khả dụng")
    .startsWith("Bearer")
    .refine((val) => {
      return val.split(" ")[1] !== undefined;
    }, "Bạn hãy đăng nhập trước khi sử dụng chức năng này"),
});

// 1C. Validate JWT token
const ZodDecodedSchema = z.object({
  id: z.string(),
  iat: z.number(),
  exp: z.number().optional(),
});

// 1D. Validate refresh token
const ZodRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
///////////////////////////////////////////////////////////////////////////////////////////
// 2. Signup function
const signup = catchAsync(async (req, res, next) => {
  const validatedInput = validateInputfn(ZodUserSignupSchema, req.body, next);
  const newUser = await UserModel.create(validatedInput);
  const token = createTokensAndCookies({
    signToken,
    signRefreshToken,
    id: newUser.id,
    res,
  });
  newUser.refreshToken.push(token.refreshToken);
  await newUser.save({ validateBeforeSave: false });

  removeKeysFromResponse(newUser, ["password", "refreshToken"]);
  const response = createResponse({
    message: "User đăng kí thành công",
    status: StatusCodes.CREATED,
    data: { user: newUser, token },
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 3. Login User using Email + Password
const login = catchAsync(async (req, res, next) => {
  const validatedInput = validateInputfn(ZodUserLoginSchema, req.body, next);
  // A. Find User by email
  const user = await UserModel.findOne({
    email: validatedInput.email,
  }).select("+password");

  // B. Check Password
  if (
    !user ||
    !(await user.correctPassword(validatedInput.password, user.password))
  ) {
    return next(
      new AppError("Email hoặc Password không đúng", StatusCodes.UNAUTHORIZED)
    );
  }

  // C. Create JWT token
  const token = createTokensAndCookies({
    signToken,
    signRefreshToken,
    id: user._id,
    res,
  });
  user.refreshToken.push(token.refreshToken);
  await user.save({ validateBeforeSave: false });
  removeKeysFromResponse(user, ["password", "refreshToken"]);
  const response = createResponse({
    message: "Login thành công",
    status: StatusCodes.OK,
    data: { user, token },
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 4. Protect middleware(verify JWT_token)
const protect = catchAsync(async (req, res, next) => {
  // A. Get token
  const validatedHeader = ZodAuthSchema.safeParse(req.headers);
  if (!validatedHeader.success) {
    return next(
      new AppError(
        fromZodError(validatedHeader.error).message,
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  const token = validatedHeader.data.authorization.split(" ")[1];

  // B. Veryfy token
  const decoded = await promisify(jwt.verify)(
    token,
    // @ts-ignore
    validatedENV.ACCESS_TOKEN_SECRET
  );

  const validateDecoded = ZodDecodedSchema.safeParse(decoded);
  if (!validateDecoded.success) {
    return next(
      new AppError(
        fromZodError(validateDecoded.error).message,
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  // C. Check if user still exists
  const freshUser = await UserModel.findById(validateDecoded.data.id);
  if (!freshUser)
    return next(
      new AppError("User không còn tồn tại", StatusCodes.UNAUTHORIZED)
    );

  // D. Check if user changed password after token issued
  if (freshUser.changedPasswordAfter(validateDecoded.data.iat)) {
    return next(
      new AppError(
        "Password vừa được thay đổi, bạn hãy đăng nhập lại",
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  // E. Grant access to protect route
  req.user = freshUser;
  next();
});

///////////////////////////////////////////////////////////////////////////////////////////
// 5. Restrict - Role
type Role = "user" | "admin";
const restrictedTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req?.user.role)) {
      return next(
        new AppError(
          "Bạn không quyền thực hiện hành động này",
          StatusCodes.FORBIDDEN
        )
      );
    }
    next();
  };
};

///////////////////////////////////////////////////////////////////////////////////////////
// 6. Forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
  // A. Find user based on Email
  const validatedInput = validateInputfn(
    ZodForgotPasswordSchema,
    req.body,
    next
  );
  const user = await UserModel.findOne({
    email: validatedInput.email,
  });

  // B. Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // C. Send token to user Email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Bạn đã quên mật khẩu? Hãy ấn vào link dưới đây để thay đổi mật khẩu của mình \n ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Lấy lại mật khẩu, link có hiệu lực trong 15 phút",
      text: message,
    });
    const response = createResponse({
      message: "Gửi email reset password thành công",
      status: StatusCodes.OK,
      data: null,
    });
    res.status(response.status).json(response);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "Đã có lỗi trong lúc gửi email, bạn vui lòng thử lại sau",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

///////////////////////////////////////////////////////////////////////////////////////////
// 7. ResetPassword
const resetPassword = catchAsync(async (req, res, next) => {
  const validatedInput = validateInputfn(
    ZodResetPasswordSchema,
    req.body,
    next
  );

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  }).select("-password");
  if (!user) {
    return next(
      new AppError(
        "Link của bạn không khả dụng hoặc đã hết hạn",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  user.password = validatedInput.password;
  user.passwordConfirm = validatedInput.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  removeKeysFromResponse(user, ["password", "refreshToken"]);
  const token = createTokensAndCookies({
    signToken,
    signRefreshToken,
    id: user.id,
    res,
  });
  const response = createResponse({
    message: "Password thay đổi thành công",
    status: StatusCodes.OK,
    data: { user, token },
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 8. Update password
const updatePassword = catchAsync(async (req, res, next) => {
  // A. Get user from collection
  const validatedInput = validateInputfn(
    ZodUpdatePasswordSchema,
    req.body,
    next
  ) as { password: string; passwordConfirm: string; newPassword: string };
  const user = await UserModel.findById(req.user._id).select("+password");

  // B. Check if password is correct
  if (!(await user.correctPassword(validatedInput.password, user.password))) {
    return next(
      new AppError(
        "Password hiện tại của bạn không đúng",
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  // C. Update password
  user.password = validatedInput.newPassword;
  user.passwordConfirm = validatedInput.passwordConfirm;
  await user.save();

  // B. Login, send JWT
  // const token = signToken(user.id);
  const token = createTokensAndCookies({
    signToken,
    signRefreshToken,
    id: user.id,
    res,
  });
  const response = createResponse({
    message: "Password thay đổi thành công",
    status: StatusCodes.OK,
    data: { token },
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 9. Reissue Access token
const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = validateInputfn(
    ZodRefreshTokenSchema,
    req.body,
    next
  ) as { refreshToken: string };
  const decoded = await promisify(jwt.verify)(
    refreshToken,
    // @ts-ignore
    validatedENV.REFRESH_TOKEN_SECRET
  );

  const validateDecoded = ZodDecodedSchema.safeParse(decoded);
  if (!validateDecoded.success) {
    return next(
      new AppError(
        fromZodError(validateDecoded.error).message,
        StatusCodes.UNAUTHORIZED
      )
    );
  }

  const user = await UserModel.findById(validateDecoded.data.id);
  if (!user || !user.refreshToken.includes(refreshToken)) {
    return next(new AppError("Token không khả dụng", StatusCodes.UNAUTHORIZED));
  }
  const token = createTokensAndCookies({
    signToken,
    signRefreshToken,
    id: user.id,
    res,
  });

  removeKeysFromResponse(user, ["password", "refreshToken"]);
  const response = createResponse({
    message: "Refresh token thành công",
    status: StatusCodes.CREATED,
    data: {
      user,
      token: {
        accessToken: token.accessToken,
      },
    },
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
export const authControllers = {
  signup,
  login,
  protect,
  restrictedTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  refreshAccessToken,
};
