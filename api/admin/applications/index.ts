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
