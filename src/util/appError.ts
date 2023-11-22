import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import createResponse from "./createResponse";

type ErrorProps = {
  message?: string;
  statusCode?: number;
  isOperational?: boolean;
  status?: string;
};

class AppError extends Error {
  public status: string;
  public statusCode: number;
  public isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
export default AppError;

export const handleUndefinedRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(
    new AppError(
      `Không thể tìm thấy đường dẫn tại ${req.originalUrl}`,
      StatusCodes.NOT_FOUND
    )
  );
};

export const globalErrorHandler = (
  err: ErrorProps,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  const response = createResponse({
    message: err.message || "Error",
    status: Number(err.statusCode),
    ok: false,
    data: null,
  });
  res.status(response.status).json(response);
};
