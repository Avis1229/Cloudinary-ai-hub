import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinaryPipeline } from '@/lib/cloudinaryUpload';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGES = 5;
const MAX_VIDEOS = 2;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov', 'video/x-matroska'];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFiles = formData.getAll('files');
    const videoFiles = formData.getAll('videos');

    if (imageFiles.length === 0 && videoFiles.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${MAX_IMAGES} images allowed` }, { status: 400 });
    }

    if (videoFiles.length > MAX_VIDEOS) {
      return NextResponse.json({ error: `Maximum ${MAX_VIDEOS} videos allowed` }, { status: 400 });
    }

    const uploadedImageUrls: string[] = [];
    const uploadedVideoUrls: string[] = [];

    // Process review image uploads via AI Pipeline (Background removal + Auto-compression)
    for (const file of imageFiles) {
      if (typeof file === 'string') continue;

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid image type: ${file.type}` }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: 'Each image must be under 10MB' }, { status: 400 });
      }

      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadToCloudinaryPipeline(buffer, file.name, 'review', {
        resourceType: 'image',
      });

      uploadedImageUrls.push(result.url);
    }

    // Process review video uploads via AI Pipeline (9:16 Vertical framing + Auto-compression)
    for (const file of videoFiles) {
      if (typeof file === 'string') continue;

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid video type: ${file.type}` }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_VIDEO_SIZE) {
        return NextResponse.json({ error: 'Each video must be under 100MB' }, { status: 400 });
      }

      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadToCloudinaryPipeline(buffer, file.name, 'review', {
        resourceType: 'video',
      });

      uploadedVideoUrls.push(result.url);
    }

    return NextResponse.json({ urls: uploadedImageUrls, videoUrls: uploadedVideoUrls });
  } catch (err: any) {
    console.error('Review Cloudinary upload failed:', err);
    return NextResponse.json(
      { error: `Upload failed: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
