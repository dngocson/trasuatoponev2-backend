import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { User } from "../model/userModel";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";

const { signToken, validateInputfn } = helperFunction;

/////////////////////////////////////////////////////////////////////////
const userUpdateSelfSchema = z
  .object({
    name: z.string(),
    phoneNumber: z.string(),
    image: z.string(),
    city: z.string(),
    address: z.string(),
  })
  .partial();

type UpdateMeTypeProps = z.infer<typeof userUpdateSelfSchema>;
/////////////////////////////////////////////////////////////////////////
// 1. Get all User
const getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  const response = createResponse({
    message: "Lấy dữ liệu users thành công",
    status: StatusCodes.OK,
    data: { users },
  });
  res.status(response.status).json(response);
});

/////////////////////////////////////////////////////////////////////////
// 1. User update self
const userUpdateSelf = catchAsync(async (req, res, next) => {
  const validatedInput = validateInputfn(
    userUpdateSelfSchema,
    req.body,
    next
  ) as UpdateMeTypeProps;

  const upadtedUser = await User.findByIdAndUpdate(
    req.user._id,
    validatedInput,
    { new: true, runValidators: true }
  );
  const response = createResponse({
    message: "Update dữ liệu của bạn thành công",
    status: StatusCodes.OK,
    data: { upadtedUser },
  });
  res.status(response.status).json(response);
});

// 2. User inactive self
const inActiveSelf = catchAsync(async (req, res, next) => {
  await User.findOneAndUpdate(req.user._id, { active: false });
  const response = createResponse({
    message: "Tài khoản của bạn được xóa thành công",
    status: StatusCodes.NO_CONTENT,
    data: null,
  });
  res.status(response.status).json(response);
});

export const userControllers = { getAllUser, userUpdateSelf, inActiveSelf };
