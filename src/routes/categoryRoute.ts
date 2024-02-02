import express from "express";
import { categoryControllers } from "../controller/categoryController";
import { authControllers } from "../controller/authController";
const router = express.Router();

router
  .route("/")
  .get(categoryControllers.getAllCategory)
  .post(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    categoryControllers.createnewCategory
  );
router
  .route("/:itemId")
  .patch(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    categoryControllers.updateCategory
  );
/////////////////////////////////////////////////////////////////////////
export default router;
