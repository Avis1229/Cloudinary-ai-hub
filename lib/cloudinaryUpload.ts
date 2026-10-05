import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { initCloudinary, PIPELINES, PipelineType, ENABLE_AUTO_TAGGING, ENABLE_MODERATION, ROOT_FOLDER } from './cloudinaryConfig';

/**
 * Server-side AI Media Pipeline Runner:
 * 1. Initializes Cloudinary SDK
 * 2. Streams buffer to Cloudinary Upload API
 * 3. Constructs AI transformed delivery URL (smart crop, bg removal, f_auto, q_auto)
 * 4. Measures performance and returns optimized URL payload
 */
export async function uploadToCloudinaryPipeline(
  buffer: Buffer,
  filename: string,
  pipelineType: PipelineType = 'product',
  options: { resourceType?: 'image' | 'video'; customTags?: string[] } = {}
) {
  initCloudinary();

  const pipeline = PIPELINES[pipelineType] || PIPELINES.product;
  const resourceType = options.resourceType || pipeline.resourceType;
  const targetFolder = `${ROOT_FOLDER}/${pipelineType}s`;

  // 1. Upload untouched buffer to Cloudinary storage
  const uploadedResult = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: resourceType,
      folder: targetFolder,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      filename_override: filename.replace(/[^\w.\- ]+/g, '_').slice(0, 100),
      context: `pipeline=${pipelineType}|source=aetheravia|uploaded_at=${new Date().toISOString()}`,
      ...(ENABLE_MODERATION && resourceType === 'image' && { moderation: 'aws_rek' }),
    };

    if (options.customTags && options.customTags.length > 0) {
      uploadOptions.tags = options.customTags;
    } else if (ENABLE_AUTO_TAGGING) {
      uploadOptions.categorization = 'google_tagging';
      uploadOptions.auto_tagging = 0.7;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload stream failed'));
        }
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });

  // 2. Build delivery transformation steps
  const transformationSteps = pipeline.buildTransformation({ resourceType });

  // 3. Generate AI delivery URL
  const optimizedUrl = cloudinary.url(uploadedResult.public_id, {
    resource_type: resourceType,
    type: 'upload',
    version: uploadedResult.version,
    secure: true,
    transformation: transformationSteps,
  });

  return {
    url: optimizedUrl,
    original_url: uploadedResult.secure_url,
    public_id: uploadedResult.public_id,
    original_size_bytes: buffer.byteLength,
    pipeline: pipelineType,
    resource_type: resourceType,
    format: uploadedResult.format,
    width: uploadedResult.width,
    height: uploadedResult.height,
  };
}

/**
 * Client-side utility for components to upload an image to Next.js API route
 */
export async function uploadImage(
  file: File,
  folder = 'products',
  pipelineType: PipelineType = 'product',
  customTags?: string[]
): Promise<{ url: string; original_url: string; public_id: string; original_size_bytes: number; pipeline: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('pipelineType', pipelineType);
  if (customTags && customTags.length > 0) {
    formData.append('customTags', JSON.stringify(customTags));
  }

  const uploadRes = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    throw new Error(errorData.error || 'Cloudinary upload failed');
  }

  const data = await uploadRes.json();
  return data;
}

// Backward compatibility alias
export const uploadToCloudinary = uploadImage;
