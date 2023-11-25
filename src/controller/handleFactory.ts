import { StatusCodes } from "http-status-codes";
import { Model } from "mongoose";
import APIfeatures from "../util/apiFeatures";
import AppError from "../util/appError";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";
const { validateInputfn } = helperFunction;

///////////////////////////////////////////////////////////////////////////////////////////
// 1. Get All Document
const getAllDoc = function (Model: Model<Document>, docName: string) {
  return catchAsync(async (req, res, next) => {
    // For nested route
    let filter = {};
    if (req.params.itemId) filter = { menuItem: req.params.itemId };
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute query
    const doc = await features.query;

    const response = createResponse({
      message: `${docName} được lấy thành công`,
      status: StatusCodes.OK,
      data: doc,
    });

    res.status(response.status).json(response);
  });
};

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Get Document by Id
const getOneById = function (
  Model: Model<Document>,
  docName: string,
  populateOption?: { path: string; select?: string },
  unselecFields?: [string]
) {
  return catchAsync(async (req, res, next) => {
    console.log("Get one by Id");
    let query = Model.findById(req.params.itemId);
    if (populateOption) query = query.populate(populateOption);
    if (unselecFields) {
      const unselecFieldsText = unselecFields
        .map((field) => "-" + field)
        .join(" ");
      // @ts-ignore
      query = query.select(unselecFieldsText);
    }
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`${docName} bạn tìm không tồn tại`, StatusCodes.NOT_FOUND)
      );
    }

    const response = createResponse({
      message: `${docName} được lấy thành công`,
      status: StatusCodes.OK,
      data: doc,
    });
    res.status(response.status).json(response);
  });
};

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

///////////////////////////////////////////////////////////////////////////////////////////
export const handleFactory = {
  deleteOne,
  updateOne,
  createOne,
  getOneById,
  getAllDoc,
};
