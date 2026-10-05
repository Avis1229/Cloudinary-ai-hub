"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import Link from 'next/link';
import { 
  Package, 
  Settings, 
  Plus, 
  Mail, 
  MapPin, 
  Activity, 
  ShieldCheck,
  Edit3,
  Calendar,
  Sparkles,
  Zap,
  Clock,
  History,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatPrice } from "@/lib/utils";

type OrderLite = {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  orderItems: Array<{
    name: string;
    image: string;
    slug: string;
    price: number;
  }>;
};

type Props = {
  user?: {
    _id?: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
    loyaltyTier?: string;
    loyaltyPoints?: number;
    personalization?: {
      tags?: string[];
      segments?: string[];
    };
  };
  onUpdateAvatar?: (url: string) => Promise<void>;
  onSaveAbout?: (payload: { name?: string; email?: string; avatar?: string }) => Promise<void>;
};

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => {
  if (!res.ok) return []; // Return empty for errors so SWR doesn't throw on profile subdata
  return res.json();
});

export default function Overview({ user, onUpdateAvatar, onSaveAbout }: Props) {
  const avatar = (user?.avatar && typeof user.avatar === "string" && user.avatar) || null;
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { data: orders } = useSWR<OrderLite[]>('/api/orders/mine', fetcher);
  const latestOrder = orders?.[0];

  // Fetch saved addresses to show the primary delivery location
  const { data: addresses } = useSWR<any[]>('/api/auth/profile/addresses', fetcher);
  const primaryAddress = addresses?.[0];
  
  // Fetch recommended products
  const { data: recommendedData } = useSWR('/api/products/search?sort=rating', fetcher);
  const recommendedProducts = recommendedData?.products?.slice(0, 4) || [];
  

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user?.name, user?.email]);

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error('Image must be 4MB or smaller'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/auth/profile/avatar', { method: 'POST', credentials: 'include', body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (onUpdateAvatar && data?.url) {
        await onUpdateAvatar(data.url);
        toast.success('Avatar synchronized');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-12 animate-reveal">
      {/* Texture Layer (Local to component for better control) */}
      <div className="fixed inset-0 pointer-events-none bg-noise z-0 opacity-10"></div>

      {/* Profile Header */}
      <header className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-8 mb-16">
        <div className="relative group">
          <div 
            className="w-32 h-32 rounded-2xl overflow-hidden bg-surface-container-high border-2 border-primary/10 relative cursor-pointer shadow-2xl transition-all duration-500 hover:border-primary/30 flex items-center justify-center"
            onClick={() => fileRef.current?.click()}
          >
            {avatar ? (
              <Image 
                src={avatar} 
                alt={name} 
                fill 
                className="object-cover grayscale mix-blend-multiply opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
              />
            ) : (
              <span className="text-6xl font-bold text-primary/40 font-headline italic">{name.charAt(0).toUpperCase() || 'U'}</span>
            )}
            {uploading && (
               <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
               </div>
            )}
          </div>
          <div 
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg border-2 border-surface cursor-pointer hover:scale-110 transition-transform"
            onClick={() => fileRef.current?.click()}
          >
            <Edit3 size={18} className="text-on-primary" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
        </div>

        <div className="text-center md:text-left flex-1">
          <h1 className="font-headline text-5xl font-bold text-primary tracking-tight mb-2 italic">{name || 'Heritage Seeker'}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
            <p className="font-body text-secondary text-sm flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
              <ShieldCheck size={14} className="text-primary" />
              <span className="font-bold tracking-widest uppercase text-[10px]">
                {user?.loyaltyTier || 'Novice'} Tier Member • Established {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
              </span>
            </p>
            <div className="flex items-center gap-2 text-primary/60 text-xs font-medium">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Ritual Cycle</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link 
            href="/shop"
            className="bg-primary text-on-primary px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary-container transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
          >
            Start Ritual
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Left Side: Interactive & Stats */}
        <div className="lg:col-span-8 space-y-12">

          {/* Subscription / Recurring Rituals Sanctuary */}
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-headline text-3xl font-bold text-primary tracking-tight italic">Ritual Archive</h2>
                <p className="text-secondary text-sm mt-2 opacity-70">Revisit your most cherished earthen essentials.</p>
              </div>
              <Link href="/shop" className="text-xs font-bold uppercase tracking-[0.2em] text-primary border-b-2 border-primary/10 hover:border-primary transition-all pb-1">
                Refill Essentials
              </Link>
            </div>

            {/* Latest Order Highlight */}
            {latestOrder && latestOrder.orderItems?.length > 0 && (
              <div className="mb-8 bg-primary/5 border border-primary/15 rounded-2xl p-6 hover:shadow-xl transition-all group">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={16} className="text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Latest Order</span>
                  <span className="text-[10px] text-secondary opacity-60 ml-auto">{new Date(latestOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex gap-5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low shadow-inner shrink-0">
                    <Image
                      src={latestOrder.orderItems[0]?.image || '/images/products/spa-arrangement-with-cremes.jpg'}
                      alt={latestOrder.orderItems[0]?.name || 'Order Item'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline font-bold text-on-surface leading-snug truncate">{latestOrder.orderItems[0]?.name || 'Order Item'}</h4>
                    {latestOrder.orderItems.length > 1 && (
                      <p className="text-[10px] text-secondary opacity-60 mt-1">+ {latestOrder.orderItems.length - 1} more item{latestOrder.orderItems.length > 2 ? 's' : ''}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${latestOrder.isDelivered ? 'bg-green-100 text-green-700' : latestOrder.isPaid ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {latestOrder.isDelivered ? 'Delivered' : latestOrder.isPaid ? 'In Transit' : 'Processing'}
                      </span>
                      <span className="text-sm font-bold text-primary">{formatPrice(latestOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previously ordered items as frequent rituals */}
              {(orders || [])
                .filter(order => order.orderItems && order.orderItems.length > 0)
                .slice(1, 3)
                .map((order, idx) => (
                <div key={order._id} className="bg-surface-container-lowest border border-surface-variant/30 rounded-2xl p-6 hover:shadow-xl transition-all group hover:-translate-y-1">
                  <div className="flex gap-5 mb-6">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-surface-container-low shadow-inner">
                      <Image 
                        src={order.orderItems[0]?.image || '/images/products/spa-arrangement-with-cremes.jpg'} 
                        alt={order.orderItems[0]?.name || 'Order Item'} 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      />
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-headline font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{order.orderItems[0]?.name || 'Order Item'}</h4>
                      <p className="text-[10px] text-secondary mt-1.5 italic font-medium uppercase tracking-widest opacity-60">Frequent Ritual</p>
                      <p className="text-xs font-bold text-primary mt-3 flex items-center gap-1.5">
                        <History size={12} />
                        Last: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/product/${order.orderItems[0]?.slug || '#'}`} className="flex-1 text-[10px] font-bold uppercase tracking-[0.2em] py-3 text-center border border-primary/10 rounded-xl hover:bg-primary/5 transition-colors">
                      View Product
                    </Link>
                    <Link href={`/product/${order.orderItems[0]?.slug || '#'}`} className="flex-1 text-[10px] font-bold uppercase tracking-[0.2em] py-3 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-on-primary transition-all text-center">
                      Buy Again
                    </Link>
                  </div>
                </div>
              ))}
              
              {(!orders || orders.filter(o => o.orderItems?.length > 0).length < 2) && (
                <div className="md:col-span-2 py-12 border-2 border-dashed border-primary/10 rounded-3xl flex flex-col items-center justify-center text-center px-8">
                  <Sparkles size={32} className="text-primary/30 mb-4" />
                  <p className="text-secondary font-headline italic text-lg">Establish your first heritage rituals to populate your archive.</p>
                  <Link href="/shop" className="mt-6 text-xs font-bold uppercase tracking-widest text-primary hover:underline">Explore Collection</Link>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Side: Sidebar Stats & Quick Reorder */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Ritual Progress Dashboard */}
          <section className="bg-primary text-on-primary rounded-3xl p-8 shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -bottom-8 -right-8 text-white/10 group-hover:scale-125 transition-transform duration-1000">
              <TrendingUp size={160} />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-xl font-bold mb-8 italic">Archive Statistics</h2>
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-5xl font-headline font-bold">{orders?.length || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mt-1">Total Rituals</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-headline font-bold">{user?.loyaltyPoints || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mt-1">Loyalty Points</p>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Quick Account Details / Your Sanctuary */}
          <section className="bg-surface-container-low/40 rounded-3xl p-8 border border-surface-variant/20">
            <h2 className="font-headline text-xl font-bold text-primary mb-8 italic">Your Sanctuary</h2>
            
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Display Name</label>
                    <input 
                      className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 font-body focus:border-primary transition-colors outline-none text-on-surface"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Primary Email</label>
                    <input 
                      className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 font-body focus:border-primary transition-colors outline-none text-on-surface"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Your email"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 border border-primary/10 rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] text-secondary hover:bg-surface-container-high transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        setSaving(true);
                        try {
                          if (onSaveAbout) await onSaveAbout({ name, email });
                          toast.success('Sanctuary updated');
                          setIsEditing(false);
                        } catch (e: any) {
                          toast.error(e.message || 'Update failed');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-[0.2em] text-[9px] hover:bg-primary-container transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {saving ? 'Syncing...' : 'Save Record'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Artisan Identity</span>
                    <span className="text-on-surface font-headline italic font-bold text-lg flex items-center gap-2">
                      <Edit3 size={16} className="text-primary/40" />
                      {name || 'Unnamed'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Primary Email</span>
                    <span className="text-on-surface font-headline italic font-bold text-lg flex items-center gap-2">
                      <Mail size={16} className="text-primary/40" />
                      {email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-outline opacity-60">Primary Address</span>
                    <span className="text-on-surface font-headline italic font-bold text-lg flex items-center gap-2">
                      <MapPin size={16} className="text-primary/40" />
                      {primaryAddress ? `${primaryAddress.city}, ${primaryAddress.country || 'India'}` : 'Not established'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full mt-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] text-primary hover:bg-primary hover:text-on-primary transition-all shadow-sm flex items-center justify-center gap-3"
                  >
                    <Settings size={14} />
                    Identity Settings
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Curated Product Section */}
      <section className="mt-32 pt-24 border-t border-primary/10 relative">
        <div className="max-w-3xl mb-16 relative z-10">
          <span className="font-bold text-[10px] uppercase tracking-[0.4em] text-primary mb-4 block">Evolved Selection</span>
          <h2 className="font-headline text-5xl font-bold text-on-surface tracking-tighter leading-tight italic">Curated for Your Heritage</h2>
          <p className="mt-6 text-on-surface-variant font-body text-xl max-w-xl leading-relaxed opacity-80">
            Intelligently synchronized based on your recent activity and affinity for earthen rituals.
          </p>
        </div>
        
        {/* Recommended Products dynamically fetched */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {recommendedProducts.map((item: any, i: number) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              className={`group cursor-pointer ${i % 2 !== 0 ? 'lg:mt-12' : ''}`}
            >
              <div className="relative aspect-square mb-6 overflow-hidden bg-surface-container-low rounded-2xl shadow-xl shadow-primary/5">
                <Image 
                  src={item.images?.[0] || item.image || '/images/products/spa-arrangement-with-cremes.jpg'} 
                  alt={item.name} 
                  fill 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                />
                <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <Link href={`/product/${item.slug}`} className="block w-full bg-white/90 backdrop-blur-md py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary shadow-lg text-center">
                    Begin Ritual
                  </Link>
                </div>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-secondary mb-2 opacity-60">{item.category}</p>
              <h3 className="font-headline text-lg lg:text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors italic leading-tight">{item.name}</h3>
              <p className="text-primary text-sm font-bold tracking-widest">{formatPrice(item.price)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Decorative Icons matching the reference style */}
      <style jsx>{`
        .animate-reveal {
          animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Adding a missing ArrowRight icon as it was used in the code but not imported from Lucide
function ArrowRight({ size = 24, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
