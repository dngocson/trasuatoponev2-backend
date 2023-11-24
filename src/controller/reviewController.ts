import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { Review } from "../model/reviewModel";
import catchAsync from "../util/catchAsync";
import createResponse from "../util/createResponse";
import { helperFunction } from "../util/helperFunction";

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
const createNewReview = catchAsync(async (req, res, next) => {
  // A. Check nested route
  if (!req.body.menuItem) req.body.menuItem = req.params.itemId;
  if (!req.body.user) req.body.user = req.user._id;
  const validatedInput = validateInputfn(
    ZodCreateReviewSchema,
    req.body,
    next
  ) as ZodCreateReviewSchemaType;

  const newReview = await Review.create(validatedInput);
  const response = createResponse({
    message: "Gửi review thành công",
    status: StatusCodes.CREATED,
    data: newReview,
  });
  res.status(response.status).json(response);
});

export const reviewControllers = { getAllReview, createNewReview };
