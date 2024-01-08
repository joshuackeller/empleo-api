import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import nano_id from "../../../src/utilities/nano_id";
import { OrganizationSelect } from "../../../src/select/admin";

const router = express.Router();

router.use("*", AuthMiddleware);

router.get(
  "/:organization_id",
  handler(async (req: EmpleoRequest, res) => {
    const { organization_id } = z
      .object({
        organization_id: z.string(),
      })
      .parse(req.params);

    const organization = await prisma.organization.findUniqueOrThrow({
      where: {
        id: organization_id,
        admins: {
          some: {
            id: req.admin_id,
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
            id: req.admin_id,
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
    const { title } = z
      .object({
        title: z.string(),
      })
      .parse(req.body);

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
  "/:organization_id",
  handler(async (req: EmpleoRequest, res) => {
    const { title } = z
      .object({
        title: z.string(),
      })
      .parse(req.body);

    const { organization_id } = z
      .object({
        organization_id: z.string(),
      })
      .parse(req.params);

    const organization = await prisma.organization.update({
      where: {
        id: organization_id,
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
