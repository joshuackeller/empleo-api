import prisma from "../../../../src/utilities/prisma";
import express from "express";
import handler from "../../../../src/middleware/handler";
import { z } from "zod";
import { ClientRequest } from "../../../../src/utilities/interfaces";
import { ApplicationSelect } from "../../../../src/select/client";
import OrgMiddleware from "../../../../src/middleware/client/OrgMiddleware";
import AuthMiddleware from "../../../../src/middleware/client/AuthMiddleware";
import nano_id from "../../../../src/utilities/nano_id";
import UploadToS3 from "../../../../src/utilities/UploadToS3";
import { Prisma } from "@prisma/client";
import { ClientError } from "../../../../src/utilities/errors";
import GetSignedUrl from "../../../../src/utilities/GetSignedUrl";
//
const router = express.Router({ mergeParams: true });

router.use(OrgMiddleware);
router.use(AuthMiddleware);

router.get(
  "/",
  handler(async (req: ClientRequest, res) => {
    const { listingId } = z.object({ listingId: z.string() }).parse(req.params);

    const application = await prisma.application.findFirst({
      where: {
        userId: req.userId,
        listing: {
          id: listingId,
          organization: {
            slug: req.slug,
          },
        },
      },
      select: ApplicationSelect,
    });

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

    res.send(application);
  })
);

router.post(
  "/",
  handler(async (req: ClientRequest, res) => {
    const { listingId } = z.object({ listingId: z.string() }).parse(req.params);

    const { resume, coverLetter, resumeName, coverLetterName, ...body } = z
      .object({
        firstName: z.string(),
        lastName: z.string(),
        linkedInUrl: z.string().optional(),
        phone: z.string().optional(),
        note: z.string().optional(),
        availableStartDate: z.date().optional(),
        resume: z.any().optional(),
        resumeName: z.any().optional(),
        coverLetter: z.any().optional(),
        coverLetterName: z.any().optional(),
      })
      .parse(req.body);

    const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
      where: { slug: req.slug },
    });

    let resumeId, resumeKey, coverLetterId, coverLetterKey;
    if (resume) {
      if (!resumeName) {
        throw new ClientError("No resume fiile name provided");
      }
      resumeId = nano_id();
      resumeKey = `${organizationId}/resumes/${resumeId}`;
      await UploadToS3(resume, resumeKey);
    }
    if (coverLetter) {
      if (!coverLetterName) {
        throw new ClientError("No resume fiile name provided");
      }
      coverLetterId = nano_id();
      coverLetterKey = `${organizationId}/coverLetter/${coverLetterId}`;
      await UploadToS3(resume, coverLetterKey);
    }

    try {
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
          resume:
            resumeId && resumeKey
              ? {
                  create: {
                    id: resumeId,
                    organization: {
                      connect: { id: organizationId },
                    },
                    name: resumeName,
                    s3Key: resumeKey,
                  },
                }
              : undefined,
          coverLetter:
            coverLetterId && coverLetterKey
              ? {
                  create: {
                    id: coverLetterId,
                    organization: {
                      connect: { id: organizationId },
                    },
                    name: coverLetterName,
                    s3Key: coverLetterKey,
                  },
                }
              : undefined,
        },
        select: ApplicationSelect,
      });

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

      res.json(application);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ClientError("You've already submitted an application");
        } else {
          throw error;
        }
      }
    }
  })
);

export default router;
