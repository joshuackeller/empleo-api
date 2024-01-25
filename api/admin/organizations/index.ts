import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import nano_id from "../../../src/utilities/nano_id";
import { OrganizationSelect } from "../../../src/select/admin";

const router = express.Router();

router.use(AuthMiddleware);

router.get(
  "/:organizationId",
  handler(async (req: EmpleoRequest, res) => {
    const { organizationId } = z
      .object({
        organizationId: z.string(),
      })
      .parse(req.params);

    const organization = await prisma.organization.findUniqueOrThrow({
      where: {
        id: organizationId,
        admins: {
          some: {
            id: req.adminId,
          },
        },
      },
      select: OrganizationSelect,
    });

    res.json(organization);
  })
);

router.get(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const organization = await prisma.organization.findMany({
      where: {
        admins: {
          some: {
            id: req.adminId,
          },
        },
      },
      select: OrganizationSelect,
    });

    res.json(organization);
  })
);

router.post(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const { title, slug } = z
      .object({
        title: z.string(),
        slug: z.string().refine((value) => /^[a-z0-9-]+$/.test(value), {
          message:
            "Slug can only contain lowercase letters, numbers, and dashes",
        }),
      })
      .parse(req.body);

    const organization = await prisma.organization.create({
      data: {
        id: nano_id(),
        title,
        slug,
        admins: {
          connect: {
            id: req.adminId,
          },
        },
      },
    });

    res.json(organization);
  })
);

router.put(
  "/:organizationId",
  handler(async (req: EmpleoRequest, res) => {
    const { title, slug } = z // destructure dataUrl here as well
      .object({
        title: z.string().optional(),
        // dataUrl
        slug: z
          .string()
          .refine((value) => /^[a-z0-9-]+$/.test(value), {
            message:
              "Slug can only contain lowercase letters, numbers, and dashes",
          })
          .optional(),
      })
      .parse(req.body);

      // let imageId
      // if(dataUrl) {
        // imageId = nano_id()
      //   // Add logic for uploading to S3
      // S3.send(new PutObjectCommand({}))
      // }

    const { organizationId } = z
      .object({
        organizationId: z.string(),
      })
      .parse(req.params);

    const organization = await prisma.organization.update({
      where: {
        id: organizationId,
        admins: {
          some: {
            id: req.adminId,
          },
        },
      },
      data: {
        title,
        // logo: imageId ? {
        //   create: {
        //     // id: imageId,
        //     // url: dataUrl
        //   }
        // } : undefined
        slug,
      },
    });

    res.json(organization);
  })
);

export default router;
