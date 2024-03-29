import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { z } from "zod";
import { ClientRequest } from "../../../src/utilities/interfaces";
import { ApplicationSelect } from "../../../src/select/client";
import OrgMiddleware from "../../../src/middleware/client/OrgMiddleware";
import AuthMiddleware from "../../../src/middleware/client/AuthMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { ClientError } from "../../../src/utilities/errors";
import GetSignedUrl from "../../../src/utilities/GetSignedUrl";
import UploadToFileS3 from "../../../src/utilities/UploadToFileS3";
import { Gender } from "@prisma/client";
import GetFileType from "../../../src/utilities/GetFileType";

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

    for (const application of applications) {
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

    const { resume, coverLetter, resumeName, coverLetterName, ...body } = z
      .object({
        firstName: z.string(),
        lastName: z.string(),
        linkedInUrl: z.string().optional(),
        phone: z.string().optional(),
        note: z.string().optional(),
        availableStartDate: z.string().optional(),
        resume: z.any().optional(),
        resumeName: z.any().optional(),
        coverLetter: z.any().optional(),
        coverLetterName: z.any().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        usAuthorized: z.boolean().optional(),
        eeocRace: z.string().optional(),
        eeocVeteranStatus: z.string().optional(),
        eeocDisabilityStatus: z.string().optional(),
        eeocGender: z
          .enum([Object.values(Gender)[0], ...Object.values(Gender)])
          .optional(),
      })
      .parse(req.body);

    const { id: organizationId } = await prisma.organization.findUniqueOrThrow({
      where: { slug: req.slug },
    });

    let resumeId,
      resumeKey,
      resumeFileType,
      coverLetterId,
      coverLetterKey,
      coverLetterFileType;
    if (resume) {
      // Add logic to delete old resume
      if (!resumeName) {
        throw new ClientError("No resume fiile name provided");
      }
      // Console log first 20 characters of resume
      console.log("RESUME", resume.slice(0, 20));
      resumeId = nano_id();
      resumeKey = `${organizationId}/resumes/${resumeId}`;
      resumeFileType = GetFileType(resume);
      await UploadToFileS3(resume, resumeKey);
    }
    if (coverLetter) {
      // Add logic to delete cover letter
      if (!coverLetterName) {
        throw new ClientError("No resume fiile name provided");
      }
      coverLetterId = nano_id();
      coverLetterKey = `${organizationId}/coverLetter/${coverLetterId}`;
      coverLetterFileType = GetFileType(coverLetter);
      await UploadToFileS3(coverLetter, coverLetterKey);
    }

    console.log("RESUME FILE TYPE", resumeFileType);

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
                  fileType: resumeFileType,
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
                  fileType: coverLetterFileType,
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
  })
);

export default router;
