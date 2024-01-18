import { Prisma } from "@prisma/client";

export const BaseSelfSelect: Prisma.AdminSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  email_confirmed: true,
  created_at: true,
  updated_at: true,
};
export const SelfSelect: Prisma.AdminSelect = {
  ...BaseSelfSelect,
};

export const BaseAdminSelect: Prisma.AdminSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  created_at: true,
  updated_at: true,
};
export const AdminSelect: Prisma.AdminSelect = {
  ...BaseAdminSelect,
};

export const BaseOrganizationSelect: Prisma.OrganizationSelect = {
  id: true,
  title: true,
  created_at: true,
  updated_at: true,
};
export const OrganizationSelect: Prisma.OrganizationSelect = {
  ...BaseOrganizationSelect,
};

export const BaseUserSelect: Prisma.UserSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  email_confirmed: true,
  created_at: true,
  updated_at: true,
};
export const UserSelect: Prisma.UserSelect = {
  ...BaseUserSelect,
};

export const BaseListingSelect: Prisma.ListingSelect = {
  id: true,
  published: true,
  job_title: true,
  location: true,
  employment_type: true,
  salary_range: true,
  job_description: true,
  job_requirements: true,
  organization_id: true,
  organization: true,
  created_at: true,
  updated_at: true,
};
export const ListingSelect: Prisma.ListingSelect = {
  ...BaseListingSelect,
};
