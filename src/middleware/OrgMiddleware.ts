import { ClientError } from "../utilities/errors";
import { EmpleoRequest } from "../utilities/interfaces";
import { NextFunction, Response } from "express";
import prisma from "../utilities/prisma";

import { Redis } from "@upstash/redis";
import CreateRedisAdminOrgKey from "../utilities/CreateRedisAdminOrgKey";

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

export default async function OrgMiddleware(
  req: EmpleoRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.adminId) {
      throw new ClientError("No authorization header", 403);
    }
    req.organizationId = undefined;
    if (
      !req.headers.organization ||
      typeof req.headers.organization !== "string"
    ) {
      throw new ClientError("No organization header", 403);
    }

    const adminOrgKey = CreateRedisAdminOrgKey(
      req.adminId,
      req.headers.organization as string
    );

    const data = await redis.get(adminOrgKey);

    if (!data) {
      try {
        await prisma.organization.findUniqueOrThrow({
          where: {
            id: req.headers.organization as string,
            admins: {
              some: {
                id: req.adminId,
              },
            },
          },
        });
        const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60;
        await redis.set(adminOrgKey, true, {
          exat: oneHourFromNow,
        });
      } catch {
        throw new ClientError("Invalid organization");
      }
    }

    req.organizationId = req.headers.organization as string | undefined;

    next();
  } catch (error) {
    next(error);
  }
}
