const RedisKeys = {
  adminOrganization: (adminId: string, organizationId: string) =>
    `${adminId}-${organizationId}`,
  organizationBySlug: (organizationSlug: string) => organizationSlug,
};

export default RedisKeys;
