import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const publicDomain = process.env.R2_PUBLIC_DOMAIN;

if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicDomain) {
  throw new Error("R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN are required");
}

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  requestHandler: {
    requestTimeout: 10_000,
  },
});

export async function uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );
  return `${publicDomain}/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export function extractKeyFromUrl(url: string): string | null {
  if (!url.startsWith(publicDomain!)) return null;
  return url.slice(publicDomain!.length + 1);
}
