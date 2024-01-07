import prisma from "../../../../src/utilities/prisma";
import express from "express";
import handler from "../../../../src/middleware/handler";
import { EmpleoRequest } from "../../../../src/utilities/interfaces";
import AuthMiddleware from "../../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import nano_id from "../../../../src/utilities/nano_id";

const router = express.Router();

router.use("*", AuthMiddleware);

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
            id: req.admin_id,
          },
        },
      },
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
            id: req.admin_id,
          },
        },
      },
    });

    res.json(organization);
  })
);

router.post(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const { title } = z
      .object({
        title: z.string(),
      })
      .parse(req.body);
    console.log(req.admin_id);
    const organization = await prisma.organization.create({
      data: {
        id: nano_id(),
        title,
        admins: {
          connect: {
            id: req.admin_id,
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
    const { title } = z
      .object({
        title: z.string(),
      })
      .parse(req.body);

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
            id: req.admin_id,
          },
        },
      },
      data: {
        title,
      },
    });

    res.json(organization);
  })
);

export default router;
