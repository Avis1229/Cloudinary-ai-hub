'use client';

import { useState, useRef, useCallback } from 'react';
import { Star, Upload, X, ImageIcon, Video, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

type Props = {
  productId: string;
  productName: string;
  onReviewSubmitted?: () => void;
};

export default function ReviewForm({ productId, productName, onReviewSubmitted }: Props) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [quote, setQuote] = useState('');

  // Images
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Videos
  const [videos, setVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;
  const MAX_VIDEOS = 2;

  // ── Image handlers ──────────────────────────────────────────────
  const addImages = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const toAdd = arr.slice(0, MAX_IMAGES - images.length);
    if (!toAdd.length) return;
    setImages((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Video handlers ──────────────────────────────────────────────
  const addVideos = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('video/'));
    const toAdd = arr.slice(0, MAX_VIDEOS - videos.length);
    if (!toAdd.length) return;

    // Size check: 50MB per video
    for (const v of toAdd) {
      if (v.size > 50 * 1024 * 1024) {
        toast.error(`"${v.name}" exceeds 50MB limit`);
        return;
      }
    }

    setVideos((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
      const url = URL.createObjectURL(file);
      setVideoPreviews((prev) => [...prev, url]);
    });
  }, [videos.length]);

  const removeVideo = (idx: number) => {
    URL.revokeObjectURL(videoPreviews[idx]);
    setVideos((prev) => prev.filter((_, i) => i !== idx));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imgFiles = files.filter((f) => f.type.startsWith('image/'));
    const vidFiles = files.filter((f) => f.type.startsWith('video/'));
    if (imgFiles.length) addImages(imgFiles);
    if (vidFiles.length) addVideos(vidFiles);
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');
    if (!quote.trim()) return toast.error('Please write your review');
    if (quote.trim().length < 20) return toast.error('Review must be at least 20 characters');

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      // Upload images + videos together
      if (images.length > 0 || videos.length > 0) {
        const formData = new FormData();
        formData.append('pipelineType', 'review');
        images.forEach((img) => formData.append('files', img));
        videos.forEach((vid) => formData.append('videos', vid));

        const uploadRes = await fetch('/api/reviews/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Upload failed');
        }
        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls || [];
        videoUrls = uploadData.videoUrls || [];
      }

      // Submit review
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, quote: quote.trim(), images: imageUrls, videos: videoUrls }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit review');
      }

      setSubmitted(true);
      toast.success('Review submitted! Thank you.');
      onReviewSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle className="text-primary" size={48} strokeWidth={1.5} />
        <h3 className="font-headline text-2xl text-primary italic">Thank you for your review!</h3>
        <p className="text-on-surface-variant text-sm">Your experience helps others make informed choices.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-on-surface-variant">Sign in to share your experience with {productName}.</p>
        <Link
          href={`/signin?callbackUrl=/product/${productId}`}
          className="inline-block bg-primary text-on-primary px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Sign in to Review
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="font-headline text-2xl text-primary italic">Write a Review</h3>

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Your Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-on-surface-variant/30'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-primary">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Your Review *
        </label>
        <textarea
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
          placeholder={`Share your experience with ${productName}...`}
          rows={4}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          minLength={20}
          maxLength={1000}
        />
        <p className="text-xs text-on-surface-variant/60 text-right">{quote.length}/1000</p>
      </div>

      {/* Photo + Video Upload */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Add Photos &amp; Videos
        </label>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/20">
                <Image src={src} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video Previews */}
        {videoPreviews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {videoPreviews.map((src, idx) => (
              <div key={idx} className="relative w-32 h-24 rounded-lg overflow-hidden border border-outline-variant/20 bg-black">
                <video
                  src={src}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/40 rounded-full p-1">
                    <Video size={16} className="text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={12} />
                </button>
                <p className="absolute bottom-1 left-1 text-[10px] text-white/80 bg-black/40 px-1 rounded">
                  {videos[idx]?.name?.slice(0, 12)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Drop Zone */}
        {(images.length < MAX_IMAGES || videos.length < MAX_VIDEOS) && (
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            <div className="flex justify-center gap-3 mb-2">
              <ImageIcon className="text-on-surface-variant/40" size={22} />
              <Video className="text-on-surface-variant/40" size={22} />
            </div>
            <p className="text-xs text-on-surface-variant">
              Drag &amp; drop here, or{' '}
              <span
                className="text-primary font-medium cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                add photos
              </span>
              {' '}or{' '}
              <span
                className="text-primary font-medium cursor-pointer"
                onClick={() => videoInputRef.current?.click()}
              >
                add a video
              </span>
            </p>
            <p className="text-[11px] text-on-surface-variant/50 mt-1">
              Photos: JPG, PNG up to 5MB · Videos: MP4, MOV up to 50MB (max {MAX_VIDEOS})
            </p>
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addImages(e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/mov"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addVideos(e.target.files)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !rating || !quote.trim()}
        className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}
