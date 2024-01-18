import { admin, organization, user } from "../../drizzle/schema";

export const BaseSelfSelect = {
  id: admin.id,
  firstName: admin.firstName,
  lastName: admin.lastName,
  email: admin.email,
  emailConfirmed: admin.emailConfirmed,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
};

export const SelfSelect = {
  ...BaseSelfSelect,
};

export const BaseAdminSelect = {
  id: admin.id,
  firstName: admin.firstName,
  lastName: admin.lastName,
  email: admin.email,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
};
export const AdminSelect = {
  ...BaseAdminSelect,
};

export const BaseOrganizationSelect = {
  id: organization.id,
  title: organization.title,
  createdAt: organization.createdAt,
  updatedAt: organization.updatedAt,
};
export const OrganizationSelect = {
  ...BaseOrganizationSelect,
};

export const BaseUserSelect = {
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  emailConfirmed: user.emailConfirmed,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};
export const UserSelect = {};
