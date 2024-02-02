import express from "express";
import { menuControllers } from "../controller/menuItemController";
import { authControllers } from "../controller/authController";
import reviewRouter from "./reviewRoute";

const router = express.Router();

/////////////////////////////////////////////////////////////////////////
// 1. Get all menu + filter
router
  .route("/")
  .get(menuControllers.getAllMenuItems)
  .post(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    menuControllers.createMenuItem
  );

/////////////////////////////////////////////////////////////////////////
// 2. Get specific item in menu
router
  .route("/:itemId")
  .get(menuControllers.getMenuItem)
  .patch(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    menuControllers.updateMenuItem
  )
  .delete(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    menuControllers.deleteMenuItem
  );

/////////////////////////////////////////////////////////////////////////
// 3. Merge route
router.use("/:itemId/reviews", reviewRouter);

/////////////////////////////////////////////////////////////////////////
export default router;
