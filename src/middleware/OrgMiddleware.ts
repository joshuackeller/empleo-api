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
  if (!req.admin_id) {
    throw new ClientError("No admin id", 403);
  }
  req.organization_id = undefined;
  if (
    !req.headers.organization ||
    typeof req.headers.organization !== "string"
  ) {
    throw new ClientError("No organization header", 403);
  }

  const admin_org_key = CreateRedisAdminOrgKey(
    req.admin_id,
    req.headers.organization as string
  );

  const data = await redis.get(admin_org_key);

  if (!data) {
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
    const one_hour_from_now = Math.floor(Date.now() / 1000) + 60 * 60;
    await redis.set(admin_org_key, true, {
      exat: one_hour_from_now,
    });
  }

  req.organization_id = req.headers.organization as string | undefined;

  next();
}
