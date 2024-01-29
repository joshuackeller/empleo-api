import axios from "axios";

const ZONE_ID = "c11923ebaf17530fa70d380c70a941ee";

export const AddDomainToProject = async (slug: string) => {
  const [cloudflareResponse] = await Promise.all([
    // Add CNAME record to Cloudflare
    axios.post(
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
    ),

    // Add Domain to vercel project
    axios.post(
      "https://api.vercel.com/v10/projects/empleo-client-portal/domains",
      {
        name: `${slug}.empleo.work`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      },
    ),
  ]);

  return {
    dnsRecordId: cloudflareResponse?.data?.result?.id,
  };
};

export const RemoveDomainFromProject = async (
  slug: string,
  dnsRecordId: string,
) => {
  await Promise.all([
    axios.delete(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${dnsRecordId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
      },
    ),

    axios.delete(
      `https://api.vercel.com/v9/projects/empleo-client-portal/domains/${slug}.empleo.work`,

      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      },
    ),
  ]);
};

export const UpdateProjectDomain = async (
  previousSlug: string,
  newSlug: string,
  dnsRecordId: string,
) => {
  await Promise.all([
    // Add CNAME record to Cloudflare
    axios.patch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${dnsRecordId}`,
      {
        name: newSlug,
        content: "cname.vercel-dns.com",
        proxied: false,
        type: "CNAME",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
      },
    ),
    axios.delete(
      `https://api.vercel.com/v9/projects/empleo-client-portal/domains/${previousSlug}.empleo.work`,

      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      },
    ),
    // Add Domain to vercel project
    axios.post(
      "https://api.vercel.com/v10/projects/empleo-client-portal/domains",
      {
        name: `${newSlug}.empleo.work`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      },
    ),
  ]);
};
