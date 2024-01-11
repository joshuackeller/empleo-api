import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { AdminSelect } from "../../../src/select/admin";
import CreateRedisAdminOrgKey from "../../../src/utilities/CreateRedisAdminOrgKey";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

const router = express.Router();

router.use("*", AuthMiddleware);
router.use("*", OrgMiddleware);

router.get(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const admins = await prisma.admin.findMany({
      where: {
        organizations: {
          some: {
            id: req.organization_id,
          },
        },
      },
      select: AdminSelect,
    });
    res.json(admins);
  })
);

router.get(
  "/:admin_id",
  handler(async (req: EmpleoRequest, res) => {
    const { admin_id } = z
      .object({
        admin_id: z.string(),
      })
      .parse(req.params);

    const admin = await prisma.admin.findUniqueOrThrow({
      where: {
        id: admin_id,
        organizations: {
          some: {
            id: req.organization_id,
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
  handler(async (req: EmpleoRequest, res) => {
    const { email } = z
      .object({
        email: z.string().email(),
      })
      .parse(req.params);

    const admin = await prisma.admin.upsert({
      where: {
        email: email,
      },
      update: {
        organizations: {
          connect: {
            id: req.organization_id,
          },
        },
      },
      create: {
        id: nano_id(),
        first_name: "",
        email,
        self_created: false,
        email_confirmed: false,
        organizations: {
          connect: {
            id: req.organization_id,
          },
        },
      },
      select: AdminSelect,
    });

    res.json(admin);
  })
);

router.delete(
  "/:admin_id",
  handler(async (req: EmpleoRequest, res) => {
    const { admin_id } = z
      .object({
        admin_id: z.string(),
      })
      .parse(req.params);

    const admin = await prisma.admin.update({
      where: {
        id: admin_id,
        organizations: {
          some: {
            id: req.organization_id,
          },
        },
      },
      data: {
        organizations: {
          disconnect: {
            id: req.organization_id,
          },
        },
      },
      select: AdminSelect,
    });

    // Expire current redis admin org key
    const admin_org_key = CreateRedisAdminOrgKey(
      admin_id,
      req.headers.organization as string
    );
    redis.expire(admin_org_key, 0);

    res.json(admin);
  })
);

export default router;
