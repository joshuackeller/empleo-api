import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { AdminRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/admin/AuthMiddleware";
import { z } from "zod";
import { SelfSelect } from "../../../src/select/admin";

const router = express.Router();

router.use(AuthMiddleware);

router.get(
  "/",
  handler(async (req: AdminRequest, res) => {
    const admin = await prisma.admin.findUniqueOrThrow({
      where: {
        id: req.adminId,
      },
      select: SelfSelect,
    });

    res.json(admin);
  })
);

router.put(
  "/",
  handler(async (req: AdminRequest, res) => {
    const data = z
      .object({
        firstName: z.string(),
        lastName: z.string().optional(),
      })
      .parse(req.body);

    const admin = await prisma.admin.update({
      where: {
        id: req.adminId,
      },
      data,
      select: SelfSelect,
    });

    res.json(admin);
  })
);

export default router;
