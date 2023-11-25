import express from "express";
import { authControllers } from "../controller/authController";
import { reviewControllers } from "../controller/reviewController";

const router = express.Router({ mergeParams: true }); // { mergeParams: true }: merge param from menuitem route

/////////////////////////////////////////////////////////////////////////
// 1. Create new review, get all reviews
router
  .route("/")
  .get(reviewControllers.getAllReview)
  .post(
    authControllers.protect,
    reviewControllers.setMenuAndUserIds,
    reviewControllers.createNewReview
  );

/////////////////////////////////////////////////////////////////////////
// 2. Get,Delete,Update,
router
  .route("/:itemId")
  .delete(reviewControllers.deleteReview)
  .patch(reviewControllers.updateReview)
  .get(reviewControllers.getReview);

/////////////////////////////////////////////////////////////////////////
export default router;
