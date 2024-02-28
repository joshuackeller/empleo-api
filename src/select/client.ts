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
      url: true,
    },
  },
  headerFont: true,
  bodyFont: true,
  primaryColor: true,
  secondaryColor: true,
  accentColor: true,
  layout: true,
  description: true,
  longDescription: true,
  createdAt: true,
  updatedAt: true,
};

export const OrganizationSelect: Prisma.OrganizationSelect = {
  ...BaseOrganizationSelect,
};

export const BaseListingSelect: Prisma.ListingSelect = {
  id: true,
  jobTitle: true,
  location: true,
  employmentType: true,
  salaryRange: true,
  jobDescription: true,
  jobRequirements: true,
  createdAt: true,
  updatedAt: true,
};

export const ListingSelect: Prisma.ListingSelect = {
  ...BaseListingSelect,
};

export const BaseUserSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

export const BaseApplicationSelect: Prisma.ApplicationSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  availableStartDate: true,
  note: true,
  resume: {
    select: {
      url: true,
    },
  },
  coverLetter: {
    select: {
      url: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};

export const ApplicationSelect: Prisma.ApplicationSelect = {
  ...BaseApplicationSelect,
};

export const UserSelect: Prisma.UserSelect = {
  ...BaseUserSelect,
};
