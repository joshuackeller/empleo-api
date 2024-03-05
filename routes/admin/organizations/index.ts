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
import { Font } from "@prisma/client";
import { Layout } from "@prisma/client";
import axios from "axios";
import UploadToS3 from "../../../src/utilities/UploadToS3";

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
    let {
      title,
      dataUrl,
      dataUrlBanner,
      headerFont,
      bodyFont,
      primaryColor,
      secondaryColor,
      accentColor,
      layout,
      description,
      longDescription,
      eeocEnabled,
      veteranEnabled,
      disabilityEnabled,
      raceEnabled,
      genderEnabled,
    } = z
      .object({
        title: z.string().optional(),
        dataUrl: z.string().optional(),
        dataUrlBanner: z.string().optional(),
        headerFont: z.enum([
          Object.values(Font)[0],
          ...Object.values(Font).splice(1),
        ]),
        bodyFont: z.enum([
          Object.values(Font)[0],
          ...Object.values(Font).splice(1),
        ]),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        layout: z.enum([
          Object.values(Layout)[0],
          ...Object.values(Layout).splice(1),
        ]),
        description: z.string().optional(),
        longDescription: z.string().optional(),
        eeocEnabled: z.boolean().optional(),
        veteranEnabled: z.boolean().optional(),
        disabilityEnabled: z.boolean(),
        raceEnabled: z.boolean().optional(),
        genderEnabled: z.boolean().optional(),
      })
      .parse(req.body);

    const { organizationId } = z
      .object({
        organizationId: z.string(),
      })
      .parse(req.params);

    let imageId;
    if (dataUrl) {
      imageId = nano_id();
      const imageKey = `${organizationId}/logos/${imageId}`;
      await UploadToS3(dataUrl, imageKey);
    }

    let imageIdBanner;
    if (dataUrlBanner) {
      imageIdBanner = nano_id();
      const imageKey = `${organizationId}/banners/${imageIdBanner}`;

      await UploadToS3(dataUrlBanner, imageKey);
    }

    if (typeof eeocEnabled === "boolean" && eeocEnabled === false) {
      veteranEnabled = false;
      disabilityEnabled = false;
      raceEnabled = false;
      genderEnabled = false;
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
        headerFont,
        bodyFont,
        primaryColor,
        secondaryColor,
        accentColor,
        layout,
        description,
        longDescription,
        eeocEnabled,
        veteranEnabled,
        disabilityEnabled,
        raceEnabled,
        genderEnabled,
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
