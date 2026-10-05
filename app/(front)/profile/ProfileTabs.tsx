'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';

import AddressList from '@/components/profile/AddressList';
import Overview from '@/components/profile/Overview';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';
import ProfileForm from './Form';

type UserSummary = {
  _id?: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' as RequestCredentials });
  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error('Request failed');
    err.status = res.status;
    err.info = text;
    throw err;
  }
  return res.json();
};

export default function ProfileTabs() {
  const { data: session, update: updateSession } = useSession();
  const { data: user, error: userError } = useSWR<UserSummary>(
    '/api/auth/profile',
    fetcher,
    {
      shouldRetryOnError: (err: any) => err?.status !== 401,
      dedupingInterval: 5000,
    },
  );

  const [tab, setTab] = useState<'overview' | 'identity' | 'addresses' | 'loyalty' | 'help'>(
    'overview',
  );

  const { data: addresses, mutate: mutateAddresses } = useSWR<any>(
    '/api/auth/profile/addresses',
    fetcher,
  );

  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'identity', label: 'Profile', icon: 'person' },
    { id: 'addresses', label: 'Addresses', icon: 'location_on' },
    { id: 'loyalty', label: 'Loyalty', icon: 'auto_fix_high' },
    { id: 'help', label: 'Help', icon: 'help_center' },
  ];

  if (!user && !userError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="font-headline text-2xl text-primary italic animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  if (userError && (userError as any).status === 401) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center bg-surface-container-low rounded-lg border border-outline-variant/10">
        <h2 className="font-headline text-4xl text-primary italic mb-6">Sign In Required</h2>
        <p className="text-secondary font-body mb-12 opacity-70 max-w-sm">
          Please sign in to access your profile.
        </p>
        <Link 
          href="/signin" 
          className="bg-primary text-on-primary px-12 py-5 rounded-lg font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-primary-container transition-all shadow-xl shadow-primary/20"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-6">warning</span>
        <h2 className="font-headline text-3xl text-primary italic mb-4">Failed to Load Profile</h2>
        <p className="text-secondary font-body mb-8 opacity-70 max-w-sm">
          Something went wrong loading your profile. Please check your connection and try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary/5 text-primary border border-primary/20 px-8 py-4 rounded-lg font-bold tracking-widest uppercase text-[10px] hover:bg-primary hover:text-white transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12">
      {/* Navigation Sub-header */}
      <div className="flex overflow-x-auto gap-8 border-b border-outline-variant/10 pb-6 mb-12 scrollbar-hide no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-2 whitespace-nowrap px-2 ${
              tab === t.id ? 'text-primary' : 'text-secondary opacity-40 hover:opacity-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 'overview' && (
            <div className="w-full">
              <Overview
                user={user as any}
                onUpdateAvatar={async (url) => {
                  // SWR revalidate so Overview re-renders with new avatar
                  const { mutate } = await import('swr'); 
                  mutate('/api/auth/profile');
                  // Update the session token so the header avatar also refreshes instantly
                  await updateSession({
                    ...session,
                    user: { ...session?.user, avatar: url }
                  });
                }}
                onSaveAbout={async (payload) => {
                  const res = await fetch('/api/auth/profile', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  if (!res.ok) throw new Error('Failed to update');
                  
                  // Update session to reflect changes in UI
                  await updateSession({
                    ...session,
                    user: { ...session?.user, ...payload }
                  });

                  const { mutate } = await import('swr'); 
                  mutate('/api/auth/profile');
                }}
              />
            </div>
          )}

          {tab === 'identity' && (
            <div className="max-w-4xl mx-auto">
              <ProfileForm />
            </div>
          )}

          {tab === 'addresses' && (
            <div className="max-w-5xl mx-auto space-y-12">
               <div className="mb-8">
                 <h2 className="font-headline text-4xl text-primary italic">Saved Addresses</h2>
                 <p className="text-secondary font-body text-sm opacity-60 mt-2">Manage your delivery addresses for faster checkout.</p>
               </div>
               <div className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/10">
                 <AddressList addresses={addresses} reload={() => mutateAddresses()} />
               </div>
            </div>
          )}

          {tab === 'loyalty' && (
            <div className="max-w-5xl mx-auto">
               <LoyaltyDashboard />
            </div>
          )}

          {tab === 'help' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h2 className="font-headline text-4xl text-primary italic mb-8">Support</h2>
                <div className="space-y-6">
                   <div className="p-8 bg-surface-container-low rounded border border-outline-variant/10">
                      <div className="flex items-center gap-4 mb-4 text-primary">
                        <span className="material-symbols-outlined">mail</span>
                        <p className="font-label font-bold text-sm">EMAIL US</p>
                      </div>
                      <a href="mailto:aethravia@gmail.com" className="font-body text-sm text-on-surface hover:text-primary transition-colors">aethravia@gmail.com</a>
                      <p className="text-[10px] text-secondary opacity-50 mt-2 italic">We typically respond within 24 hours.</p>
                   </div>
                   <div className="p-8 bg-surface-container-low rounded border border-outline-variant/10">
                      <div className="flex items-center gap-4 mb-4 text-primary">
                        <span className="material-symbols-outlined">shopping_bag</span>
                        <p className="font-label font-bold text-sm">RETURNS & REFUNDS</p>
                      </div>
                      <p className="font-body text-sm text-on-surface">For returns, please contact us via email with your order number.</p>
                      <Link href="/returns" className="text-[10px] text-primary font-bold uppercase tracking-widest mt-3 block hover:underline">View Return Policy →</Link>
                   </div>
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="font-headline text-2xl text-secondary italic mb-8">FAQs</h2>
                <div className="space-y-4">
                  {[
                    { q: 'How do I change my password?', a: 'Go to the Profile tab and enter a new password in the password fields, then click Update Record.' },
                    { q: 'Where are my orders?', a: 'Visit Order History from the top-right menu to see all your past and current orders.' },
                    { q: 'How do I start a return?', a: 'Email us at aethravia@gmail.com with your order number and reason for return.' }
                  ].map((faq, i) => (
                    <div key={i} className="p-6 bg-surface-container-high/40 rounded border border-outline-variant/5">
                      <p className="font-label font-bold text-[10px] text-primary uppercase tracking-widest mb-2">{faq.q}</p>
                      <p className="font-body text-xs text-secondary leading-relaxed opacity-70">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
