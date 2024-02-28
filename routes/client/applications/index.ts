import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { z } from "zod";
import { ClientRequest } from "../../../src/utilities/interfaces";
import { ApplicationSelect } from "../../../src/select/client";
import OrgMiddleware from "../../../src/middleware/client/OrgMiddleware";
import AuthMiddleware from "../../../src/middleware/client/AuthMiddleware";

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

router.get("");

export default router;
