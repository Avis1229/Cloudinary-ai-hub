'use client';

import { useEffect } from 'react';
import { fetchPricingConfig } from '@/lib/hooks/useCartStore';

/**
 * Invisible component that pre-fetches pricing config on mount.
 * This ensures calcPrice() uses admin-configured values instead of defaults.
 */
export default function PricingInitializer() {
  useEffect(() => {
    fetchPricingConfig();
  }, []);
  return null;
}
