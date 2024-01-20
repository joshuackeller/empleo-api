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
  console.log("running");
  req.admin_id = undefined;

  if (!req.headers.authorization) {
    throw new ClientError("No authorization header", 403);
  }

  const { admin_id } = jwt.verify(
    req.headers.authorization,
    SecretToken.auth
  ) as AdminJWTObject;

  req.admin_id = admin_id;

  console.log("finished");

  next();
}
