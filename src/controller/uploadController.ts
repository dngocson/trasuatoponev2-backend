import { UploadApiResponse } from "cloudinary";
import catchAsync from "../util/catchAsync";
import cloudinary from "../util/cloudinaryConfig";
import { z } from "zod";
import { helperFunction } from "../util/helperFunction";
import AppError from "../util/appError";
import { StatusCodes } from "http-status-codes";
import createResponse from "../util/createResponse";

const { validateInputfn } = helperFunction;

/////////////////////////////////////////////////////////////////////////
// 1. Upload image
const uploadImage = catchAsync(async (req, res, next) => {
  const image = req?.file?.path;
  if (!image) {
    return next(
      new AppError("Không tìm thấy ảnh của bạn", StatusCodes.BAD_REQUEST)
    );
  }

  const result: UploadApiResponse = await cloudinary.uploader.upload(image);
  const uploadImage = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  const response = createResponse({
    message: `Tải ảnh thành công`,
    status: StatusCodes.CREATED,
    data: uploadImage,
  });
  res.status(response.status).json(response);
});

/////////////////////////////////////////////////////////////////////////
// 2. Delete Image
const ZodDeleteSchema = z.object({
  itemId: z.string(),
});

const removeImage = catchAsync(async (req, res, next) => {
  const validatedInput = validateInputfn(ZodDeleteSchema, req.params, next);
});

export const uploadControllers = { uploadImage, removeImage };
