import { Prisma } from "@prisma/client";

export const BaseOrganizationSelect: Prisma.OrganizationSelect = {
  id: true,
  title: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
};
export const OrganizationSelect: Prisma.OrganizationSelect = {
  ...BaseOrganizationSelect,
};
