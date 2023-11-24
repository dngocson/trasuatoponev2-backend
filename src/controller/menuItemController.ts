import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { MenuItem } from "../model/menuItemModel";
import APIfeatures from "../util/apiFeatures";
import AppError from "../util/appError";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";
import { handleFactory } from "./handleFactory";

const { deleteOne, updateOne, createOne } = handleFactory;
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
const createMenuItem = createOne(MenuItem, ZodCreateMenuSchema, "Menu");

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
const ZodUpdateMenuSchema = ZodCreateMenuSchema.partial();
const updateMenuItem = updateOne(MenuItem, ZodUpdateMenuSchema);

///////////////////////////////////////////////////////////////////////////////////////////
// 5. Delete an menu item
const deleteMenuItem = deleteOne(MenuItem);

///////////////////////////////////////////////////////////////////////////////////////////
export const menuControllers = {
  getAllMenuItems,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
