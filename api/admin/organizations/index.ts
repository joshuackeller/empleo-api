import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { EmpleoRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
import { z } from "zod";
import nano_id from "../../../src/utilities/nano_id";
import { OrganizationSelect } from "../../../src/select/admin";
import { OrganizationSelect as ClientOrganizationSelect } from "../../../src/select/client";
import { Redis } from "@upstash/redis";
import RedisKeys from "../../../src/utilities/RedisKeys";
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";

// Load environment variables from .env file
require('dotenv').config();

// Access environment variables
const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const s3BucketName = process.env.S3_BUCKET_NAME;

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

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
  }),
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
  }),
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
    const clientOrganization = await prisma.organization.findUniqueOrThrow({
      where: {
        id: organization.id,
        admins: {
          some: {
            id: req.adminId,
          },
        },
      },
      select: ClientOrganizationSelect,
    });
    redis.set(
      RedisKeys.organizationBySlug(organization.slug),
      clientOrganization,
    );

    res.json(organization);
  }),
);

router.put(
  "/:organizationId",
  handler(async (req: EmpleoRequest, res) => {
    const { title, slug, dataUrl } = z // destructure dataUrl here as well
      .object({
        title: z.string().optional(),
        dataUrl: z.string().optional(), // Include dataUrl in the schema
        slug: z
          .string()
          .refine((value) => /^[a-z0-9-]+$/.test(value), {
            message:
              "Slug can only contain lowercase letters, numbers, and dashes",
          })
          .optional(),
      })
      .parse(req.body);

    const { organizationId } = z
      .object({
        organizationId: z.string(),
      })
      .parse(req.params);

    // Extract Mime and Buffer from dataUrl
    const mime = dataUrl?.split(":")[1].split(";")[0] || null;
    const buffer = dataUrl?.split(",")[1] || null;

    // Unique key for the s3 bucket upload -- need to change nano_id to be the image id that was created from a nano id
    const imageKey = `${organizationId}/logos/${nano_id()}`;


    // // // Upload the image to S3
    // // const s3 = new S3();
    // const { Location } = await s3.send(
    //   new PutObjectCommand({
    //     Bucket: s3BucketName,
    //     Key: s3AccessKey,
    //     Body: buffer,
    //     ContentType: mime,
    //     Key: imageKey,
    //   })
    // );

    const { slug: previousSlug } = await prisma.organization.findUniqueOrThrow({
      where: {
        id: organizationId,
        admins: {
          some: {
            id: req.adminId,
          },
        },
      },
      select: { slug: true },
    });

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
        // logo: {
        //   prisma.image.create({
        //     data: {
        //       id: nano_id(),
        //       url:
        //     },
        //   }),
        // },
        slug,
      },
      select: OrganizationSelect,
    });

    if (previousSlug !== organization.slug) {
      redis.del(RedisKeys.organizationBySlug(previousSlug));
    }
    const clientOrganization = await prisma.organization.findUniqueOrThrow({
      where: {
        id: organizationId,
        admins: {
          some: {
            id: req.adminId,
          },
        },
      },
      select: ClientOrganizationSelect,
    });
    redis.set(
      RedisKeys.organizationBySlug(organization.slug),
      clientOrganization,
    );

    res.json(organization);
  }),
);

export default router;





// ALMOST THERE (MAYBE)
// import prisma from "../../../src/utilities/prisma";
// import express from "express";
// import handler from "../../../src/middleware/handler";
// import { EmpleoRequest } from "../../../src/utilities/interfaces";
// import AuthMiddleware from "../../../src/middleware/AuthMiddleware";
// import { z } from "zod";
// import nano_id from "../../../src/utilities/nano_id";
// import { OrganizationSelect } from "../../../src/select/admin";
// import { OrganizationSelect as ClientOrganizationSelect } from "../../../src/select/client";
// import { Redis } from "@upstash/redis";
// import RedisKeys from "../../../src/utilities/RedisKeys";
// import { Prisma } from "@prisma/client";
// import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
// import { Buffer } from "buffer";

// // Load environment variables from .env file
// require('dotenv').config();

// // Access environment variables
// const s3AccessKey = process.env.S3_ACCESS_KEY;
// const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
// const s3BucketName = process.env.S3_BUCKET_NAME;

// const redis = new Redis({
//   url: "https://us1-endless-lemur-38129.upstash.io",
//   token: process.env.UPSTASH_TOKEN || "",
// });

// const router = express.Router();

