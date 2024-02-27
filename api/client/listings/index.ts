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
