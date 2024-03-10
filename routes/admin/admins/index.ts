import prisma from "../../../src/utilities/prisma";
import express, { NextFunction, Response } from "express";
import handler from "../../../src/middleware/handler";
import { AdminRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/admin/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/admin/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { AdminSelect } from "../../../src/select/admin";

import { Redis } from "@upstash/redis";
import RedisKeys from "../../../src/utilities/RedisKeys";

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

const router = express.Router();

router.use(AuthMiddleware);
router.use(OrgMiddleware);

router.get(
  "/",
  handler(async (req: AdminRequest, res) => {
    const admins = await prisma.admin.findMany({
      where: {
        organizations: {
          some: {
            id: req.organizationId,
          },
        },
      },
      select: AdminSelect,
    });
    res.json(admins);
  })
);

router.get(
  "/:adminId",
  handler(async (req: AdminRequest, res) => {
    const { adminId } = z
      .object({
        adminId: z.string(),
      })
      .parse(req.params);

    const admin = await prisma.admin.findUniqueOrThrow({
      where: {
        id: adminId,
        organizations: {
          some: {
            id: req.organizationId,
          },
        },
      },
      select: AdminSelect,
    });
    res.json(admin);
  })
);

router.post(
  "/",
  handler(async (req: AdminRequest, res) => {
    const { email } = z
      .object({
        email: z.string().email().toLowerCase(),
      })
      .parse(req.body);

    const admin = await prisma.admin.upsert({
      where: {
        email: email,
      },
      update: {
        organizations: {
          connect: {
            id: req.organizationId,
          },
        },
      },
      create: {
        id: nano_id(),
        firstName: "",
        email,
        selfCreated: false,
        emailConfirmed: false,
        organizations: {
          connect: {
            id: req.organizationId,
          },
        },
      },
      select: AdminSelect,
    });

    res.json(admin);
  })
);

router.delete(
  "/:adminId",
  handler(async (req: AdminRequest, res) => {
    const { adminId } = z
      .object({
        adminId: z.string(),
      })
      .parse(req.params);

    const admin = await prisma.admin.update({
      where: {
        id: adminId,
        organizations: {
          some: {
            id: req.organizationId,
          },
        },
      },
      data: {
        organizations: {
          disconnect: {
            id: req.organizationId,
          },
        },
      },
      select: AdminSelect,
    });

    // Expire current redis admin org key
    const admin_org_key = RedisKeys.adminOrganization(
      adminId,
      req.headers.organization as string
    );
    redis.expire(admin_org_key, 0);

    res.json(admin);
  })
);

export default router;
