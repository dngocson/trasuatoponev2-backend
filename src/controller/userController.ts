import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { User } from "../model/userModel";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { handleFactory } from "./handleFactory";

const { deleteOne, updateOne, getOneById, getAllDoc } = handleFactory;

/////////////////////////////////////////////////////////////////////////
// 1. Get all User
const getAllUser = getAllDoc(User, "User");

/////////////////////////////////////////////////////////////////////////
// 2. Get a User
const getUser = getOneById(User, "User", undefined, ["refreshToken"]);

/////////////////////////////////////////////////////////////////////////
// 3. Delete User
const deleteUser = deleteOne(User);

/////////////////////////////////////////////////////////////////////////
// 4. Update User
const userUpdateSchema = z
  .object({
    name: z.string(),
    phoneNumber: z.string(),
    image: z.string(),
    city: z.string(),
    address: z.string(),
  })
  .partial();

const updateUser = updateOne(User, userUpdateSchema);

/////////////////////////////////////////////////////////////////////////
// *********************************************************************
const copyUserParams = (req: Request, res: Response, next: NextFunction) => {
  req.params.itemId = req.user._id;
  next();
};
// *********************************************************************
/////////////////////////////////////////////////////////////////////////
// 5. User Get self
const userGetSelf = getOneById(User, "User");

/////////////////////////////////////////////////////////////////////////
// 5. User update self
const userUpdateSelf = updateOne(User, userUpdateSchema);

/////////////////////////////////////////////////////////////////////////
// 6. User inactive self
const inActiveSelf = catchAsync(async (req, res, next) => {
  await User.findOneAndUpdate(req.user._id, { active: false });
  const response = createResponse({
    message: "Tài khoản của bạn được xóa thành công",
    status: StatusCodes.NO_CONTENT,
    data: null,
  });
  res.status(response.status).json(response);
});

/////////////////////////////////////////////////////////////////////////
export const userControllers = {
  getAllUser,
  userUpdateSelf,
  inActiveSelf,
  deleteUser,
  updateUser,
  getUser,
  copyUserParams,
  userGetSelf,
};
