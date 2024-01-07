import jwt from "jsonwebtoken";
import { ClientError } from "../utilities/errors";
import { AdminJWTObject, EmpleoRequest } from "../utilities/interfaces";
import SecretToken from "../utilities/SecretToken";
import { NextFunction, Response } from "express";

export default function AuthMiddleware(
  req: EmpleoRequest,
  _res: Response,
  next: NextFunction
) {
  req.admin_id = undefined;
  req.organization_id = undefined;
  if (!req.headers.authorization) {
    throw new ClientError("No authorization header", 403);
  }

  const { admin_id } = jwt.verify(
    req.headers.authorization,
    SecretToken.auth
  ) as AdminJWTObject;

  req.admin_id = admin_id;
  req.organization_id = req.headers.organization as string | undefined;

  next();
}
