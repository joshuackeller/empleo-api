import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";

const s3 = new S3({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const UploadToS3 = async (
  dataUrl: string,
  organizationId: string,
  fileKey: string
) => {
  // Extract Mime and Buffer from dataUrl
  const mime = dataUrl?.split(":")[1].split(";")[0];
  const base64 = dataUrl?.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  fileKey = `/${organizationId}${fileKey}`;

  // Upload the image to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || "empleo-images",
      Body: buffer,
      ContentType: mime,
      Key: fileKey,
    })
  );
};

export default UploadToS3;
