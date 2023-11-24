import express from "express";
import { authControllers } from "../controller/authController";
import { userControllers } from "../controller/userController";

const router = express.Router();
/////////////////////////////////////////////////////////////////////////
// Login, Signup, Forgot password, Reset Password
router.post("/signup", authControllers.signup);
router.post("/login", authControllers.login);
router.post("/forgotPassword", authControllers.forgotPassword);
router.patch("/resetPassword/:token", authControllers.resetPassword);
router.patch(
  "/updatePassword",
  authControllers.protect,
  authControllers.updatePassword
);
router.post("/token", authControllers.refreshAccessToken);

/////////////////////////////////////////////////////////////////////////
// User
router.get(
  "/",
  authControllers.protect,
  // authControllers.restrictedTo("admin"),
  userControllers.getAllUser
);

/////////////////////////////////////////////////////////////////////////
// User self actions
router.patch(
  "/updateSelf",
  authControllers.protect,
  userControllers.userUpdateSelf
);
router.delete(
  "/deleteSelf",
  authControllers.protect,
  userControllers.inActiveSelf
);
export default router;
