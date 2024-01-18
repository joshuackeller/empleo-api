import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { AdminSelect } from "../../../src/select/admin.drizzle";
import CreateRedisAdminOrgKey from "../../../src/utilities/CreateRedisAdminOrgKey";

import { Redis } from "@upstash/redis";
import drizzle from "../../../drizzle/db";
import { admin, adminToOrganization } from "../../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { ClientError } from "../../../src/utilities/errors";

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
    const admins = await drizzle
      .select(AdminSelect)
      .from(admin)
      .leftJoin(adminToOrganization, eq(admin.id, adminToOrganization.adminId))
      .where(eq(adminToOrganization.organizationId, req.organization_id!));

    res.json(admins);
  })
);

router.get(
  "/:adminId",
  handler(async (req: EmpleoRequest, res) => {
    const { adminId } = z
      .object({
        adminId: z.string(),
      })
      .parse(req.params);

    const results = await drizzle
      .select(AdminSelect)
      .from(admin)
      .leftJoin(adminToOrganization, eq(admin.id, adminToOrganization.adminId))
      .where(
        and(
          eq(adminToOrganization.organizationId, req.organization_id!),
          eq(admin.id, adminId)
        )
      )
      .limit(1);

    if (!results || results.length < 1)
      throw new ClientError("Could not find admin");

    res.json(results[0]);
  })
);

router.post(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const { email } = z
      .object({
        email: z.string().email(),
      })
      .parse(req.body);

    const result = await drizzle.transaction(async (tx) => {
      const [adminData] = await tx
        .insert(admin)
        .values({
          id: nano_id(),
          email,
          firstName: "",
          updatedAt: new Date().toISOString(),
          emailConfirmed: false,
          selfCreated: false,
        })
        .returning(AdminSelect)
        .onConflictDoNothing({ target: admin.email });
      await tx.insert(adminToOrganization).values({
        adminId: adminData.id,
        organizationId: req.organization_id!,
      });

      return adminData;
    });

    res.json(result);
  })
);

router.delete(
  "/:adminId",
  handler(async (req: EmpleoRequest, res) => {
    const { adminId } = z
      .object({
        adminId: z.string(),
      })
      .parse(req.params);

    // const admin = await prisma.admin.update({
    //   where: {
    //     id: adminId,
    //     organizations: {
    //       some: {
    //         id: req.organization_id,
    //       },
    //     },
    //   },
    //   data: {
    //     organizations: {
    //       disconnect: {
    //         id: req.organization_id,
    //       },
    //     },
    //   },
    //   select: AdminSelect,
    // });

    // Make sure admin is part of org

    const result = await drizzle.transaction(async (tx) => {
      const admins = await tx
        .select(AdminSelect)
        .from(admin)
        .leftJoin(
          adminToOrganization,
          eq(admin.id, adminToOrganization.adminId)
        )
        .where(
          and(
            eq(adminToOrganization.organizationId, req.organization_id!),
            eq(admin.id, adminId)
          )
        )
        .limit(1);

      if (!admins || admins.length < 1) {
        await tx.rollback();
        throw new ClientError("Could not find admin");
      }

      const result = await tx
        .delete(admin)
        .where(eq(admin.id, adminId))
        .returning(AdminSelect);

      await tx
        .delete(adminToOrganization)
        .where(
          and(
            eq(adminToOrganization.adminId, adminId),
            eq(adminToOrganization.organizationId, req.organization_id!)
          )
        );

      return result;
    });

    // Expire current redis admin org key
    const admin_org_key = CreateRedisAdminOrgKey(
      adminId,
      req.organization_id as string
    );
    redis.expire(admin_org_key, 0);

    res.json(result);
  })
);

export default router;
