import axios from "axios";

const ZONE_ID = "c11923ebaf17530fa70d380c70a941ee";

export const AddDomainToProject = async (slug: string) => {
  // Add CNAME record to Cloudflare
  const cloudflareResponse = await axios.post(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`,
    {
      name: slug,
      content: "cname.vercel-dns.com",
      proxied: false,
      type: "CNAME",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
      },
    },
  );

  // Add Domain to vercel project
  await axios.post(
    "https://api.vercel.com/v10/projects/empleo-client-portal/domains",
    {
      name: `${slug}.empleo.work`,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    },
  );

  return {
    dnsRecordId: cloudflareResponse?.data?.result?.id,
  };
};

export const RemoveDomainFromProject = async (
  slug: string,
  dnsRecordId: string,
) => {
  await axios.delete(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${dnsRecordId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
      },
    },
  );

  await axios.delete(
    `https://api.vercel.com/v9/projects/empleo-client-portal/domains/${slug}.empleo.work`,

    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      },
    },
  );
};
