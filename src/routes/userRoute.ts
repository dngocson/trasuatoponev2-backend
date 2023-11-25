import express from "express";
import { authControllers } from "../controller/authController";
import { userControllers } from "../controller/userController";

const router = express.Router();

/////////////////////////////////////////////////////////////////////////
// Authentication routes
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
// User actions
router
  .route("/me")
  .get(
    authControllers.protect,
    userControllers.copyUserParams,
    userControllers.userGetSelf
  )
  .patch(
    authControllers.protect,
    userControllers.copyUserParams,
    userControllers.userUpdateSelf
  )
  .delete(authControllers.protect, userControllers.inActiveSelf);

/////////////////////////////////////////////////////////////////////////
// Admin actions
router
  .route("/")
  .get(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    userControllers.getAllUser
  );

router
  .route("/:itemId")
  .get(
    authControllers.protect,
    authControllers.restrictedTo("admin"),
    userControllers.getUser
  )
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
export default router;
