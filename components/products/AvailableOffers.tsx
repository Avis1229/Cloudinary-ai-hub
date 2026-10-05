'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

type Offer = {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  comboPrice?: number;
  minimumQuantity?: number;
  couponCode?: string;
  badge?: string;
};

export default function AvailableOffers({ productId }: { productId: string }) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/offers/active?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => setOffers(data.offers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading || offers.length === 0) return null;

  const copyCode = (offer: Offer) => {
    if (!offer.couponCode) return;
    navigator.clipboard.writeText(offer.couponCode);
    setCopiedId(offer._id);
    toast.success(`Code "${offer.couponCode}" copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollContainer = (direction: 'left' | 'right') => {
    const el = document.getElementById('offers-scroll');
    if (!el) return;
    const delta = direction === 'left' ? -280 : 280;
    el.scrollBy({ left: delta, behavior: 'smooth' });
    setScrollPos(el.scrollLeft + delta);
  };

  const getDiscountText = (offer: Offer) => {
    switch (offer.discountType) {
      case 'percentage':
        return `${offer.discountValue}% Off`;
      case 'flat':
        return `₹${offer.discountValue} Off`;
      case 'combo':
        return `${offer.minimumQuantity} Products at ₹${offer.comboPrice}`;
      case 'bogo':
        return 'Buy 1 Get 1 Free';
      case 'freebie':
        return 'Free Product Included';
      default:
        return '';
    }
  };

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-label text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Tag size={14} />
          Available Offers
        </h3>
        {offers.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => scrollContainer('left')}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollContainer('right')}
              className="btn btn-ghost btn-xs btn-circle"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        id="offers-scroll"
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="flex-shrink-0 w-[260px] snap-start border border-primary/15 rounded-xl p-4 bg-surface-container-lowest hover:border-primary/30 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface leading-tight line-clamp-2">
                  {offer.shortDescription || offer.title}
                </p>
                {offer.discountType && (
                  <p className="text-xs text-primary font-medium mt-1">
                    {getDiscountText(offer)}
                  </p>
                )}
              </div>
              {offer.couponCode && (
                <button
                  onClick={() => copyCode(offer)}
                  className="btn btn-ghost btn-xs btn-square opacity-60 group-hover:opacity-100 transition-opacity"
                  aria-label={`Copy code ${offer.couponCode}`}
                  title="Copy coupon code"
                >
                  {copiedId === offer._id ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              {offer.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {offer.badge}
                </span>
              )}
              {offer.couponCode && (
                <span className="text-[10px] font-mono font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                  {offer.couponCode}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
