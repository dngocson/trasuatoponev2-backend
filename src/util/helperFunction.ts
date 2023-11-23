import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { fromZodError } from "zod-validation-error";
import validatedENV from "../util/processEnvironment";
import AppError from "./appError";

const signToken = (id: string) => {
  return jwt.sign({ id }, validatedENV.JWT_SECRET, {
    expiresIn: validatedENV.JWT_EXPIRES_IN,
  });
};

const signRefreshToken = (id: string) => {
  return jwt.sign({ id }, validatedENV.REFRESH_TOKEN_SECRET);
};

function validateInputfn(zodSchema: any, validateData: any, next: any) {
  const validatedInput = zodSchema.safeParse(validateData);
  if (!validatedInput.success) {
    return next(
      new AppError(
        fromZodError(validatedInput.error).message,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  return validatedInput.data;
}
export const helperFunction = { signToken, validateInputfn, signRefreshToken };
