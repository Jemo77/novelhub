import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error("Faltan credenciales de Cloudflare R2 en .env");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT.replace(/\/plataforma-comics-almacenamiento\/?$/, ""),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;