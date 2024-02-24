import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { ClientRequest } from "../../../src/utilities/interfaces";
import {
  ClientApplicationSelect,
  ClientListingSelect,
  OrganizationSelect,
} from "../../../src/select/client";
import RedisKeys from "../../../src/utilities/RedisKeys";
import { ListingSelect } from "../../../src/select/admin";
import { z } from "zod";
import nano_id from "../../../src/utilities/nano_id";

const router = express.Router();

router.get(
  "/",
  handler(async (req: ClientRequest, res) => {
    console.log(req.headers.organization);
    const Listings = await prisma.listing.findMany({
      where: {
        organization: { slug: req.headers.organization as string },
        published: true,
      },
      select: ClientListingSelect,
    });
    res.json(Listings);
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
        organizationId: req.organizationId,
        published: true,
      },
      select: ClientListingSelect,
    });
    res.json(listing);
  })
);

export default router;
