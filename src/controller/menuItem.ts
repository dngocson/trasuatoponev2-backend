import { MenuItemModel } from "../model/menuItemModel";
import catchAsync from "../util/catchAsync";
import APIfeatures from "../util/apiFeatures";
import createResponse from "../util/createResponse";
import { StatusCodes } from "http-status-codes";

// 1. Get all menu item
const getAllMenuItems = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(MenuItemModel.find(), req.query)
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

// 2. Create a menu item
const createMenuItem = catchAsync(async (req, res, next) => {
  const data = req.body;
  const newMenuItem = await MenuItemModel.create(data);
  const response = createResponse({
    message: "Tạo thành công menu item mới",
    status: StatusCodes.CREATED,
    data: newMenuItem,
  });
  res.status(response.status).json(response);
});

// 3. Get a specific menu item
const getMenuItem = catchAsync(async (req, res, next) => {
  const menuItem = await MenuItemModel.findById(req.params.id);
  const response = createResponse({
    message: "Nhận thành công menu item",
    status: StatusCodes.OK,
    data: menuItem,
  });
  res.status(response.status).json(response);
});

// 4. Update an menu item
const updateMenuItem = catchAsync(async (req, res, next) => {
  const tour = await MenuItemModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  const response = createResponse({
    message: "Sửa menu item thành công",
    status: StatusCodes.CREATED,
    data: tour,
  });
  res.status(response.status).json(response);
});

// 5. Delete an menu item
const deleteMenuItem = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  await MenuItemModel.findOneAndDelete({ _id: id });
  const response = createResponse({
    message: "Xóa menu item thành công",
    status: StatusCodes.NO_CONTENT,
    data: null,
  });
  res.status(response.status).json(response);
});
export const menuController = {
  getAllMenuItems,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
