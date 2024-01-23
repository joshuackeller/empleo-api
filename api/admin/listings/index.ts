import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { ListingSelect } from "../../../src/select/admin";
//import CreateRedisAdminOrgKey from "../../../src/utilities/CreateRedisAdminOrgKey";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

const router = express.Router();

router.use(AuthMiddleware);
router.use(OrgMiddleware);

router.get(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const listings = await prisma.listing.findMany({
      where: {
        organizationId: req.organizationId,
      },
      select: ListingSelect,
    });
    res.json(listings);
  })
);

router.post(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const body = z
      .object({
        jobTitle: z.string(),
        jobDescription: z.string().optional(),
        jobRequirements: z.string().optional(),
        employmentType: z.string().optional(),
        location: z.string().optional(),
        salaryRange: z.string().optional(),
        published: z.boolean(),
      })
      .parse(req.body);

    const listing = await prisma.listing.create({
      data: {
        id: nano_id(),
        organization: { connect: { id: req.organizationId } },
        ...body,
      },
      select: ListingSelect,
    });

    res.json(listing);
  })
);
export default router;
