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
import {
  AddDomainToProject,
  RemoveDomainFromProject,
  UpdateProjectDomain,
} from "../../../src/utilities/domains";
import { ClientError } from "../../../src/utilities/errors";

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
      clientOrganization,
    );

    res.json(organization);
  }),
);

router.put(
  "/:organizationId",
  handler(async (req: EmpleoRequest, res) => {
    const { title } = z
      .object({
        title: z.string().optional(),
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
            id: req.adminId,
          },
        },
      },
      data: {
        title,
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
      clientOrganization,
    );

    res.json(organization);
  }),
);

router.put(
  "/:organizationId/slug",
  handler(async (req: EmpleoRequest, res) => {
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
          currentOrganizationData.dnsRecordId,
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
        clientOrganization,
      );
      res.json(organization);
    } else {
      delete (currentOrganizationData as any).dnsRecordId;
      res.json(currentOrganizationData);
    }
  }),
);

export default router;
