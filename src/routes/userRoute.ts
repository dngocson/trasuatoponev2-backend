import express from "express";
import { authControllers } from "../controller/authController";
import { userControllers } from "../controller/userController";

const router = express.Router();
// LOGIN + AUTH
router.post("/signup", authControllers.signup);
router.post("/login", authControllers.login);

// User
router.get("/", userControllers.getAllUser);
export default router;
