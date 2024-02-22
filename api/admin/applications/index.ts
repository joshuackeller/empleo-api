import prisma from "../../../src/utilities/prisma";
import express, { application } from "express";
import handler from "../../../src/middleware/handler";
import { AdminRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/admin/AuthMiddleware";
import { z } from "zod";
import OrgMiddleware from "../../../src/middleware/admin/OrgMiddleware";
import nano_id from "../../../src/utilities/nano_id";
import { ApplicationSelect } from "../../../src/select/admin";
import app from "../..";

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

// router.post(
//   "/",
//   handler(async (req: AdminRequest, res) => {
//     const body = z
//       .object({
//         firstName: z.string(),
//         lastName: z.string(),
//         phone: z.string().optional(),
//         //gender: z.string().optional(),
//         address: z.string().optional(),
//         city: z.string().optional(),
//         state: z.string().optional(),
//         zip: z.string().optional(),
//         usCitizen: z.boolean().optional(),
//         workVisa: z.boolean().optional(),
//         workVisaType: z.string().optional(),
//         language: z.string().optional(),
//         availableStartDate: z.string().optional(),
//         note: z.string().optional(),
//         relocate: z.boolean().optional(),
//         userId: z.string(),
//       })
//       .parse(req.body);

//     const application = await prisma.application.create({
//       data: {
//         id: nano_id(),
//         user: { connect: {

//          } },

//         // organization: { connect: { id: req.organizationId } },
//         ...body,
//       },
//       select: ApplicationSelect,
//     });

//     res.json(application);
//   })
// );

// // update listing
// router.put(
//   "/:applicationId",
//   handler(async (req: AdminRequest, res) => {
//     const data = z
//       .object({
//         firstName: z.string(),
//         lastName: z.string(),
//         //email: z.string(),
//         phone: z.string().optional(),
//         //gender: z.string().optional(),
//         address: z.string().optional(),
//         city: z.string().optional(),
//         state: z.string().optional(),
//         zip: z.string().optional(),
//         usCitizen: z.boolean().optional(),
//         workVisa: z.boolean().optional(),
//         workVisaType: z.string().optional(),
//         language: z.string().optional(),
//         availableStartDate: z.string().optional(),
//         note: z.string().optional(),
//         relocate: z.boolean().optional(),
//         userId: z.string(),
//       })
//       .parse(req.body);

//     const { applicationId } = z
//       .object({
//         applicationId: z.string(),
//       })
//       .parse(req.params);

//     const application = await prisma.application.update({
//       where: {
//         id: applicationId,
//         // organizationId: req.organizationId,
//       },
//       data,
//     });

//     res.json(application);
//   })
// );

// //Delete Listing
// router.delete(
//   "/:applicationId",
//   handler(async (req: AdminRequest, res) => {
//     const { applicationId } = z
//       .object({
//         applicationId: z.string(),
//       })
//       .parse(req.params);

//     const application = await prisma.application.delete({
//       where: {
//         id: applicationId,
//         // organizationId: req.organizationId,
//       },
//       select: ApplicationSelect,
//     });

//     res.json(application);
//   })
// );
export default router;
