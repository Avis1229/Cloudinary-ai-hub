'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type SiteSettings = {
  supportPhone: string;
  whatsappNumber: string;
  supportEmail: string;
  shopAddress: string;
};

const DEFAULTS: SiteSettings = {
  supportPhone: '+91-XXXX-XXXXXX',
  whatsappNumber: '+91-XXXX-XXXXXX',
  supportEmail: 'aethravia@gmail.com',
  shopAddress: '',
};

export function useSiteSettings() {
  const { data, error, isLoading } = useSWR<SiteSettings>('/api/settings', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });

  return {
    settings: data || DEFAULTS,
    isLoading,
    error,
  };
}
