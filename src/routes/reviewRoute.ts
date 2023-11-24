import express from "express";
import { authControllers } from "../controller/authController";
import { reviewControllers } from "../controller/reviewController";

const router = express.Router({ mergeParams: true }); // { mergeParams: true }: merge param from menuitem route

/////////////////////////////////////////////////////////////////////////
// 1. Post new review,
router
  .route("/")
  .get(reviewControllers.getAllReview)
  .post(
    authControllers.protect,
    reviewControllers.setMenuAndUserIds,
    reviewControllers.createNewReview
  );

/////////////////////////////////////////////////////////////////////////
// 2. Delete new review,
router
  .route("/:itemId")
  .delete(reviewControllers.deleteReview)
  .patch(reviewControllers.updateReview);
export default router;
