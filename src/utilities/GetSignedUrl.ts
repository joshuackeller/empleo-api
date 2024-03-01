import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const GetSignedUrl = async (s3Key: string) => {
  return await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: process.env.FILE_S3_BUCKET_NAME,
      Key: s3Key,
    }),
    {
      expiresIn: 60 * 60, // 1 hour
    }
  );
};

export default GetSignedUrl;
