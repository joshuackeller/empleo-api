import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { z } from "zod";
import { ClientRequest } from "../../../src/utilities/interfaces";
import { ListingSelect } from "../../../src/select/client";

//make new client listings select

const router = express.Router();

router.get(
  "/",
  handler(async (req: ClientRequest, res) => {
    const Listings = await prisma.listing.findMany({
      where: {
        organization: { slug: req.headers.organization as string },
        published: true,
      },
      select: ListingSelect,
    });
    res.json(Listings);
  }),
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
  }),
);

export default router;
