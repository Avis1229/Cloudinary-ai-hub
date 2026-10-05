'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComplementaryCarousel({ relatedProducts }: { relatedProducts: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!relatedProducts || relatedProducts.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container-low rounded-lg border border-dashed border-outline-variant/30">
        <span className="material-symbols-outlined text-4xl text-outline-variant/50 mb-3">inventory_2</span>
        <p className="text-on-surface-variant font-body">Exploring more treasures soon...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <div className="space-y-2">
          <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">Complete the Set</h3>
          <h2 className="font-headline text-4xl text-primary italic">Complementary Products</h2>
        </div>
        {relatedProducts.length > 3 && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:border-primary hover:bg-surface-container-low transition-all"
            >
              <ChevronLeft size={20} className="text-primary" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:border-primary hover:bg-surface-container-low transition-all"
            >
              <ChevronRight size={20} className="text-primary" />
            </button>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {relatedProducts.map((relProduct: any) => (
          <div key={relProduct._id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] shrink-0 snap-start">
            <Link href={`/product/${relProduct.slug}`} className="group cursor-pointer block">
              <div className="bg-surface-container-low aspect-[3/4] rounded-lg overflow-hidden mb-6 relative border border-outline-variant/10">
                <Image
                  src={relProduct.image}
                  alt={relProduct.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h4 className="font-headline text-2xl text-primary italic">{relProduct.name}</h4>
              <p className="text-on-surface-variant font-body text-sm mt-1">{relProduct.category}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-medium">{formatPrice(relProduct.price)}</span>
                <span className="text-[10px] font-label uppercase tracking-widest text-primary border-b border-primary/20 pb-1">
                  Explore Details
                </span>
              </div>
            </Link>
          </div>
        ))}
        
        {/* Visual Placeholder/Info Card if fewer than 3 products */}
        {relatedProducts.length > 0 && relatedProducts.length < 3 && (
          <div className="hidden lg:flex w-full lg:w-[calc(33.333%-1.33rem)] shrink-0 bg-secondary-container/20 rounded-lg p-12 flex-col justify-center space-y-6">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <h4 className="font-headline text-3xl text-primary italic leading-tight">The Sustainable Standard</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Every bottle is infinitely recyclable glass, and every purchase contributes to reforestation programs in the Western Ghats.
            </p>
            <Link href="/about" className="text-[10px] font-label uppercase tracking-widest text-primary underline underline-offset-8">
              Our Journey
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
