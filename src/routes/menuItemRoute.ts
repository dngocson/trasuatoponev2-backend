import express from "express";
import { menuControllers } from "../controller/menuItemController";
import { authControllers } from "../controller/authController";

const router = express.Router();

// 1. Get all menu + filter
router
  .route("/")
  .get(menuControllers.getAllMenuItems)
  .post(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    menuControllers.createMenuItem
  );

// 2. Get specific item in menu
router
  .route("/:id")
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

export default router;
