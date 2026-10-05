'use client';

import { motion } from 'framer-motion';
import { Share2, Users, Gift, Copy, Check, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReferralPage() {
  const { data: session } = useSession();
  const { data: referralData, isLoading } = useSWR(session ? '/api/user/referral' : null, fetcher);
  const { data: settingsData } = useSWR('/api/referral-settings', fetcher);
  const [copied, setCopied] = useState(false);

  const settings = settingsData || {};
  const referrerReward = settings.rewardType === 'percent'
    ? `${settings.rewardValue || 10}% of their first order`
    : `₹${settings.rewardValue || 500}`;
  const minOrderLabel = settings.minOrderValue ? `₹${settings.minOrderValue}` : '₹1,000';

  const referralCode = referralData?.referralCode || '';
  const referralLink = referralData?.referralLink ||
    `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralCode}`;

  const joinedCount = referralData?.referralHistory?.length || 0;
  const totalEarned = (referralData?.referralHistory || []).reduce((s: number, h: any) => s + (h.reward || 0), 0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Check out Aethravia for premium skincare. Use my referral link and get a special welcome reward: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareGeneric = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Aethravia',
          text: 'Experience premium skincare with my referral link!',
          url: referralLink,
        });
      } catch {}
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <div className="fixed inset-0 noise-overlay z-0 pointer-events-none opacity-40"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-24">
        <div className="mb-20 text-center">
           <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-primary mb-4">Heritage Expansion</p>
           <h1 className="font-headline text-5xl md:text-8xl text-on-surface italic mb-8">Invite to the Circle</h1>
           <p className="text-secondary font-body max-w-3xl mx-auto opacity-70 leading-relaxed text-lg">
             True wisdom is meant to be shared. Invite your circle to experience Aethravia,
             and both of you shall be rewarded with artisanal gifts and credits for your next ritual.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Main Referral Card */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/40 backdrop-blur-2xl border border-primary/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <h2 className="text-3xl font-headline text-primary italic mb-6">Your Sacred Path</h2>
                <p className="text-secondary opacity-70 mb-10 leading-relaxed">
                  Share this unique path with your companions. When they join the heritage and complete their first ritual acquisition,
                  you&apos;ll receive <strong>{referrerReward}</strong> in Vault Credits.
                </p>

                <div className="space-y-6">
                  {session ? (
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/5 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 w-full">
                         <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/40 mb-2">Unique Referral Link</p>
                         <p className="font-mono text-sm text-primary truncate">{referralLink}</p>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="w-full md:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary-container transition-all active:scale-95"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy Path'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/5 text-center">
                      <p className="text-secondary/60 mb-4">Sign in to get your unique referral link</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={shareGeneric}
                      className="bg-[#1877F2] text-white p-4 rounded-2xl flex items-center justify-center hover:opacity-90 transition-all"
                      aria-label="Share"
                    >
                      <Share2 size={20} />
                    </button>
                    <button
                      onClick={shareWhatsApp}
                      className="bg-[#25D366] text-white p-4 rounded-2xl flex items-center justify-center hover:opacity-90 transition-all"
                      aria-label="Share on WhatsApp"
                    >
                      <Send size={20} />
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="bg-surface-container-high text-primary p-4 rounded-2xl flex items-center justify-center hover:opacity-90 transition-all border border-primary/5"
                      aria-label="Copy link"
                    >
                      <Users size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
               <div className="bg-white/20 backdrop-blur-md border border-primary/5 p-8 rounded-[2rem] text-center">
                 <Users size={32} className="text-primary/40 mx-auto mb-4" strokeWidth={1} />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/50 mb-1">Referred</p>
                 <p className="text-3xl font-headline text-primary italic">{joinedCount}</p>
               </div>
               <div className="bg-white/20 backdrop-blur-md border border-primary/5 p-8 rounded-[2rem] text-center">
                 <Gift size={32} className="text-primary/40 mx-auto mb-4" strokeWidth={1} />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/50 mb-1">Earned</p>
                 <p className="text-3xl font-headline text-primary italic">₹{totalEarned}</p>
               </div>
               <div className="bg-white/20 backdrop-blur-md border border-primary/5 p-8 rounded-[2rem] text-center">
                 <Sparkles size={32} className="text-primary/40 mx-auto mb-4" strokeWidth={1} />
                 <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/50 mb-1">Credits</p>
                 <p className="text-3xl font-headline text-primary italic">₹{referralData?.referralCredits || 0}</p>
               </div>
            </div>

            {/* Referral History */}
            {referralData?.referralHistory?.length > 0 && (
              <div className="mt-12 bg-white/20 backdrop-blur-md border border-primary/5 rounded-[2rem] p-8">
                <h3 className="text-lg font-headline text-primary italic mb-4">Referral History</h3>
                <div className="divide-y divide-primary/10">
                  {referralData.referralHistory.slice().reverse().map((entry: any, idx: number) => (
                    <div key={idx} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {entry.referredUserEmail || 'A friend'}
                        </p>
                        <p className="text-xs text-secondary/60">
                          {entry.date ? new Date(entry.date).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          }) : ''}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">+₹{entry.reward}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* How it Works Side */}
          <div className="lg:col-span-5 space-y-12">
            <h3 className="text-3xl font-headline text-primary italic">The Three Pillars of Sharing</h3>

            <div className="space-y-10">
              <div className="flex gap-8 relative">
                <div className="absolute left-6 top-12 bottom-0 w-[1px] bg-primary/10"></div>
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-headline italic text-xl shrink-0 z-10 shadow-lg">1</div>
                <div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">Extend the Invite</h4>
                  <p className="text-xs text-secondary opacity-60 leading-relaxed">
                    Send your unique path to your circle. They&apos;ll receive an exclusive welcome when they join.
                  </p>
                </div>
              </div>

              <div className="flex gap-8 relative">
                <div className="absolute left-6 top-12 bottom-0 w-[1px] bg-primary/10"></div>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline italic text-xl shrink-0 z-10">2</div>
                <div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">First Ritual</h4>
                  <p className="text-xs text-secondary opacity-60 leading-relaxed">
                    Once they complete their first acquisition of over {minOrderLabel}, their journey is truly initiated.
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline italic text-xl shrink-0 z-10">3</div>
                <div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-2">Mutual Reward</h4>
                  <p className="text-xs text-secondary opacity-60 leading-relaxed">
                    You&apos;ll receive {referrerReward} in Vault Credits, and they&apos;ll get a complimentary artisanal sample kit with their next order.
                  </p>
                </div>
              </div>
            </div>

            {!session && (
              <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 text-center">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">Join the Circle to Start</p>
                <Link
                  href="/signin?callbackUrl=/referral"
                  className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[9px] hover:scale-105 transition-all shadow-md"
                >
                  Initiate Session
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
