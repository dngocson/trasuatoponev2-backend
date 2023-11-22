import { StatusCodes } from "http-status-codes";
import { UserModel } from "../model/userModal";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";

// 1. Get all User
const getAllUser = catchAsync(async (req, res, next) => {
  const users = await UserModel.find();

  const response = createResponse({
    message: "Lấy dữ liệu users thành công",
    status: StatusCodes.OK,
    data: { users },
  });
  res.status(response.status).json(response);
});

export const userControllers = { getAllUser };
