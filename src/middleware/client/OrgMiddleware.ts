import { ClientError } from "../../utilities/errors";
import { ClientRequest } from "../../utilities/interfaces";
import { NextFunction, Response } from "express";

export default function OrgMiddleware(
  req: ClientRequest,
  _res: Response,
  next: NextFunction,
) {
  try {
    req.slug = undefined;
    if (
      !req.headers.organization ||
      typeof req.headers.organization !== "string"
    ) {
      throw new ClientError("No organization header", 403);
    }

    req.slug = req.headers.organization as string | undefined;

    next();
  } catch (error) {
    next(error);
  }
}
