import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { z } from "zod";
import { ClientRequest } from "../../../src/utilities/interfaces";
import { ListingSelect } from "../../../src/select/client";
import OrgMiddleware from "../../../src/middleware/client/OrgMiddleware";

const router = express.Router();

router.use(OrgMiddleware);

router.get(
  "/",
  handler(async (req: ClientRequest, res) => {
    const { search } = z
      .object({ search: z.string().optional() })
      .parse(req.query);

    const listings = await prisma.listing.findMany({
      where: {
        organization: { slug: req.slug },
        published: true,
        OR: search
          ? [
              { jobTitle: { contains: search, mode: "insensitive" } },
              { jobDescription: { contains: search, mode: "insensitive" } },
              { jobDescription: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      select: ListingSelect,
    });
    res.json(listings);
  })
);

router.get(
  "/:listingId",
  handler(async (req: ClientRequest, res) => {
    const { listingId } = z
      .object({
        listingId: z.string(),
      })
      .parse(req.params);

    const listing = await prisma.listing.findUniqueOrThrow({
      where: {
        id: listingId,
        organization: {
          slug: req.slug,
        },
        published: true,
      },
      select: ListingSelect,
    });
    res.json(listing);
  })
);

export default router;
