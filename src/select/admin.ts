import { Prisma } from "@prisma/client";

export const BaseSelfSelect: Prisma.AdminSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  emailConfirmed: true,
  createdAt: true,
  updatedAt: true,
};
export const SelfSelect: Prisma.AdminSelect = {
  ...BaseSelfSelect,
};

export const BaseAdminSelect: Prisma.AdminSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};
export const AdminSelect: Prisma.AdminSelect = {
  ...BaseAdminSelect,
};

export const BaseOrganizationSelect: Prisma.OrganizationSelect = {
  id: true,
  title: true,
  slug: true,
  logo: {
    select: {
      id: true,
      url: true,
    },
  },
  banner: {
    select: {
      id: true,
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

  eeocEnabled: true,
  veteranEnabled: true,
  disabilityEnabled: true,
  raceEnabled: true,
  genderEnabled: true,

  createdAt: true,
  updatedAt: true,
};
export const OrganizationSelect: Prisma.OrganizationSelect = {
  ...BaseOrganizationSelect,
};

export const BaseUserSelect: Prisma.UserSelect = {
  id: true,
  // firstName: true,
  // lastName: true,
  email: true,
  emailConfirmed: true,
  createdAt: true,
  updatedAt: true,
};
export const UserSelect: Prisma.UserSelect = {
  ...BaseUserSelect,
};

export const BaseListingSelect: Prisma.ListingSelect = {
  id: true,
  published: true,
  jobTitle: true,
  location: true,
  employmentType: true,
  salaryRange: true,
  jobDescription: true,
  shortDescription: true,
  jobRequirements: true,
  linkedInUrlEnabled: true,
  noteEnabled: true,
  resumeEnabled: true,
  coverLetterEnabled: true,
  availableStartDateEnabled: true,
  phoneEnabled: true,
  addressEnabled: true,
  cityEnabled: true,
  stateEnabled: true,
  zipEnabled: true,
  usAuthorizedEnabled: true,
  createdAt: true,
  updatedAt: true,
};
export const ListingSelect: Prisma.ListingSelect = {
  ...BaseListingSelect,
};

export const BaseFileSelect: Prisma.FileSelect = {
  id: true,
  name: true,
  s3Key: true,
  createdAt: true,
  updatedAt: true,
};

export const FileSelect: Prisma.FileSelect = {
  ...BaseFileSelect,
};

export const BaseApplicationSelect: Prisma.ApplicationSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  status: true,
  availableStartDate: true,
  note: true,
  resume: { select: FileSelect },
  coverLetter: {
    select: FileSelect,
  },
  createdAt: true,
  updatedAt: true,
  userId: true,
};

export const ApplicationSelect: Prisma.ApplicationSelect = {
  ...BaseApplicationSelect,
};

export const BaseApplicationNoteSelect: Prisma.ApplicationNoteSelect = {
  id: true,
  text: true,
  admin: { select: BaseAdminSelect },
  createdAt: true,
  updatedAt: true,
};

export const ApplicationNoteSelect: Prisma.ApplicationNoteSelect = {
  ...BaseApplicationNoteSelect,
};
