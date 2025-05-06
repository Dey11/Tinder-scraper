import axios from "axios";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

export const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export async function processAndStoreImage(
  imageUrl: string,
  filename: string,
  userId: string
): Promise<string> {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);

  const key = `faces/${userId}/${filename}.jpg`;
  await s3.send(
    new PutObjectCommand({
      Bucket: "faces",
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    })
  );

  return `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`;
}
