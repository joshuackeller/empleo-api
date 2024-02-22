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

export const BaseClientListingSelect: Prisma.ListingSelect = {
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

export const BaseUserSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

export const ClientListingSelect: Prisma.ListingSelect = {
  ...BaseClientListingSelect,
};

export const BaseClientApplicationSelect: Prisma.ApplicationSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zip: true,
  usCitizen: true,
  workVisa: true,
  workVisaType: true,
  language: true,
  availableStartDate: true,
  relocate: true,
  note: true,
  createdAt: true,
  updatedAt: true,
};

export const ClientApplicationSelect: Prisma.ApplicationSelect = {
  ...BaseClientApplicationSelect,
};

export const UserSelect: Prisma.UserSelect = {
  ...BaseUserSelect,
};
