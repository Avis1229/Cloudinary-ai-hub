import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinaryPipeline } from '@/lib/cloudinaryUpload';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinaryPipeline(buffer, file.name, 'product', {
      resourceType: 'image',
    });

    return NextResponse.json({
      url: result.url,
      original_url: result.original_url,
      public_id: result.public_id,
    });
  } catch (err: any) {
    console.error('Cloudinary banner upload error:', err);
    return NextResponse.json(
      { error: `Cloudinary Banner Upload Error: ${err.message || err.toString()}` },
      { status: 500 }
    );
  }
}
