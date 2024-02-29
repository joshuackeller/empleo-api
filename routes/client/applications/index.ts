import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { z } from "zod";
import { ClientRequest } from "../../../src/utilities/interfaces";
import { ApplicationSelect } from "../../../src/select/client";
import OrgMiddleware from "../../../src/middleware/client/OrgMiddleware";
import AuthMiddleware from "../../../src/middleware/client/AuthMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import UploadToS3 from "../../../src/utilities/UploadToS3";

const router = express.Router();

router.use(AuthMiddleware);
router.use(OrgMiddleware);

router.get(
  "/",
  handler(async (req: ClientRequest, res) => {
    const applications = await prisma.application.findMany({
      where: {
        listing: {
          organization: {
            slug: req.slug,
          },
        },
        userId: req.userId,
      },
      select: ApplicationSelect,
    });

    res.json(applications);
  })
);

router.get(
  "/:applicationId",
  handler(async (req: ClientRequest, res) => {
    const { applicationId } = z
      .object({
        applicationId: z.string(),
      })
      .parse(req.params);

    const application = await prisma.application.findUniqueOrThrow({
      where: {
        id: applicationId,
        listing: {
          organization: {
            slug: req.slug,
          },
        },
        userId: req.userId,
      },
      select: ApplicationSelect,
    });

    res.json(application);
  })
);

router.put(
  "/:applicationId",
  handler(async (req: ClientRequest, res) => {
    const { applicationId } = z
      .object({
        applicationId: z.string(),
      })
      .parse(req.params);

    const { resume, coverLetter, ...body } = z
      .object({
        firstName: z.string(),
        lastName: z.string(),
        linkedInUrl: z.string().optional(),
        phone: z.string().optional(),
        note: z.string().optional(),
        availableStartDate: z.date().optional(),
        resume: z.any().optional(),
        coverLetter: z.any().optional(),
      })
      .parse(req.body);

    const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
      where: { slug: req.slug },
    });

    let resumeId, resumeKey, coverLetterId, coverLetterKey;
    if (resume) {
      resumeId = nano_id();
      resumeKey = `${organizationId}/resumes/${resumeId}`;
      await UploadToS3(resume, resumeKey);
    }
    if (coverLetter) {
      coverLetterId = nano_id();
      coverLetterKey = `${organizationId}/coverLetter/${coverLetterId}`;
      await UploadToS3(resume, coverLetterKey);
    }

    const application = await prisma.application.update({
      where: {
        id: applicationId,
        userId: req.userId,
        listing: {
          organization: {
            slug: req.slug,
          },
        },
      },
      data: {
        ...body,
        resume: resumeId
          ? {
              create: {
                id: resumeId,
                organization: {
                  connect: { id: organizationId },
                },
                url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${resumeKey}`,
              },
            }
          : undefined,
        coverLetter: coverLetterId
          ? {
              create: {
                id: coverLetterId,
                organization: {
                  connect: { id: organizationId },
                },
                url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${coverLetterKey}`,
              },
            }
          : undefined,
      },
    });
    res.json(application);
  })
);

router.get("");

export default router;
