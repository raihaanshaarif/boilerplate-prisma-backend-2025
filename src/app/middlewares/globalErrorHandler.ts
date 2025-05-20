import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: error.message || "Internal Server Error",
    error: error,
  });
  next();
};

export default globalErrorHandler;
