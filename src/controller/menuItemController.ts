import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { MenuItem } from "../model/menuItemModel";
import APIfeatures from "../util/apiFeatures";
import AppError from "../util/appError";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";
const { validateInputfn, removeKeysFromResponse } = helperFunction;

///////////////////////////////////////////////////////////////////////////////////////////
const ZodCreateMenuSchema = z.object({
  name: z.string(),
  basePrice: z.number(),
  description: z.string().min(10).max(200),
  category: z.string(),
  image: z.string(),
  sizes: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .optional(),
  extraIngredient: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .optional(),
});

type ZodCreateMenuSchemaType = z.infer<typeof ZodCreateMenuSchema>;
///////////////////////////////////////////////////////////////////////////////////////////
// 1. Get all menu item
const getAllMenuItems = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(MenuItem.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const menuItems = await features.query;

  const response = createResponse({
    message: "Nhận thành công menu",
    status: StatusCodes.OK,
    data: menuItems,
  });

  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Create a menu item
const createMenuItem = catchAsync(async (req, res, next) => {
  const validatedInput = validateInputfn(
    ZodCreateMenuSchema,
    req.body,
    next
  ) as ZodCreateMenuSchemaType;

  const newMenuItem = await MenuItem.create(validatedInput);
  const response = createResponse({
    message: "Tạo thành công menu item mới",
    status: StatusCodes.CREATED,
    data: newMenuItem,
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 3. Get a specific menu item
const getMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.itemId).populate(
    "reviews"
  );

  if (!menuItem) {
    return next(
      new AppError("Menu bạn tìm không tồn tại", StatusCodes.NOT_FOUND)
    );
  }
  const response = createResponse({
    message: "Nhận thành công menu item",
    status: StatusCodes.OK,
    data: menuItem,
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 4. Update an menu item
const updateMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await MenuItem.findByIdAndUpdate(
    req.params.itemId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!menuItem) {
    return next(
      new AppError("Menu bạn tìm không tồn tại", StatusCodes.NOT_FOUND)
    );
  }

  const response = createResponse({
    message: "Sửa menu item thành công",
    status: StatusCodes.CREATED,
    data: menuItem,
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 5. Delete an menu item
const deleteMenuItem = catchAsync(async (req, res, next) => {
  const id = req.params.itemId;
  const menuItem = await MenuItem.findOneAndDelete({ _id: id });

  if (!menuItem) {
    return next(
      new AppError("Menu bạn tìm không tồn tại", StatusCodes.NOT_FOUND)
    );
  }

  const response = createResponse({
    message: "Xóa menu item thành công",
    status: StatusCodes.NO_CONTENT,
    data: null,
  });
  res.status(response.status).json(response);
});
export const menuControllers = {
  getAllMenuItems,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
