import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME, getPublicUrl } from '@/lib/s3Client';

export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  try {
    const { folder, public_id, fileType } = await req.json();
    const fileKey = `${folder}/${public_id}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType || 'application/octet-stream',
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const secure_url = getPublicUrl(fileKey);

    return NextResponse.json({
      presignedUrl,
      secure_url,
      public_id
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}) as any;
