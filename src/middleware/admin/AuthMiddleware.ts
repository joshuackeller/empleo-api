import jwt from "jsonwebtoken";
import { ClientError } from "../../utilities/errors";
import { AdminJWTObject, AdminRequest } from "../../utilities/interfaces";
import SecretToken from "../../utilities/SecretToken";
import { NextFunction, Response } from "express";

export default function AuthMiddleware(
  req: AdminRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    req.adminId = undefined;

    if (!req.headers.authorization) {
      throw new ClientError("No authorization header", 403);
    }

    const { adminId } = jwt.verify(
      req.headers.authorization,
      SecretToken.auth
    ) as AdminJWTObject;

    req.adminId = adminId;

    next();
  } catch (error) {
    next(error);
  }
}
