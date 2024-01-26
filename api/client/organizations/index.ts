import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import { z } from "zod";
import { OrganizationSelect } from "../../../src/select/client";
import { Redis } from "@upstash/redis";
import RedisKeys from "../../../src/utilities/RedisKeys";

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

const router = express.Router();

router.get(
  "/:slug",
  handler(async (req: EmpleoRequest, res) => {
    const { slug } = z
      .object({
        slug: z.string(),
      })
      .parse(req.params);

    const orgKey = RedisKeys.organizationBySlug(slug);

    let organization = await redis.get(orgKey);

    if (!organization) {
      organization = await prisma.organization.findUniqueOrThrow({
        where: {
          slug,
        },
        select: OrganizationSelect,
      });
      redis.set(orgKey, organization);
    }
    res.json(organization);
  }),
);

export default router;
