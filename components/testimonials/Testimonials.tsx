"use client";

import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Carousel as SCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Testimonial = {
  id: string;
  name: string;
  role?: string;
  rating?: number; // 1..5
  quote: string;
  images?: string[];
  videos?: string[];
  isVerifiedPurchase?: boolean;
};

function Stars({ value = 5 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-1" aria-label={`${v} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < v ? "fill-yellow-400 text-yellow-400" : "text-base-content/30"}`}
        />
      ))}
    </div>
  );
}

export default function Testimonials({
  items,
  title = "What our customers say",
  heading,
  subtitle,
}: {
  items?: Testimonial[];
  title?: string;
  heading?: string;
  subtitle?: string;
}) {
  const [remote, setRemote] = useState<Testimonial[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);

  useEffect(() => {
    if (items && items.length) return; // external data provided
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch('/api/testimonials', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) setRemote(Array.isArray(data?.items) ? data.items : []);
      })
      .catch((e) => !cancelled && setError(e?.message || 'Failed to load'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [items]);

  const data = useMemo(() => {
    if (items && items.length) return items;
    if (remote && remote.length) return remote;
    return [];
  }, [items, remote]);

  // Don't render the section at all if there are no testimonials
  if (!loading && data.length === 0) {
    return null;
  }

  return (
    <section aria-label="Testimonials" className="mt-4 md:mt-10">
      {/* Optional heading rendered inside so it hides when no data */}
      {heading && (
        <div className="space-y-2 mb-8">
          {subtitle && (
            <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">{subtitle}</h3>
          )}
          <h2 className="font-headline text-3xl md:text-4xl text-primary italic text-center">{heading}</h2>
        </div>
      )}
      <div className="mb-3 flex items-end justify-end">
        {loading && <span className="text-xs opacity-60">Loading…</span>}
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
      {data.length > 0 && (
        <SCarousel
          opts={{ loop: false, align: "start", skipSnaps: false }}
          plugins={[Autoplay({ delay: 2800, stopOnMouseEnter: true, stopOnInteraction: true })]}
          className="relative"
        >
          <CarouselContent>
            {data.map((t) => (
              <CarouselItem key={t.id} className="md:basis-1/2 lg:basis-1/3">
                <article 
                  className="card shadow-md transition hover:shadow-xl h-full"
                  style={{ backgroundColor: '#9F5035', color: 'white' }}
                >
                  <div className="card-body gap-3 flex flex-col p-6">
                    {/* Media Gallery at the top */}
                    {((t.images && t.images.length > 0) || (t.videos && t.videos.length > 0)) && (
                      <div className="flex gap-3 mb-2 overflow-x-auto pb-2 snap-x scrollbar-hide -mx-6 px-6">
                        {t.images?.map((src, idx) => (
                          <div
                            key={`img-${idx}`}
                            onClick={() => setSelectedMedia({ type: 'image', url: src })}
                            className="h-40 md:h-48 aspect-[4/5] flex-shrink-0 snap-center rounded-xl overflow-hidden border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                          >
                            <img src={src} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        
                        {t.videos?.map((src, idx) => (
                          <div
                            key={`vid-${idx}`}
                            onClick={() => setSelectedMedia({ type: 'video', url: src })}
                            className="h-40 md:h-48 aspect-[4/5] flex-shrink-0 snap-center rounded-xl overflow-hidden border border-white/20 cursor-pointer relative bg-black group"
                          >
                            <video
                              src={src}
                              className="w-full h-full object-cover opacity-80"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10 drop-shadow-lg">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {typeof t.rating === "number" && <Stars value={t.rating} />}
                    <p className="text-sm md:text-base leading-relaxed opacity-95 flex-grow">&ldquo;{t.quote}&rdquo;</p>

                    <div className="mt-2 border-t border-white/20 pt-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{t.name}</p>
                        {t.role && <p className="text-xs opacity-80">{t.role}</p>}
                      </div>
                      {t.isVerifiedPurchase && (
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 md:-left-4" />
          <CarouselNext className="-right-3 md:-right-4" />
        </SCarousel>
      )}

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
