const CreateRedisAdminOrgKey = (adminId: string, organizationId: string) => {
  return `${adminId}-${organizationId}`;
};

export default CreateRedisAdminOrgKey;
