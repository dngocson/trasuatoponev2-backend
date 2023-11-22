import jwt from "jsonwebtoken";
import validatedENV from "../util/processEnvironment";

const signToken = (id: string) => {
  return jwt.sign({ id }, validatedENV.JWT_SECRET, {
    expiresIn: validatedENV.JWT_EXPIRES_IN,
  });
};

export const helperFunction = { signToken };
