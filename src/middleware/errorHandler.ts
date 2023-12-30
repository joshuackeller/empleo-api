import { CustomError } from "../../src/utilities/errors";
import { NextFunction, Request, Response } from "express";

const errorHandler = (
  error: CustomError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  return res
    .status(error?.status || 500)
    .send(error?.message || "Something went wrong");
};

export default errorHandler;
