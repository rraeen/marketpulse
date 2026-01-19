import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type R2Env = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  publicBaseUrl?: string;
};

function getR2Env(): R2Env | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY;
  const secretAccessKey = process.env.R2_SECRET_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    // Optional override if you have a public custom domain / r2.dev URL
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  };
}

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client | null {
  const env = getR2Env();
  if (!env) return null;

  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: "auto",
    endpoint: env.endpoint,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
    // Helps with some S3-compatible providers (including R2)
    forcePathStyle: true,
  });

  return cachedClient;
}

export function getR2PublicUrl(key: string): string {
  const env = getR2Env();
  if (!env) {
    throw new Error("R2 is not configured. Missing required R2_* environment variables.");
  }

  // IMPORTANT:
  // `*.r2.cloudflarestorage.com` is the S3 API endpoint and is NOT a guaranteed public URL.
  // For direct public URLs you must provide a public base URL (custom domain or r2.dev).
  if (!env.publicBaseUrl) {
    throw new Error(
      "R2_PUBLIC_BASE_URL is required to generate a public URL. " +
        "Otherwise use the app proxy URL: /api/uploads/<key>."
    );
  }

  const base = env.publicBaseUrl.replace(/\/+$/, "");

  const normalizedKey = key.replace(/^\/+/, "");
  return `${base}/${normalizedKey}`;
}

export async function uploadToR2(params: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<{ url: string; key: string; bucket: string }> {
  const env = getR2Env();
  if (!env) {
    throw new Error("R2 is not configured. Missing required R2_* environment variables.");
  }

  const client = getR2Client();
  if (!client) {
    throw new Error("Failed to initialize R2 client.");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: env.bucketName,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl,
    })
  );

  // Always return an app-hosted URL. This works whether the bucket is public or private.
  return { url: `/api/uploads/${params.key}`, key: params.key, bucket: env.bucketName };
}

export async function getObjectFromR2(key: string): Promise<{
  body: unknown;
  contentType?: string;
  cacheControl?: string;
}> {
  const env = getR2Env();
  if (!env) {
    throw new Error("R2 is not configured. Missing required R2_* environment variables.");
  }

  const client = getR2Client();
  if (!client) {
    throw new Error("Failed to initialize R2 client.");
  }

  const result = await client.send(
    new GetObjectCommand({
      Bucket: env.bucketName,
      Key: key,
    })
  );

  return {
    body: result.Body,
    contentType: result.ContentType,
    cacheControl: result.CacheControl,
  };
}

