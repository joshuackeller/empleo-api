import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { AdminRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/admin/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/admin/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { ApplicationSelect, ListingSelect } from "../../../src/select/admin";
import { EmploymentType, Prisma } from "@prisma/client";

const router = express.Router();

router.use(AuthMiddleware);
router.use(OrgMiddleware);

router.get(
  "/",
  handler(async (req: AdminRequest, res) => {
    const { page, pageSize } = z
      .object({
        page: z.string().optional().default("1").transform(Number),
        pageSize: z.string().optional().default("10").transform(Number),
      })
      .parse(req.query);

    const where: Prisma.ListingWhereInput = {
      organizationId: req.organizationId,
    };

    const [count, data] = await prisma.$transaction([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: ListingSelect,
      }),
    ]);

    res.json({ count, data });
  })
);

//updating record? (still working on)
router.get(
  "/:listingId",
  handler(async (req: AdminRequest, res) => {
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
  handler(async (req: AdminRequest, res) => {
    const body = z
      .object({
        jobTitle: z.string(),
        jobDescription: z.string().optional(),
        shortDescrition: z.string().optional(),
        jobRequirements: z.string().optional(),
        employmentType: z
          .enum([
            Object.values(EmploymentType)[0],
            ...Object.values(EmploymentType).slice(1),
          ])
          .optional(),
        location: z.string().optional(),
        salaryRange: z.string().optional(),
        published: z.boolean().default(false).optional(),
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
  handler(async (req: AdminRequest, res) => {
    const data = z
      .object({
        jobTitle: z.string().optional(),
        shortDescription: z.string().optional(),
        jobDescription: z.string().optional(),
        jobRequirements: z.string().optional(),
        employmentType: z
          .enum([
            Object.values(EmploymentType)[0],
            ...Object.values(EmploymentType).slice(1),
          ])
          .optional(),
        location: z.string().optional(),
        salaryRange: z.string().optional(),
        published: z.boolean().optional(),
        linkedInUrlEnabled: z.boolean().optional(),
        noteEnabled: z.boolean().optional(),
        resumeEnabled: z.boolean().optional(),
        coverLetterEnabled: z.boolean().optional(),
        availableStartDateEnabled: z.boolean().optional(),
        phoneEnabled: z.boolean().optional(),
        addressEnabled: z.boolean().optional(),
        cityEnabled: z.boolean().optional(),
        stateEnabled: z.boolean().optional(),
        zipEnabled: z.boolean().optional(),
        usAuthorizedEnabled: z.boolean().optional(),
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
  handler(async (req: AdminRequest, res) => {
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

router.get("/:listingId/applications", async (req: AdminRequest, res) => {
  const { listingId } = z
    .object({
      listingId: z.string(),
    })
    .parse(req.params);
  const { page, pageSize } = z
    .object({
      page: z.string().optional().default("1").transform(Number),
      pageSize: z.string().optional().default("10").transform(Number),
    })
    .parse(req.query);

  const where: Prisma.ApplicationWhereInput = {
    listingId: listingId,
    organizationId: req.organizationId,
  };

  const [count, data] = await prisma.$transaction([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: ApplicationSelect,
    }),
  ]);

  res.send({ count, data });
});

export default router;
