import express from "express";
import { uploadControllers } from "../controller/uploadController";
import { parser } from "../util/cloudinaryConfig";

const router = express.Router();

/////////////////////////////////////////////////////////////////////////

router
  .route("/images")
  .post(parser.single("image"), uploadControllers.uploadImage);

router.route("/images/:itemId").delete(uploadControllers.removeImage);

/////////////////////////////////////////////////////////////////////////
export default router;
