'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01.',
    title: 'Purify with Clay',
    description: 'Apply the Multani Mitti mask to damp skin, allowing the minerals to bind with deep-seated impurities for 10 minutes.'
  },
  {
    number: '02.',
    title: 'Cleanse with Reetha',
    description: 'Rinse with warm water, massaging our Reetha bars to create a light, natural foam that clears the pores.'
  },
  {
    number: '03.',
    title: 'Seal with Moisture',
    description: 'Finish with a restorative body oil to soothe the senses and lock in deep, earthy hydration.'
  }
];

export default function SkincareRitual() {
  return (
    <section className="py-16 md:py-32 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10 md:gap-12">
        <div className="w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-4xl md:text-5xl text-primary leading-tight text-center mb-0"
          >
            The Artisanal Body Ritual
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full relative"
        >
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden group">
            <Image 
              src="/images/3_step.jpeg"
              alt="Artisanal Skincare Ritual"
              width={1600}
              height={900}
              className="w-full h-auto transition-transform duration-1000 group-hover:scale-105 object-cover"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-6 -right-2 md:-right-6 bg-surface-container p-6 md:p-8 shadow-xl z-20 hidden sm:block border border-outline-variant/20 rounded-lg backdrop-blur-sm"
          >
            <p className="font-headline italic text-xl md:text-2xl text-secondary leading-snug">
              &quot;The skin is the soul&apos;s <br /> first contact.&quot;
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
