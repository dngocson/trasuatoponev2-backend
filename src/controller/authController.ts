import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { UserModel } from "../model/userModal";
import AppError from "../util/appError";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";
import validatedENV from "../util/processEnvironment";

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

// 2. Signup function
const signup = catchAsync(async (req, res, next) => {
  const validatedInput = ZodUserSignupSchema.safeParse(req.body);
  if (!validatedInput.success) {
    return next(new AppError(fromZodError(validatedInput.error).message, 404));
  }
  const newUser = await UserModel.create(validatedInput.data);
  const token = helperFunction.signToken(newUser.id);
  const response = createResponse({
    message: "User đăng kí thành công",
    status: StatusCodes.CREATED,
    data: { user: newUser, token },
  });
  res.status(response.status).json(response);
});

// 3. Login User using Email + Password
const login = catchAsync(async (req, res, next) => {
  const validatedInput = ZodUserLoginSchema.safeParse(req.body);
  if (!validatedInput.success) {
    return next(
      new AppError(
        fromZodError(validatedInput.error).message,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // A. Find User by email
  const user = await UserModel.findOne({
    email: validatedInput.data.email,
  }).select("+password");

  // B. Check Password
  if (
    !user ||
    !(await user.correctPassword(validatedInput.data.password, user.password))
  ) {
    return next(
      new AppError("Email hoặc Password không đúng", StatusCodes.UNAUTHORIZED)
    );
  }

  // C. Create JWT token
  const token = helperFunction.signToken(user._id);
  const response = createResponse({
    message: "Login thành công",
    status: StatusCodes.OK,
    data: { user: user, token },
  });
  res.status(response.status).json(response);
});

// 4. Protect middleware(verify JWT_token)

const ZodDecodedSchema = z.object({
  id: z.string(),
  iat: z.number(),
  exp: z.number(),
});
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
  // @ts-ignore
  const decoded = await promisify(jwt.verify)(token, validatedENV.JWT_SECRET);
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

export const authControllers = { signup, login, protect };
