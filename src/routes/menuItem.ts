import express from "express";
import { menuController } from "../controller/menuItem";
const router = express.Router();

// 1. Get all menu + filter
router
  .route("/")
  .get(menuController.getAllMenuItems)
  .post(menuController.createMenuItem);

// 2. Get specific item in menu
router
  .route("/:id")
  .get(menuController.getMenuItem)
  .patch(menuController.updateMenuItem)
  .delete(menuController.deleteMenuItem);

export default router;
