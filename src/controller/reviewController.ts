import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Review } from "../model/reviewModel";
import { handleFactory } from "./handleFactory";

const { deleteOne, updateOne, createOne, getOneById, getAllDoc } =
  handleFactory;

///////////////////////////////////////////////////////////////////////////////////////////
// 1. Get all review
const getAllReview = getAllDoc(Review, "Review");

///////////////////////////////////////////////////////////////////////////////////////////
// 2. Get a review
const getReview = getOneById(Review, "Review");

///////////////////////////////////////////////////////////////////////////////////////////
// 3. Create a new review
const ZodCreateReviewSchema = z.object({
  review: z.string(),
  rating: z.number().min(1).max(5),
  menuItem: z.string(),
  user: z.string(),
});
const createNewReview = createOne(Review, ZodCreateReviewSchema, "review");

///////////////////////////////////////////////////////////////////////////////////////////
// 4. Delete a review
const deleteReview = deleteOne(Review);

///////////////////////////////////////////////////////////////////////////////////////////
// 5. Delete a review
const ZodUpdateReviewSchema = ZodCreateReviewSchema.partial();
const updateReview = updateOne(Review, ZodUpdateReviewSchema);

///////////////////////////////////////////////////////////////////////////////////////////
const setMenuAndUserIds = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.menuItem) req.body.menuItem = req.params.itemId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

///////////////////////////////////////////////////////////////////////////////////////////
export const reviewControllers = {
  getAllReview,
  createNewReview,
  deleteReview,
  updateReview,
  setMenuAndUserIds,
  getReview,
};
