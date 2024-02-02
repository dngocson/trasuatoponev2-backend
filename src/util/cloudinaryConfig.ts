import { v2 as cloudinary } from "cloudinary";
import validatedENV from "./processEnvironment";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: validatedENV.CLOUDINARY_NAME,
  api_key: validatedENV.CLOUDINARY_API_KEY,
  api_secret: validatedENV.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // @ts-ignore
    folder: "tra sua topone",
    format: async (req: any, file: any) => "webp", // supports promises as well
  },
});

export const parser = multer({ storage: storage });
export default cloudinary;
