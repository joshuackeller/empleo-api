import { ClientError } from "../utilities/errors";
import { EmpleoRequest } from "../utilities/interfaces";
import { NextFunction, Response } from "express";
import prisma from "../utilities/prisma";

export default async function OrgMiddleware(
  req: EmpleoRequest,
  _res: Response,
  next: NextFunction
) {
  if (!req.admin_id) {
    throw new ClientError("No admin id", 403);
  }
  req.organization_id = undefined;
  if (!req.headers.organization) {
    throw new ClientError("No organization header", 403);
  }
  await prisma.organization.findUniqueOrThrow({
    where: {
      id: req.headers.organization as string,
      admins: {
        some: {
          id: req.admin_id,
        },
      },
    },
  });

  req.organization_id = req.headers.organization as string | undefined;

  next();
}