// router.use(AuthMiddleware);

// router.get(
//   "/:organizationId",
//   handler(async (req: EmpleoRequest, res) => {
//     const { organizationId } = z
//       .object({
//         organizationId: z.string(),
//       })
//       .parse(req.params);

//     const organization = await prisma.organization.findUniqueOrThrow({
//       where: {
//         id: organizationId,
//         admins: {
//           some: {
//             id: req.adminId,
//           },
//         },
//       },
//       select: OrganizationSelect,
//     });

//     res.json(organization);
//   }),
// );

// router.get(
//   "/",
//   handler(async (req: EmpleoRequest, res) => {
//     const organization = await prisma.organization.findMany({
//       where: {
//         admins: {
//           some: {
//             id: req.adminId,
//           },
//         },
//       },
//       select: OrganizationSelect,
//     });

//     res.json(organization);
//   }),
// );

// router.post(
//   "/",
//   handler(async (req: EmpleoRequest, res) => {
//     const { title, slug } = z
//       .object({
//         title: z.string(),
//         slug: z.string().refine((value) => /^[a-z0-9-]+$/.test(value), {
//           message:
//             "Slug can only contain lowercase letters, numbers, and dashes",
//         }),
//       })
//       .parse(req.body);

//     const organization = await prisma.organization.create({
//       data: {
//         id: nano_id(),
//         title,
//         slug,
//         admins: {
//           connect: {
//             id: req.adminId,
//           },
//         },
//       },
//     });
//     const clientOrganization = await prisma.organization.findUniqueOrThrow({
//       where: {
//         id: organization.id,
//         admins: {
//           some: {
//             id: req.adminId,
//           },
//         },
//       },
//       select: ClientOrganizationSelect,
//     });
//     redis.set(
//       RedisKeys.organizationBySlug(organization.slug),
//       clientOrganization,
//     );

//     res.json(organization);
//   }),
// );

// router.put(
//   "/:organizationId",
//   handler(async (req: EmpleoRequest, res) => {
//     const { title, slug, dataUrl } = z // destructure dataUrl here as well
//       .object({
//         title: z.string().optional(),
//         slug: z
//           .string()
//           .refine((value) => /^[a-z0-9-]+$/.test(value), {
//             message:
//               "Slug can only contain lowercase letters, numbers, and dashes",
//           })
//           .optional(),
//         dataUrl: z.string().optional(), // Include dataUrl in the schema
//       })
//       .parse(req.body);

//       // let imageId
//       // if(dataUrl) {
//       //   imageId = nano_id()
//       //   // Add logic for uploading to S3
//       //   S3.send(new PutObjectCommand({}))
//       // }

//     const { organizationId } = z
//       .object({
//         organizationId: z.string(),
//       })
//       .parse(req.params);

//     const { slug: previousSlug } = await prisma.organization.findUniqueOrThrow({
//       where: {
//         id: organizationId,
//         admins: {
//           some: {
//             id: req.adminId,
//           },
//         },
//       },
//       select: { slug: true },
//     });


//     // Convert the base64 image to a buffer
//     let imageBuffer: Buffer | undefined;
//     if (dataUrl) {
//       const [, base64Data] = dataUrl.split(";base64,");
//       imageBuffer = Buffer.from(base64Data, "base64");

//       // Upload the image to S3
//       const s3 = new S3();
//       await s3.send(
//         new PutObjectCommand({
//           Bucket: s3BucketName,
//           Key: s3AccessKey,
//           Body: imageBuffer,
//         })
//       );
//     }


//     const organization = await prisma.organization.update({
//       where: {
//         id: organizationId,
//         admins: {
//           some: {
//             id: req.adminId,
//           },
//         },
//       },
//       data: {
//         title,
//         slug,
//         imageData: imageBuffer, // Store the image buffer in the database
//       } as Prisma.OrganizationUpdateInput,
//       select: OrganizationSelect,
//     });

//     if (previousSlug !== organization.slug) {
//       redis.del(RedisKeys.organizationBySlug(previousSlug));
//     }
//     const clientOrganization = await prisma.organization.findUniqueOrThrow({
//       where: {
//         id: organizationId,
//         admins: {
//           some: {
//             id: req.adminId,
//           },
//         },
//       },
//       select: ClientOrganizationSelect,
//     });
//     redis.set(
//       RedisKeys.organizationBySlug(organization.slug),
//       clientOrganization,
//     );

//     res.json(organization);
//   }),
// );

// export default router;
