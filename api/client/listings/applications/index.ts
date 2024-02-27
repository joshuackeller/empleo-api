import express from "express";
import { z } from "zod";
import AuthMiddleware from "../../../../src/middleware/client/AuthMiddleware";
import OrgMiddleware from "../../../../src/middleware/client/OrgMiddleware";
import handler from "../../../../src/middleware/handler";
import { ClientRequest } from "../../../../src/utilities/interfaces";
import nano_id from "../../../../src/utilities/nano_id";
import UploadToS3 from "../../../../src/utilities/UploadToS3";
import prisma from "../../../../src/utilities/prisma";

const router = express.Router();

router.use(AuthMiddleware);
router.use(OrgMiddleware);

router.post(
  "/",
  handler(async (req: ClientRequest, res) => {
    const { listingId } = z.object({ listingId: z.string() }).parse(req.params);

    const { resume, coverLetter, ...body } = z
      .object({
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string().optional(),
        gender: z.enum(["male", "female", "prefer_not_to_say", "other"]),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        race: z.string().optional(),
        veteranStatus: z.string().optional(),
        disabilityStatus: z.string().optional(),
        workVisaType: z.string().optional(),
        language: z.string().optional(),
        note: z.string().optional(),
        usCitizen: z.boolean().optional(),
        usAuthorized: z.boolean().optional(),
        prevEmployee: z.boolean().optional(),
        nonCompete: z.boolean().optional(),
        olderThan18: z.boolean().optional(),
        hispanicOrLatino: z.boolean().optional(),
        relocate: z.boolean().optional(),
        workVisa: z.boolean().optional(),
        availableStartDate: z.date(),
        resume: z.any(),
        coverLetter: z.any(),
      })
      .parse(req.body);

    const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
      where: { slug: req.slug },
    });
    let resumeId, coverLetterId;
    if (resume) {
      resumeId = nano_id();
      const resumeKey = `/results/${resumeId}`;
      await UploadToS3(resume, organizationId, resumeKey);
    }
    if (coverLetter) {
      coverLetterId = nano_id();
      const coverLetterKey = `/coverLetter/${coverLetterId}`;
      await UploadToS3(resume, organizationId, coverLetterKey);
    }

    const application = await prisma.application.create({
      data: {
        ...body,
        id: nano_id(),
        listing: {
          connect: {
            organizationId_id: {
              organizationId,
              id: listingId,
            },
          },
        },
        user: {
          connect: {
            id: req.userId,
          },
        },
        resume: {
          connect: {
            id: resumeId,
          },
        },
        coverLetter: {
          connect: {
            id: coverLetterId,
          },
        },
      },
    });

    res.json(application);
  })
);

export default router;
