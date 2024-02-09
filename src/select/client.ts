import { Prisma } from "@prisma/client";

export const BaseOrganizationSelect: Prisma.OrganizationSelect = {
  id: true,
  title: true,
  slug: true,
  logo: {
    select: {
      url: true,
    },
  },
  banner: { 
    select: {
      url: true
    }
  },
  headerFont: true,
  bodyFont: true,
  primaryColor: true,
  secondaryColor: true,
  accentColor: true,
  description: true,
  longDescription: true,
  createdAt: true,
  updatedAt: true,
};
export const OrganizationSelect: Prisma.OrganizationSelect = {
  ...BaseOrganizationSelect,
};

export const BaseUserSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};
export const UserSelect: Prisma.UserSelect = {
  ...BaseUserSelect,
};
