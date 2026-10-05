'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import ReviewForm from './ReviewForm';

type Review = {
  id: string;
  name: string;
  quote: string;
  rating: number;
  role?: string;
  city?: string;
  images?: string[];
  videos?: string[];
  isVerifiedPurchase?: boolean;
  createdAt: string;
};

type Stats = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
};

export default function ProductReviews({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  const fetchReviews = () => {
    setLoading(true);
    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      })
      .catch((e) => console.error('Failed to load reviews:', e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const Stars = ({ value }: { value: number }) => {
    const v = Math.max(0, Math.min(5, Math.round(value)));
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < v ? 'fill-yellow-400 text-yellow-400' : 'text-on-surface-variant/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="mt-20 md:mt-32 max-w-screen-2xl mx-auto px-6 md:px-12">
      <div className="space-y-2 mb-12 text-center md:text-left">
        <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">
          What Our Community Says
        </h3>
        <h2 className="font-headline text-4xl md:text-5xl text-primary italic">
          Ritual Reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Left Column: Form & Stats */}
        <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-24">
          {/* Summary Stats */}
          {stats && stats.totalReviews > 0 ? (
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 text-center">
              <h1 className="text-6xl font-headline text-primary italic mb-2">
                {stats.averageRating.toFixed(1)}
              </h1>
              <div className="flex justify-center mb-2">
                <Stars value={stats.averageRating} />
              </div>
              <p className="text-sm font-label uppercase tracking-widest text-on-surface-variant">
                Based on {stats.totalReviews} reviews
              </p>
            </div>
          ) : (
             <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 text-center">
                <p className="text-on-surface-variant mb-2">No reviews yet.</p>
                <p className="text-sm">Be the first to share your experience!</p>
             </div>
          )}

          {/* Write a Review Form */}
          <div className="bg-surface p-8 rounded-3xl border border-outline-variant/10 shadow-sm">
            <ReviewForm
              productId={productId}
              productName={productName}
              onReviewSubmitted={fetchReviews}
            />
          </div>
        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 p-6 bg-surface-container-lowest rounded-2xl">
                   <div className="h-10 w-10 bg-outline-variant/10 rounded-full"></div>
                   <div className="space-y-3 flex-1">
                      <div className="h-4 bg-outline-variant/10 rounded w-1/4"></div>
                      <div className="h-4 bg-outline-variant/10 rounded w-full"></div>
                      <div className="h-4 bg-outline-variant/10 rounded w-2/3"></div>
                   </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 md:p-8"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <Stars value={review.rating} />
                          <h4 className="font-bold text-on-surface mt-2">{review.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {review.isVerifiedPurchase && (
                              <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-medium">
                                ✓ Verified Buyer
                              </span>
                            )}
                            <span className="text-xs text-on-surface-variant/70">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quote */}
                      <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                        "{review.quote}"
                      </p>
                    </div>

                    {/* Images and Videos */}
                    {((review.images && review.images.length > 0) || (review.videos && review.videos.length > 0)) && (
                      <div className="flex md:flex-col gap-2 shrink-0 md:w-24 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {review.images?.map((src, idx) => (
                          <div
                            key={`img-${idx}`}
                            onClick={() => setSelectedMedia({ type: 'image', url: src })}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-outline-variant/20 block hover:opacity-80 transition-opacity flex-shrink-0 cursor-pointer"
                          >
                            <img
                              src={src}
                              alt={`Review image by ${review.name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}

                        {review.videos?.map((src, idx) => (
                          <div
                            key={`v-${idx}`}
                            className="w-20 md:w-24 rounded-xl overflow-hidden border border-outline-variant/20 flex-shrink-0 relative bg-black group cursor-pointer"
                            style={{ height: '5rem' }}
                            onClick={() => setSelectedMedia({ type: 'video', url: src })}
                          >
                            <video
                              src={src}
                              className="w-full h-full object-cover opacity-80"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                              <span className="material-symbols-outlined text-white text-2xl drop-shadow-lg">play_circle</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Removed duplicate video block since it's merged above */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-on-surface-variant/60">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-50">reviews</span>
              <p className="text-lg">No reviews for this product yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Media Popup Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 animate-in fade-in duration-200"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMedia(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div 
            className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt="Enlarged review media" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-black"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
