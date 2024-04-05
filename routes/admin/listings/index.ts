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
import ParseOrderBy from "../../../src/utilities/ParseOrderBy";
import { OpenAI } from "openai";
import axios from "axios";
import GetSignedUrl from "../../../src/utilities/GetSignedUrl";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const router = express.Router();

router.use(AuthMiddleware);
router.use(OrgMiddleware);

router.get(
  "/",
  handler(async (req: AdminRequest, res) => {
    const { page, pageSize, orderBy, sort, direction } = z
      .object({
        page: z.string().optional().default("1").transform(Number),
        pageSize: z.string().optional().default("10").transform(Number),
        orderBy: z.string().optional(),
        sort: z.string().optional(),
        direction: z.string().optional(),
      })
      .parse(req.query);

    const where: Prisma.ListingWhereInput = {
      organizationId: req.organizationId,
    };

    const [count, data] = await prisma.$transaction([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        // orderBy: {
        //   createdAt: "desc",
        // },
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: ListingSelect,
        orderBy: ParseOrderBy(
          "createdAt:desc",
          sort && direction ? `${sort}:${direction}` : orderBy
        ),
      }),
    ]);

    res.json({ count, data });
  })
);

//updating record?
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

//chatgpt response
router.post(
  "/:listingId/chatgpt",
  handler(async (req: AdminRequest, res) => {
    const { listingId } = req.params;
    //const listing = await getListingById(listingId);
    const listing = await prisma.listing.findUniqueOrThrow({
      where: { id: listingId, organizationId: req.organizationId },
      select: ListingSelect,
    });
    const prompt = req.body.prompt;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: `Please write a medium length job description in a professional format for the postition with the title: ${listing.jobTitle} and use the following instructions to do so ${prompt}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({ text: response.data.choices[0].message.content, listingId });
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
  const { page, pageSize, orderBy, sort, direction } = z
    .object({
      page: z.string().optional().default("1").transform(Number),
      pageSize: z.string().optional().default("10").transform(Number),
      orderBy: z.string().optional(),
      sort: z.string().optional(),
      direction: z.string().optional(),
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
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: ApplicationSelect,
      orderBy: ParseOrderBy(
        "createdAt:desc",
        sort && direction ? `${sort}:${direction}` : orderBy
      ),
    }),
  ]);

  for (const application of data) {
    if (application?.resume) {
      (application.resume as any).url = await GetSignedUrl(
        application.resume.s3Key
      );
      delete (application.resume as any).s3Key;
    }
    if (application?.coverLetter) {
      (application.coverLetter as any).url = await GetSignedUrl(
        application.coverLetter.s3Key
      );
      delete (application.coverLetter as any).s3Key;
    }
  }

  res.send({ count, data });
});

export default router;
