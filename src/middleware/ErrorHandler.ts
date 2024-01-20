import { CustomError } from "../utilities/errors";
import { NextFunction, Request, Response } from "express";

const ErrorHandler = (
  error: CustomError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  return res
    .status(error?.status || 500)
    .send(error?.message || "Something went wrong");
};

export default ErrorHandler;
