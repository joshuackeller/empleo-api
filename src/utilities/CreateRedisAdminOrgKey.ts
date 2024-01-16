const CreateRedisAdminOrgKey = (admin_id: string, organization_id: string) => {
  return `${admin_id}-${organization_id}`;
};

export default CreateRedisAdminOrgKey;
