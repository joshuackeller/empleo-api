import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { ListingSelect } from "../../../src/select/admin";

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

//updating record? (still working on)
router.get(
  "/:listingId",
  handler(async (req: EmpleoRequest, res) => {
    const { listingId } = z
      .object({
        listingId: z.string(),
      })
      .parse(req.params);

    const listing = await prisma.listing.findUniqueOrThrow({
      where: {
        id: listingId,
        organizationId: req.organizationId,
      },
      select: ListingSelect,
    });
    res.json(listing);
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

// update listing
router.put(
  "/:listingId",
  handler(async (req: EmpleoRequest, res) => {
    const data = z
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

    const { listingId } = z
      .object({
        listingId: z.string(),
      })
      .parse(req.params);

    const listing = await prisma.listing.update({
      where: {
        id: listingId,
        organizationId: req.organizationId,
      },
      data,
    });

    res.json(listing);
  })
);

//Delete Listing
router.delete(
  "/:listingId",
  handler(async (req: EmpleoRequest, res) => {
    const { listingId } = z
      .object({
        listingId: z.string(),
      })
      .parse(req.params);

    const listing = await prisma.listing.delete({
      where: {
        id: listingId,
        organizationId: req.organizationId,
      },
      select: ListingSelect,
    });

    res.json(listing);
  })
);
export default router;
