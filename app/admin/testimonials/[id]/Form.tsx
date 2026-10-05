'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';

type T = {
  name: string;
  quote: string;
  role?: string;
  city?: string;
  rating?: number;
  published?: boolean;
  order?: number;
};

export default function TestimonialForm({ id }: { id: string }) {
  const { data, error } = useSWR(`/api/admin/testimonials/${id}`);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<T>();

  useEffect(() => {
    if (!data) return;
    setValue('name', data.name);
    setValue('quote', data.quote);
    setValue('role', data.role || '');
    setValue('city', data.city || '');
    setValue('rating', data.rating ?? 5);
    setValue('published', data.published ?? true);
    setValue('order', data.order ?? 0);
    setImages(data.images || []);
    setVideos(data.videos || []);
  }, [data, setValue]);

  if (error) return error.message;
  if (!data) return 'Loading...';

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('files', file));
      const res = await fetch('/api/reviews/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      const urls: string[] = result.urls || [];
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 2 - videos.length;
    if (remaining <= 0) {
      toast.error('Maximum 2 videos allowed');
      return;
    }
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('videos', file));
      const res = await fetch('/api/reviews/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Video upload failed');
      const result = await res.json();
      const urls: string[] = result.videoUrls || [];
      setVideos((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} video(s) uploaded`);
    } catch (e: any) {
      toast.error(e.message || 'Video upload failed');
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeVideo = (idx: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (form: T) => {
    setSaving(true);
    const toastId = toast.loading('Updating...');
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images, videos }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to update');
      toast.success('Testimonial updated', { id: toastId });
      router.push('/admin/testimonials');
    } catch (e: any) {
      toast.error(e?.message || 'Update failed', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className='py-4 text-2xl'>Edit Testimonial</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='name'>Name</label>
          <div className='md:w-4/5'>
            <input id='name' className='input input-bordered w-full max-w-md' {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className='text-error'>{errors.name.message}</p>}
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='role'>Role</label>
          <div className='md:w-4/5'>
            <input id='role' className='input input-bordered w-full max-w-md' {...register('role')} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='city'>City</label>
          <div className='md:w-4/5'>
            <input id='city' className='input input-bordered w-full max-w-md' {...register('city')} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='rating'>Rating</label>
          <div className='md:w-4/5'>
            <input id='rating' type='number' min={1} max={5} className='input input-bordered w-full max-w-md' {...register('rating', { valueAsNumber: true })} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='order'>Order</label>
          <div className='md:w-4/5'>
            <input id='order' type='number' className='input input-bordered w-full max-w-md' {...register('order', { valueAsNumber: true })} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='published'>Published</label>
          <div className='md:w-4/5'>
            <input id='published' type='checkbox' className='toggle' {...register('published')} />
          </div>
        </div>
        <div className='md:flex'>
          <label className='label md:w-1/5' htmlFor='quote'>Quote</label>
          <div className='md:w-4/5'>
            <textarea id='quote' rows={4} className='textarea textarea-bordered w-full max-w-xl' {...register('quote', { required: 'Quote is required' })} />
            {errors.quote && <p className='text-error'>{errors.quote.message}</p>}
          </div>
        </div>

        {/* Image Upload Section */}
        <div className='md:flex'>
          <label className='label md:w-1/5'>Images</label>
          <div className='md:w-4/5 space-y-3'>
            {/* Preview existing images */}
            {images.length > 0 && (
              <div className='flex flex-wrap gap-3'>
                {images.map((url, idx) => (
                  <div key={idx} className='relative group w-24 h-24 rounded-lg overflow-hidden border border-base-300'>
                    <img src={url} alt={`Image ${idx + 1}`} className='w-full h-full object-cover' />
                    <button
                      type='button'
                      onClick={() => removeImage(idx)}
                      className='absolute top-1 right-1 w-5 h-5 bg-error text-error-content rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Upload button */}
            {images.length < 5 && (
              <div>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  multiple
                  className='file-input file-input-bordered file-input-sm w-full max-w-md'
                  onChange={(e) => handleImageUpload(e.target.files)}
                  disabled={uploading}
                />
                <p className='text-xs opacity-60 mt-1'>
                  {uploading ? 'Uploading...' : `Up to ${5 - images.length} more image(s). Max 5MB each.`}
                </p>
              </div>
            )}
          </div>
        </div>

          {/* Video Upload Section */}
          <div className='md:flex'>
            <label className='label md:w-1/5'>Videos</label>
            <div className='md:w-4/5 space-y-3'>
              {videos.length > 0 && (
                <div className='flex flex-wrap gap-3'>
                  {videos.map((url, idx) => (
                    <div key={idx} className='relative group w-32 h-20 rounded-lg overflow-hidden border border-base-300 bg-black'>
                      <video src={url} className='w-full h-full object-cover' muted playsInline preload='metadata' />
                      <button
                        type='button'
                        onClick={() => removeVideo(idx)}
                        className='absolute top-1 right-1 w-5 h-5 bg-error text-error-content rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {videos.length < 2 && (
                <div>
                  <input
                    ref={videoInputRef}
                    type='file'
                    accept='video/mp4,video/webm,video/quicktime'
                    multiple
                    className='file-input file-input-bordered file-input-sm w-full max-w-md'
                    onChange={(e) => handleVideoUpload(e.target.files)}
                    disabled={uploading}
                  />
                  <p className='text-xs opacity-60 mt-1'>
                    {uploading ? 'Uploading...' : `Up to ${2 - videos.length} more video(s). MP4/MOV up to 50MB each.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        <button type='submit' className='btn btn-primary' disabled={saving || uploading}>
          {saving && <span className='loading loading-spinner'></span>}
          Save
        </button>
        <Link href='/admin/testimonials' className='btn ml-3'>Cancel</Link>
      </form>
    </div>
  );
}
