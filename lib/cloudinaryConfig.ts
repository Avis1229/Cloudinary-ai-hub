import { v2 as cloudinary } from 'cloudinary';

export const ROOT_FOLDER = (process.env.CLOUDINARY_FOLDER || 'aetheravia').trim().replace(/^\/+|\/+$/g, '');
export const ENABLE_AUTO_TAGGING = process.env.ENABLE_AUTO_TAGGING !== 'false';
export const ENABLE_MODERATION = process.env.ENABLE_MODERATION === 'true';

export type PipelineType = 'product' | 'review' | 'doc' | 'photo' | 'video';

export interface PipelineDefinition {
  key: PipelineType;
  label: string;
  goal: string;
  resourceType: 'image' | 'video';
  folder: string;
  buildTransformation: (options?: { resourceType?: 'image' | 'video' }) => any[];
}

export function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️ Cloudinary credentials missing in process.env');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function getCloudName() {
  return cloudinary.config().cloud_name;
}

export const PIPELINES: Record<string, PipelineDefinition> = {
  product: {
    key: 'product',
    label: 'Product & Banner Photos',
    goal: 'Smart crop 1:1 square for products with AI subject positioning and auto compression.',
    resourceType: 'image',
    folder: `${ROOT_FOLDER}/products`,
    buildTransformation: () => [
      { crop: 'thumb', gravity: 'auto', aspect_ratio: '1:1', width: 800, height: 800, zoom: 1.5 },
      { fetch_format: 'auto', quality: 'auto:eco' },
    ],
  },
  review: {
    key: 'review',
    label: 'Customer Review Media',
    goal: 'AI background removal and compression for review images, 9:16 smart vertical crop for review videos.',
    resourceType: 'image',
    folder: `${ROOT_FOLDER}/reviews`,
    buildTransformation: (options) => {
      if (options?.resourceType === 'video') {
        return [
          { crop: 'fill', gravity: 'auto', aspect_ratio: '9:16', width: 1080, height: 1920 },
          { fetch_format: 'auto', quality: 'auto' },
        ];
      }
      return [
        { effect: 'background_removal' },
        { fetch_format: 'auto', quality: 'auto' },
      ];
    },
  },
  photo: {
    key: 'photo',
    label: 'General Photos',
    goal: 'Finds subject and crops to 1:1 with f_auto, q_auto.',
    resourceType: 'image',
    folder: `${ROOT_FOLDER}/photos`,
    buildTransformation: () => [
      { crop: 'fill', gravity: 'auto', aspect_ratio: '1:1', width: 800, height: 800 },
      { fetch_format: 'auto', quality: 'auto' },
    ],
  },
  video: {
    key: 'video',
    label: 'Vertical Video Optimization',
    goal: 'Reframes video to 9:16 vertical format.',
    resourceType: 'video',
    folder: `${ROOT_FOLDER}/videos`,
    buildTransformation: () => [
      { crop: 'fill', gravity: 'auto', aspect_ratio: '9:16', width: 1080, height: 1920 },
      { fetch_format: 'auto', quality: 'auto' },
    ],
  },
};
