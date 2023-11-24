import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { fromZodError } from "zod-validation-error";
import validatedENV from "../util/processEnvironment";
import AppError from "./appError";

///////////////////////////////////////////////////////////////////////////////////////////
const signToken = (email: string) => {
  return jwt.sign({ email }, validatedENV.ACCESS_TOKEN_SECRET, {
    expiresIn: validatedENV.ACCESS_TOKEN_EXPIRES_IN,
  });
};

const signRefreshToken = (email: string) => {
  return jwt.sign({ email }, validatedENV.REFRESH_TOKEN_SECRET);
};

///////////////////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////////////////
function removeKeysFromResponse(
  obj: { [key: string]: any },
  keysToRemove: string[]
) {
  keysToRemove.forEach((key: string) => {
    obj[key] = undefined;
  });
}

export const helperFunction = {
  signToken,
  validateInputfn,
  signRefreshToken,
  removeKeysFromResponse,
};
