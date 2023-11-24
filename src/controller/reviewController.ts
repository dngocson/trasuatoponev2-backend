import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { Review } from "../model/reviewModel";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";
import { handleFactory } from "./handleFactory";

const { deleteOne, updateOne, createOne } = handleFactory;
const { validateInputfn, removeKeysFromResponse } = helperFunction;
///////////////////////////////////////////////////////////////////////////////////////////
const ZodCreateReviewSchema = z.object({
  review: z.string(),
  rating: z.number().min(1).max(5),
  menuItem: z.string(),
  user: z.string(),
});

type ZodCreateReviewSchemaType = z.infer<typeof ZodCreateReviewSchema>;

///////////////////////////////////////////////////////////////////////////////////////////
// 1. Get all review
const getAllReview = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.itemId) filter = { menuItem: req.params.itemId };

  const reviews = await Review.find(filter);
  const response = createResponse({
    message: "Nhận thành công menu item",
    status: StatusCodes.OK,
    data: reviews,
  });
  res.status(response.status).json(response);
});

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Create a new review
const createNewReview = createOne(Review, ZodCreateReviewSchema, "review");

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Delete a review
const deleteReview = deleteOne(Review);

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Delete a review
const ZodUpdateReviewSchema = ZodCreateReviewSchema.partial();
const updateReview = updateOne(Review, ZodUpdateReviewSchema);

///////////////////////////////////////////////////////////////////////////////////////////
const setMenuAndUserIds = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.menuItem) req.body.menuItem = req.params.itemId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
export const reviewControllers = {
  getAllReview,
  createNewReview,
  deleteReview,
  updateReview,
  setMenuAndUserIds,
};
