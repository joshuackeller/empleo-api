import prisma from "../../../src/utilities/prisma";
import express, { application } from "express";
import handler from "../../../src/middleware/handler";
import { AdminRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/admin/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/admin/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { ApplicationSelect } from "../../../src/select/admin";

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
    res.json(applications);
  })
);

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
    res.json(application);
  })
);

<<<<<<< Updated upstream
router.post(
  "/",
  handler(async (req: AdminRequest, res) => {
    const { user } = z
      .object({
        user: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        // phone: z.string().optional(),
        // address: z.string().optional(),
        // city: z.string().optional(),
        // state: z.string().optional(),
        // zip: z.string().optional(),
        // usCitizen: z.boolean().optional(),
        // workVisa: z.boolean().optional(),
        // workVisaType: z.string().optional(),
        // language: z.string().optional(),
        // availableStartDate: z.string().optional(),
        // note: z.string().optional(),
        // relocate: z.boolean().optional(),
        // resumeUrl: z.string().optional(),
        // coverLetterUrl: z.string().optional(),
      })
      .parse(req.body);

    const application = await prisma.application.create({
      data: {
        id: nano_id(),
        firstName: "firstName",
        lastName: "lastName",
        user: {
          connect: {
            id: user,
          },
        },
      },
      select: ApplicationSelect,
    });

    res.json(application);
  })
);

// update listing
router.put(
  "/:applicationId",
  handler(async (req: AdminRequest, res) => {
    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zip,
      usCitizen,
      usAuthorized,
      prevEmployee,
      nonCompete,
      olderThan18,
      race,
      hispanicOrLatino,
      veteranStatus,
      disabilityStatus,
      workVisa,
      workVisaType,
      language,
      availableStartDate,
      note,
      relocate,
      userId,
      resumeUrl,
      coverLetterUrl,

      } = z
      .object({
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        usCitizen: z.boolean().optional(),
        usAuthorized: z.boolean().optional(),
        prevEmployee: z.boolean().optional(),
        nonCompete: z.boolean().optional(),
        olderThan18: z.boolean().optional(),
        race: z.string().optional(),
        hispanicOrLatino: z.boolean().optional(),
        veteranStatus: z.string().optional(),
        disabilityStatus: z.string().optional(),
        workVisa: z.boolean().optional(),
        workVisaType: z.string().optional(),
        language: z.string().optional(),
        availableStartDate: z.string().optional(),
        note: z.string().optional(),
        relocate: z.boolean().optional(),
        userId: z.string(),
        resumeUrl: z.string().optional(),
        coverLetterUrl: z.string().optional(),
      })
      .parse(req.body);

    const { applicationId } = z
      .object({
        applicationId: z.string(),
      })
      .parse(req.params);

    // const prismaGender = gender as Gender

    let resumeId;
    if (resumeUrl) {
      // Extract Mime and Buffer from dataUrl
      const mime = resumeUrl?.split(":")[1].split(";")[0];
      const base64 = resumeUrl?.split(",")[1];
      const buffer = Buffer.from(base64, "base64");

      resumeId = nano_id();
      // Unique key for the s3 bucket upload -- need to change nano_id to be the image id that was created from a nano id
      const fileKey = `${applicationId}/resumes/${resumeId}`;

      // Upload the image to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Body: buffer,
          ContentType: mime,
          Key: fileKey,
        })
      );
    }

    let coverLetterId;
    if (coverLetterUrl) {
      // Extract Mime and Buffer from dataUrl
      const mime = coverLetterUrl?.split(":")[1].split(";")[0];
      const base64 = coverLetterUrl?.split(",")[1];
      const buffer = Buffer.from(base64, "base64");

      coverLetterId = nano_id();
      // Unique key for the s3 bucket upload -- need to change nano_id to be the image id that was created from a nano id
      const fileKey = `${applicationId}/coverLetters/${coverLetterId}`;

      // Upload the image to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Body: buffer,
          ContentType: mime,
          Key: fileKey,
        })
      );
    }

    const application = await prisma.application.update({
      where: {
        id: applicationId,
        // organizationId: req.organizationId,
      },
      data: {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zip,
        usCitizen,
        usAuthorized,
        prevEmployee,
        nonCompete,
        olderThan18,
        race,
        hispanicOrLatino,
        veteranStatus,
        disabilityStatus,
        workVisa,
        workVisaType,
        language,
        availableStartDate,
        note,
        relocate,
        userId,
        // resume: resumeId
        //   ? {
        //       create: {
        //         id: resumeId,
        //         applicationId: applicationId,
        //         url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${applicationId}/resumes/${resumeId}`,
        //       },
        //     }
        //   : undefined,
        // coverLetter: coverLetterId
        //   ? {
        //       create: {
        //         id: coverLetterId,
        //         applicationId: applicationId,
        //         url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${applicationId}/coverLetters/${coverLetterId}`,
        //       },
        //     }
        //   : undefined,
      },
      select: ApplicationSelect,
    });

    res.json(application);
  })
);

=======
>>>>>>> Stashed changes
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
