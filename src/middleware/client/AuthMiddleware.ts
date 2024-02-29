import jwt from "jsonwebtoken";
import { ClientError } from "../../utilities/errors";
import { ClientJWTObject, ClientRequest } from "../../utilities/interfaces";
import SecretToken from "../../utilities/SecretToken";
import { NextFunction, Response } from "express";

export default function AuthMiddleware(
  req: ClientRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    req.userId = undefined;

    if (!req.headers.authorization) {
      throw new ClientError("No authorization header", 403);
    }

    const { userId } = jwt.verify(
      req.headers.authorization,
      SecretToken.clientAuth
    ) as ClientJWTObject;

    req.userId = userId;

    next();
  } catch (error) {
    next(error);
  }
}
