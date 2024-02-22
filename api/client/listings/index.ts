import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import {
  ClientApplicationSelect,
  ClientListingSelect,
  OrganizationSelect,
} from "../../../src/select/client";
import RedisKeys from "../../../src/utilities/RedisKeys";
import { ListingSelect } from "../../../src/select/admin";
import { z } from "zod";
import nano_id from "../../../src/utilities/nano_id";

//make new client listings select

const router = express.Router();

router.get(
  "/",
  handler(async (req: EmpleoRequest, res) => {
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
        published: true,
      },
      select: ClientListingSelect,
    });
    res.json(listing);
  })
);

// router.post(
//   "/:listingId",
//   handler(async (req: EmpleoRequest, res) => {
//     const body = z
//       .object({
//         firstName: z.string(),
//         lastName: z.string(),
//         phone: z.string().optional(),
//         //gender: z.string().optional(),
//         address: z.string().optional(),
//         city: z.string().optional(),
//         state: z.string().optional(),
//         zip: z.string().optional(),
//         usCitizen: z.boolean().optional(),
//         workVisa: z.boolean().optional(),
//         workVisaType: z.string().optional(),
//         language: z.string().optional(),
//         availableStartDate: z.string().optional(),
//         note: z.string().optional(),
//         relocate: z.boolean().optional(),
//         userId: z.string(),
//       })
//       .parse(req.body);

//     const application = await prisma.application.create({
//       data: {
//         id: nano_id(),
//         user: { connect: {} },

//         organization: { connect: { id: req.organizationId } },
//         ...body,
//       },
//       select: ClientApplicationSelect,
//     });

//     res.json(application);
//   })
// );

export default router;
