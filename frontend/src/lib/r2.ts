import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function crearClienteR2() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Faltan credenciales de Cloudflare R2");
  }

  return new S3Client({
    region: "auto",
    endpoint: endpoint.replace(/\/plataforma-comics-almacenamiento\/?$/, ""),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function generarPresignedUrl(archivoKey: string, expiraEnSegundos = 600) {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("Falta R2_BUCKET_NAME");
  }

  const cliente = crearClienteR2();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: archivoKey,
  });

  return getSignedUrl(cliente, command, { expiresIn: expiraEnSegundos });
}
