import prisma from "../../../src/utilities/prisma";
import express from "express";
import handler from "../../../src/middleware/handler";
import { AdminRequest } from "../../../src/utilities/interfaces";
import AuthMiddleware from "../../../src/middleware/admin/AuthMiddleware";
import { z } from "zod";
import nano_id from "../../../src/utilities/nano_id";
import { OrganizationSelect } from "../../../src/select/admin";
import { OrganizationSelect as ClientOrganizationSelect } from "../../../src/select/client";
import { Redis } from "@upstash/redis";
import RedisKeys from "../../../src/utilities/RedisKeys";
import {
  AddDomainToProject,
  UpdateProjectDomain,
} from "../../../src/utilities/domains";
import { ClientError } from "../../../src/utilities/errors";
import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import bodyParser from "body-parser";
import { Font } from "@prisma/client";
import axios from "axios";

const s3 = new S3({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const redis = new Redis({
  url: "https://us1-endless-lemur-38129.upstash.io",
  token: process.env.UPSTASH_TOKEN || "",
});

const router = express.Router();

router.use(AuthMiddleware);

router.get(
  "/:organizationId",
  handler(async (req: AdminRequest, res) => {
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
  handler(async (req: AdminRequest, res) => {
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
  handler(async (req: AdminRequest, res) => {
    const { title, slug, cloudflareToken } = z
      .object({
        title: z.string(),
        slug: z.string().refine((value) => /^[a-z0-9-]+$/.test(value), {
          message:
            "Slug can only contain lowercase letters, numbers, and dashes",
        }),
        cloudflareToken: z.string({
          required_error: "No Cloudflare Token Provided",
        }),
      })
      .parse(req.body);

    const formData = new FormData();
    formData.append("secret", process.env.CAPTCHA_SECRET_KEY!);
    formData.append("response", cloudflareToken);
    formData.append("remoteip", req.ip!);

    const { data: response } = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      formData
    );

    if (response.success !== true) {
      throw new ClientError("Invalid token. Refresh Page.");
    }
    const domain = await AddDomainToProject(slug);
    const organization = await prisma.organization.create({
      data: {
        id: nano_id(),
        title,
        slug,
        dnsRecordId: domain.dnsRecordId,
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
      clientOrganization
    );

    res.json(organization);
  })
);

router.put(
  "/:organizationId",
  handler(async (req: AdminRequest, res) => {
    const {
      title,
      dataUrl,
      dataUrlBanner,
      headerFont,
      bodyFont,
      primaryColor,
      secondaryColor,
      accentColor,
      description,
      longDescription,
    } = z
      .object({
        title: z.string().optional(),
        dataUrl: z.string().optional(),
        dataUrlBanner: z.string().optional(),
        headerFont: z.string().optional(),
        bodyFont: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        description: z.string().optional(),
        longDescription: z.string().optional(),
      })
      .parse(req.body);

    const { organizationId } = z
      .object({
        organizationId: z.string(),
      })
      .parse(req.params);

    // Header font -- Convert headerFont to EnumFontFieldUpdateOperationsInput
    const prismaHeaderFont = headerFont as Font;

    // Body font -- Convert bodyFont to EnumFontFieldUpdateOperationsInput
    const prismaBodyFont = bodyFont as Font;

    let imageId;
    if (dataUrl) {
      // Extract Mime and Buffer from dataUrl
      const mime = dataUrl?.split(":")[1].split(";")[0];
      const base64 = dataUrl?.split(",")[1];
      const buffer = Buffer.from(base64, "base64");

      imageId = nano_id();
      // Unique key for the s3 bucket upload -- need to change nano_id to be the image id that was created from a nano id
      const imageKey = `${organizationId}/logos/${imageId}`;

      // Upload the image to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Body: buffer,
          ContentType: mime,
          Key: imageKey,
        })
      );
    }

    let imageIdBanner;
    if (dataUrlBanner) {
      // Extract Mime and Buffer from dataUrl
      const mime = dataUrlBanner?.split(":")[1].split(";")[0];
      const base64 = dataUrlBanner?.split(",")[1];
      const buffer = Buffer.from(base64, "base64");

      imageIdBanner = nano_id();
      // Unique key for the s3 bucket upload -- need to change nano_id to be the image id that was created from a nano id
      const imageKey = `${organizationId}/banners/${imageIdBanner}`;

      // Upload the image to S3
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Body: buffer,
          ContentType: mime,
          Key: imageKey,
        })
      );
    }

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
        headerFont: prismaHeaderFont,
        bodyFont: prismaBodyFont,
        primaryColor,
        secondaryColor,
        accentColor,
        description,
        longDescription,
        logo: imageId
          ? {
              create: {
                id: imageId,
                organizationId: organizationId,
                url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${organizationId}/logos/${imageId}`,
              },
            }
          : undefined,
        banner: imageIdBanner
          ? {
              create: {
                id: imageIdBanner,
                organizationId: organizationId,
                url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${organizationId}/banners/${imageIdBanner}`,
              },
            }
          : undefined,
      },
      select: OrganizationSelect,
    });

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
      clientOrganization
    );

    res.json(organization);
  })
);

router.put(
  "/:organizationId/slug",
  handler(async (req: AdminRequest, res) => {
    const { slug } = z
      .object({
        slug: z.string().refine((value) => /^[a-z0-9-]+$/.test(value), {
          message:
            "Slug can only contain lowercase letters, numbers, and dashes",
        }),
      })
      .parse(req.body);

    const { organizationId } = z
      .object({
        organizationId: z.string(),
      })
      .parse(req.params);

    const [currentOrganizationData, anyOrganizationWithSlug] =
      await prisma.$transaction([
        prisma.organization.findUniqueOrThrow({
          where: {
            id: organizationId,
            admins: {
              some: {
                id: req.adminId,
              },
            },
          },
          select: {
            dnsRecordId: true,
            ...OrganizationSelect,
          },
        }),
        prisma.organization.findFirst({
          where: {
            slug: slug,
          },
        }),
      ]);

    if (!!anyOrganizationWithSlug) {
      throw new ClientError("Subdomain already in use");
    }

    if (currentOrganizationData.slug !== slug) {
      let domain;
      if (!!currentOrganizationData.dnsRecordId) {
        await UpdateProjectDomain(
          currentOrganizationData.slug,
          slug,
          currentOrganizationData.dnsRecordId
        );
      } else {
        domain = await AddDomainToProject(slug);
      }
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
          slug,
          dnsRecordId: !!domain?.dnsRecordId ? domain.dnsRecordId : undefined,
        },
        select: OrganizationSelect,
      });

      redis.del(RedisKeys.organizationBySlug(currentOrganizationData.slug));

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
        clientOrganization
      );
      res.json(organization);
    } else {
      delete (currentOrganizationData as any).dnsRecordId;
      res.json(currentOrganizationData);
    }
  })
);

export default router;
