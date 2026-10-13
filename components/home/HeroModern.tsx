'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';

export default function HeroModern() {
  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden bg-[#FAF7F2] py-12 md:py-16">
      {/* Background artwork */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero-luxury.jpg"
          alt="BeautyP Artisanal Skin Rituals"
          fill
          priority
          className="object-cover object-right lg:object-center"
          sizes="100vw"
        />
        {/* Soft elegant gradient overlay ensuring left-side text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 md:via-[#FAF7F2]/75 to-transparent/10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full relative z-10">
        <div className="max-w-xl lg:max-w-2xl">
          {/* Subtitle tag */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 text-[#556B4E] text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase"
          >
            <span>ANCIENT WISDOM</span>
            <span className="text-[#556B4E]/60 text-xs">✦</span>
            <span>MODERN CARE</span>
          </motion.div>

          {/* Editorial Headline */}
          <motion.h1 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-[#2D1220] tracking-tight mb-6"
          >
            The Earth’s <br />
            <span className="italic font-normal text-primary">Ancient Wisdom.</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="font-sans text-base sm:text-lg text-[#5A4B51] max-w-lg mb-8 leading-relaxed font-normal"
          >
            Crafted from the raw heritage of Multani Mitti and Reetha. 
            A sensory return to the grounded elegance of artisanal skin rituals.
          </motion.p>

          {/* Pill CTA Button */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mb-12 sm:mb-16"
          >
            <Link 
              href="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 sm:px-10 sm:py-4.5 bg-primary hover:bg-[#5E283F] text-white font-sans text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full shadow-[0_10px_25px_rgba(74,30,48,0.25)] hover:shadow-[0_15px_30px_rgba(74,30,48,0.35)] transform hover:-translate-y-0.5 transition-all"
            >
              <span>DIVE INTO THE EARTH&apos;S WISDOM</span>
              <span className="text-base transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          {/* 3 Frosted Pill Feature Badges */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_2px_12px_rgba(45,18,32,0.04)]">
              <div className="w-8 h-8 rounded-full bg-[#556B4E]/10 flex items-center justify-center text-[#556B4E] flex-shrink-0">
                <Leaf size={16} />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-xs text-[#2D1220]">100%</p>
                <p className="text-[10px] text-[#614F57] font-medium">Natural Actives</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_2px_12px_rgba(45,18,32,0.04)]">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-xs text-[#2D1220]">No Harsh</p>
                <p className="text-[10px] text-[#614F57] font-medium">Chemicals</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_2px_12px_rgba(45,18,32,0.04)]">
              <div className="w-8 h-8 rounded-full bg-[#C899A6]/20 flex items-center justify-center text-[#9E6777] flex-shrink-0">
                <Heart size={16} />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-xs text-[#2D1220]">Gentle</p>
                <p className="text-[10px] text-[#614F57] font-medium">On Skin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
