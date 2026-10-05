import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinaryPipeline } from '@/lib/cloudinaryUpload';
import { PipelineType } from '@/lib/cloudinaryConfig';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const pipelineType = (formData.get('pipelineType') as PipelineType) || 'product';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const customTagsStr = formData.get('customTags');
    let customTags: string[] | undefined;
    if (customTagsStr && typeof customTagsStr === 'string') {
      try {
        customTags = JSON.parse(customTagsStr);
      } catch (e) {
        console.error('Failed to parse customTags', e);
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinaryPipeline(buffer, file.name, pipelineType, {
      resourceType: 'image',
      customTags,
    });

    return NextResponse.json({
      url: result.url,
      original_url: result.original_url,
      public_id: result.public_id,
      original_size_bytes: result.original_size_bytes,
      pipeline: result.pipeline,
    });
  } catch (err: any) {
    console.error('Cloudinary admin upload error:', err);
    return NextResponse.json(
      { error: `Cloudinary Upload Error: ${err.message || err.toString()}` },
      { status: 500 }
    );
  }
}
