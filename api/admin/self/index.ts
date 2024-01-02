import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";

const router = express.Router();

router.use("*", AuthMiddleware);

router.get(
  "/",
  handler(async (req: EmpleoRequest, res) => {
    const admin = await prisma.admin.findUniqueOrThrow({
      where: {
        id: req.admin_id,
      },
    });

    res.json(admin);
  })
);

export default router;
