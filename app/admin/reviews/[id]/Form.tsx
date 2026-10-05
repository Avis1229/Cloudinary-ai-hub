'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

type FormValues = {
  name: string;
  quote: string;
  role?: string;
  city?: string;
  rating?: number;
  published?: boolean;
  order?: number;
};

export default function ReviewEditForm({ id }: { id: string }) {
  const isNew = id === 'new';
  // Only fetch if not new
  const { data, error, isLoading } = useSWR(isNew ? null : `/api/admin/reviews/${id}`);
  
  // Also fetch products for the dropdown if we're creating new
  const { data: productsData } = useSWR(isNew ? '/api/admin/reviews' : null);
  
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (isNew) {
      setValue('rating', 5);
      setValue('published', true);
      setValue('order', 0);
      return;
    }
    if (!data) return;
    setValue('name', data.name);
    setValue('quote', data.quote);
    setValue('role', data.role || '');
    setValue('city', data.city || '');
    setValue('rating', data.rating ?? 5);
    setValue('published', data.published ?? true);
    setValue('order', data.order ?? 0);
    if (data.productId) setValue('productId' as any, data.productId);
    setImages(data.images || []);
    setVideos(data.videos || []);
  }, [data, setValue, isNew]);

  if (error) return <div className="text-error">{error.message || 'Failed to load'}</div>;
  if (!isNew && (isLoading || !data)) return <div className="animate-pulse space-y-3"><div className="h-8 w-40 bg-base-200 rounded" /><div className="h-64 bg-base-200 rounded" /></div>;

  // ── Image upload ───────────────────────────────────────────
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 5 - images.length;
    if (remaining <= 0) return toast.error('Maximum 5 images allowed');
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append('files', f));
      const res = await fetch('/api/reviews/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const result = await res.json();
      setImages((prev) => [...prev, ...(result.urls || [])]);
      toast.success(`${(result.urls || []).length} image(s) uploaded`);
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Video upload ───────────────────────────────────────────
  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 2 - videos.length;
    if (remaining <= 0) return toast.error('Maximum 2 videos allowed');
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append('videos', f));
      const res = await fetch('/api/reviews/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Video upload failed');
      const result = await res.json();
      setVideos((prev) => [...prev, ...(result.videoUrls || [])]);
      toast.success(`${(result.videoUrls || []).length} video(s) uploaded`);
    } catch (e: any) {
      toast.error(e.message || 'Video upload failed');
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeVideo = (idx: number) => setVideos((prev) => prev.filter((_, i) => i !== idx));

  // ── Save ───────────────────────────────────────────────────
  const onSubmit = async (form: FormValues & { productId?: string }) => {
    setSaving(true);
    const toastId = toast.loading(isNew ? 'Creating review...' : 'Saving...');
    try {
      const url = isNew ? '/api/admin/reviews' : `/api/admin/reviews/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const payload = { ...form, images, videos };
      if (!payload.productId) delete payload.productId; // don't send empty string

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to save');
      toast.success(isNew ? 'Review created' : 'Review updated', { id: toastId });
      router.push('/admin/reviews');
    } catch (e: any) {
      toast.error(e?.message || 'Update failed', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isNew ? 'Add Review' : 'Edit Review'}</h1>
        <Link href="/admin/reviews" className="btn btn-ghost btn-sm">
          ← Back to Reviews
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Form (2/3) ────────────────────────────── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="md:flex">
              <label className="label md:w-1/4" htmlFor="name">Reviewer Name</label>
              <div className="md:w-3/4">
                <input
                  id="name"
                  className="input input-bordered w-full"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>

            {/* Quote */}
            <div className="md:flex">
              <label className="label md:w-1/4" htmlFor="quote">Review Text</label>
              <div className="md:w-3/4">
                <textarea
                  id="quote"
                  rows={4}
                  className="textarea textarea-bordered w-full"
                  {...register('quote', { required: 'Review text is required' })}
                />
                {errors.quote && <p className="text-error text-sm mt-1">{errors.quote.message}</p>}
              </div>
            </div>

            {/* Rating */}
            <div className="md:flex">
              <label className="label md:w-1/4" htmlFor="rating">Rating</label>
              <div className="md:w-3/4">
                <input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  className="input input-bordered w-32"
                  {...register('rating', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Role */}
            <div className="md:flex">
              <label className="label md:w-1/4" htmlFor="role">Role</label>
              <div className="md:w-3/4">
                <input id="role" className="input input-bordered w-full max-w-md" {...register('role')} />
              </div>
            </div>

            {/* City */}
            <div className="md:flex">
              <label className="label md:w-1/4" htmlFor="city">City</label>
              <div className="md:w-3/4">
                <input id="city" className="input input-bordered w-full max-w-md" {...register('city')} />
              </div>
            </div>

            {/* Published */}
            <div className="md:flex">
              <label className="label md:w-1/4" htmlFor="published">Published</label>
              <div className="md:w-3/4">
                <input id="published" type="checkbox" className="toggle" {...register('published')} />
              </div>
            </div>

            {/* Product Link (only really changeable easily here if new, or you could allow changing it anytime. Let's allow anytime) */}
            <div className="md:flex">
              <label className="label md:w-1/4" htmlFor="productId">Linked Product</label>
              <div className="md:w-3/4">
                <select id="productId" className="select select-bordered w-full max-w-md" {...register('productId' as any)}>
                  <option value="">General Review (No specific product)</option>
                  {(isNew ? productsData?.products : [data?.product].filter(Boolean)).map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                  {/* If editing, we just show the linked product to avoid complex re-fetching. But for new, we show all */}
                  {!isNew && data?.product && (
                     <option value="" disabled className="italic">To link a different product, recreate the review.</option>
                  )}
                </select>
                {isNew && <p className="text-xs opacity-60 mt-1">If linking to a product, this review will appear on its page.</p>}
              </div>
            </div>

            {/* ── Images ──────────────────────────────────── */}
            <div className="md:flex">
              <label className="label md:w-1/4">Images</label>
              <div className="md:w-3/4 space-y-3">
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {images.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group w-24 h-24 rounded-lg overflow-hidden border border-base-300"
                      >
                        <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-error text-error-content rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 5 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="file-input file-input-bordered file-input-sm w-full max-w-md"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={uploading}
                    />
                    <p className="text-xs opacity-60 mt-1">
                      {uploading ? 'Uploading...' : `Up to ${5 - images.length} more image(s). Max 5MB each.`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Videos ──────────────────────────────────── */}
            <div className="md:flex">
              <label className="label md:w-1/4">Videos</label>
              <div className="md:w-3/4 space-y-3">
                {videos.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {videos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group w-32 h-20 rounded-lg overflow-hidden border border-base-300 bg-black"
                      >
                        <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="material-symbols-outlined text-white text-xl drop-shadow">play_circle</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-error text-error-content rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      multiple
                      className="file-input file-input-bordered file-input-sm w-full max-w-md"
                      onChange={(e) => handleVideoUpload(e.target.files)}
                      disabled={uploading}
                    />
                    <p className="text-xs opacity-60 mt-1">
                      {uploading ? 'Uploading...' : `Up to ${2 - videos.length} more video(s). MP4/MOV up to 50MB.`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-base-200">
              <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                {saving && <span className="loading loading-spinner loading-sm" />}
                Save Changes
              </button>
              <Link href="/admin/reviews" className="btn">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* ── Sidebar Info (1/3) ─────────────────────────── */}
        {!isNew && (
        <div className="space-y-6">
          {/* User Info Card */}
          {data.user ? (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5 space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Reviewer Profile</h3>
                <div className="flex items-center gap-3">
                  {data.user.avatar ? (
                    <img src={data.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                      {data.user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{data.user.name}</p>
                    <p className="text-xs opacity-70">{data.user.email}</p>
                  </div>
                </div>

                {data.user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base opacity-50">phone</span>
                    <span>{data.user.phone}</span>
                  </div>
                )}

                <Link
                  href={`/admin/users/${data.user._id}`}
                  className="btn btn-sm btn-outline btn-primary w-full mt-2"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  View Full Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Reviewer</h3>
                <p className="text-sm opacity-50">No linked user account (admin-created review)</p>
              </div>
            </div>
          )}

          {/* Product Info Card */}
          {data.product ? (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5 space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Product</h3>
                <div className="flex items-center gap-3">
                  {data.product.image && (
                    <img
                      src={data.product.image}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border border-base-300"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{data.product.name}</p>
                    <p className="text-xs opacity-50">/{data.product.slug}</p>
                  </div>
                </div>
                <Link
                  href={`/admin/products/${data.product._id}`}
                  className="btn btn-sm btn-outline w-full mt-2"
                >
                  View Product
                </Link>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Product</h3>
                <p className="text-sm opacity-50">General review (not product-specific)</p>
              </div>
            </div>
          )}

          {/* Meta Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 space-y-2">
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-60">Status</span>
                  <span className={`badge badge-sm ${data.published ? 'badge-success' : 'badge-ghost'}`}>
                    {data.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Verified</span>
                  <span>{data.isVerifiedPurchase ? '✓ Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Images</span>
                  <span>{images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-60">Videos</span>
                  <span>{videos.length}</span>
                </div>
                {data.createdAt && (
                  <div className="flex justify-between">
                    <span className="opacity-60">Created</span>
                    <span>
                      {new Date(data.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {data.updatedAt && (
                  <div className="flex justify-between">
                    <span className="opacity-60">Updated</span>
                    <span>
                      {new Date(data.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
