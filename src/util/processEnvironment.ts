import dotenv from "dotenv";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// 1. Copy environment from config.env to process.env
dotenv.config({ path: "./config.env" });

/////////////////////////////////////////////////////////////////////////
// 2. Validate process environment variables
const ZodProcessVariableSchema = z.object({
  NODE_ENV: z.string(),
  PORT: z.string(),
  USERNAME: z.string(),
  PASSWORD: z.string(),
  DATABASE: z.string(),
  DATABASE_PASSWORD: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  EMAIL_USERNAME: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_COOKIE_EXPIRES_IN: z.string(),
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

const validatedENV = ZodProcessVariableSchema.safeParse(process.env);
if (!validatedENV.success) {
  throw Error(fromZodError(validatedENV.error).message);
}

/////////////////////////////////////////////////////////////////////////
export default validatedENV.data;
