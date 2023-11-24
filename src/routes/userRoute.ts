import express from "express";
import { authControllers } from "../controller/authController";
import { userControllers } from "../controller/userController";

const router = express.Router();
/////////////////////////////////////////////////////////////////////////
// 1. Login, Signup, Forgot password, Reset Password, Refresh Token
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
// 2. Admin actions
router
  .route("/")
  .get(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    userControllers.getAllUser
  );

router
  .route("/:itemId")
  .delete(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    userControllers.deleteUser
  )
  .patch(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    userControllers.updateUser
  );
/////////////////////////////////////////////////////////////////////////
// 3. User actions
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
