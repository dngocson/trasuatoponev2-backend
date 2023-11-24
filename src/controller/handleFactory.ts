import { StatusCodes } from "http-status-codes";
import { Model } from "mongoose";
import AppError from "../util/appError";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";
const { validateInputfn } = helperFunction;

///////////////////////////////////////////////////////////////////////////////////////////
// 3. Create Document
const createOne = function (
  Model: Model<Document>,
  ZodSchema: any,
  docName: string
) {
  return catchAsync(async (req, res, next) => {
    const validatedInput = validateInputfn(ZodSchema, req.body, next);
    const doc = await Model.create(validatedInput);
    const response = createResponse({
      message: `${docName} được tạo thành công`,
      status: StatusCodes.CREATED,
      data: doc,
    });
    res.status(response.status).json(response);
  });
};

///////////////////////////////////////////////////////////////////////////////////////////
// 4. Update Document
const updateOne = function (Model: Model<Document>, ZodSchema: any) {
  return catchAsync(async (req, res, next) => {
    const validatedInput = validateInputfn(ZodSchema, req.body, next);
    const doc = await Model.findByIdAndUpdate(
      req.params.itemId,
      validatedInput,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new AppError("Dữ liệu không tồn tại trên server", StatusCodes.NOT_FOUND)
      );
    }

    const response = createResponse({
      message: "Cập nhật dữ liệu thành công",
      status: StatusCodes.CREATED,
      data: doc,
    });
    res.status(response.status).json(response);
  });
};

///////////////////////////////////////////////////////////////////////////////////////////
// 5. Delete Document
const deleteOne = function (Model: Model<Document>) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.itemId);
    if (!doc) {
      return next(new AppError("Dữ liệu không tồn tại", StatusCodes.NOT_FOUND));
    }
    const response = createResponse({
      message: "Xóa dữ liệu thành công",
      status: StatusCodes.NO_CONTENT,
      data: null,
    });
    res.status(response.status).json(response);
  });
};

export const handleFactory = { deleteOne, updateOne, createOne };
