import { PutObjectCommand } from '@aws-sdk/client-s3';

import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/lib/models/UserModel';
import { s3Client, BUCKET_NAME, getPublicUrl } from '@/lib/s3Client';

export const runtime = 'nodejs';

const toObjectIdString = (val: any) => {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (typeof val?.toHexString === 'function') return val.toHexString();
  return undefined;
};
const isValidObjectIdString = (s?: string) => !!s && /^[a-fA-F0-9]{24}$/.test(s);

export const POST = auth(async (req: any) => {
  try {
    if (!req.auth) {
      return Response.json({ message: 'unauthorized' }, { status: 401 });
    }
    const uid = toObjectIdString(req.auth.user?.id || req.auth.user?._id);
    if (!isValidObjectIdString(uid)) {
      return Response.json({ message: 'Invalid user id' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return Response.json({ message: 'File is required' }, { status: 400 });
    if (!file.type?.startsWith('image/')) {
      return Response.json({ message: 'Only image files are allowed' }, { status: 400 });
    }
    const maxBytes = 4 * 1024 * 1024; // 4MB
    if (file.size > maxBytes) {
      return Response.json({ message: 'Image must be 4MB or smaller' }, { status: 400 });
    }

    // Upload to MinIO using the project's existing S3 client
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileKey = `avatars/${uid}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    }));

    // getPublicUrl returns /storage/... which is proxied by Next.js rewrites to MinIO
    const publicUrl = getPublicUrl(fileKey);

    await dbConnect();
    await UserModel.findByIdAndUpdate(uid, { avatar: publicUrl });

    return Response.json({ url: publicUrl }, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/auth/profile/avatar error:', err);
    return Response.json({ message: err?.message || 'Internal Server Error' }, { status: 500 });
  }
});
