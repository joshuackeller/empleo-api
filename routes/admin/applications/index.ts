import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { AdminRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/admin/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/admin/OrgMiddleware";
import {
  ApplicationNoteSelect,
  ApplicationSelect,
} from "../../../src/select/admin";
import GetSignedUrl from "../../../src/utilities/GetSignedUrl";
import { Status } from "@prisma/client";
import nano_id from "../../../src/utilities/nano_id";

const router = express.Router();

router.use(AuthMiddleware);
router.use(OrgMiddleware);

router.get(
  "/",
  handler(async (req: AdminRequest, res) => {
    const applications = await prisma.application.findMany({
      where: {
        organizationId: req.organizationId,
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

//application
router.get(
  "/:applicationId",
  handler(async (req: AdminRequest, res) => {
    const { applicationId } = z
      .object({
        applicationId: z.string(),
      })
      .parse(req.params);

    const application = await prisma.application.findUniqueOrThrow({
      where: {
        id: applicationId,
        organizationId: req.organizationId,
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

//application notes
router.get(
  "/:applicationId/notes",
  handler(async (req: AdminRequest, res) => {
    const { applicationId } = z
      .object({
        applicationId: z.string(),
      })
      .parse(req.params);

    const applicationNotes = await prisma.applicationNote.findMany({
      where: {
        applicationId: applicationId,
        organizationId: req.organizationId,
      },
      orderBy: { createdAt: "desc" },
      select: ApplicationNoteSelect,
    });

    res.json(applicationNotes);
  })
);

//update application note
router.post(
  "/:applicationId/notes",
  handler(async (req: AdminRequest, res) => {
    if (!req.organizationId || !req.adminId) {
      res
        .status(400)
        .json({ error: "organizationId and adminid are required" });
      return;
    }
    const body = z
      .object({
        text: z.string(),
      })
      .parse(req.body);
    const { applicationId } = req.params;

    const applicationNote = await prisma.applicationNote.create({
      data: {
        id: nano_id(),
        organizationId: req.organizationId,
        adminId: req.adminId,
        applicationId: applicationId,
        ...body,
      },
      select: ApplicationNoteSelect,
    });

    res.json(applicationNote);
  })
);

// update application
router.put(
  "/:applicationId",
  handler(async (req: AdminRequest, res) => {
    const { status } = z
      .object({
        status: z.enum([
          Object.values(Status)[0],
          ...Object.values(Status).splice(1),
        ]),
      })
      .parse(req.body);

    const { applicationId } = z
      .object({
        applicationId: z.string(),
      })
      .parse(req.params);

    const application = await prisma.application.update({
      where: {
        organizationId: req.organizationId,
        id: applicationId,
      },
      data: {
        status: status,
      },
    });

    res.json(application);
  })
);

//Delete Listing
router.delete(
  "/:applicationId",
  handler(async (req: AdminRequest, res) => {
    const { applicationId } = z
      .object({
        applicationId: z.string(),
      })
      .parse(req.params);

    const application = await prisma.application.delete({
      where: {
        id: applicationId,
        // organizationId: req.organizationId,
      },
      select: ApplicationSelect,
    });

    res.json(application);
  })
);
export default router;
