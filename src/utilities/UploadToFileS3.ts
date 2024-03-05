import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";

const s3 = new S3({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const UploadToFileS3 = async (dataUrl: string, fileKey: string) => {
  // Extract Mime and Buffer from dataUrl
  const mime = dataUrl?.split(":")[1].split(";")[0];
  const base64 = dataUrl?.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  // Upload the image to S3
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.FILE_S3_BUCKET_NAME,
      Body: buffer,
      ContentType: mime,
      Key: fileKey,
    })
  );
};

export default UploadToFileS3;
