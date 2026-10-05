import { S3Client } from '@aws-sdk/client-s3';

// Hardcoded for VPS to ensure images load correctly in browser
const MINIO_PUBLIC_ENDPOINT = 'http://195.35.22.92:9010';
const MINIO_INTERNAL_ENDPOINT = process.env.NODE_ENV === 'production' ? 'http://minio:9000' : 'http://localhost:9010';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'admin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'securepassword123';
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'aethravia';
const MINIO_REGION = process.env.MINIO_REGION || 'us-east-1';

export const s3Client = new S3Client({
  region: MINIO_REGION,
  endpoint: MINIO_INTERNAL_ENDPOINT,
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export const BUCKET_NAME = MINIO_BUCKET_NAME;

// Utility to generate a public URL for an uploaded file
export function getPublicUrl(key: string) {
  // Use Next.js rewrite to proxy the image over HTTPS
  return `/storage/${key}`;
}
