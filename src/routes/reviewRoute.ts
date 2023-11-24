import express from "express";
import { authControllers } from "../controller/authController";
import { reviewControllers } from "../controller/reviewController";

const router = express.Router({ mergeParams: true }); // { mergeParams: true }: merge param from menuitem route

/////////////////////////////////////////////////////////////////////////
// 1. Post new review, delete Review,
router
  .route("/")
  .get(reviewControllers.getAllReview)
  .post(authControllers.protect, reviewControllers.createNewReview);
export default router;
