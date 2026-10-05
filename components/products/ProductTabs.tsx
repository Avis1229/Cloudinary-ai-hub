'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Tab {
  id: string;
  label: string;
  title: string;
  content: React.ReactNode;
}

export default function ProductTabs({ description, ingredients, productName, category }: { description: string; ingredients?: string[]; productName: string; category?: string }) {
  const getRitualText = () => {
    const name = productName || 'AETHRAVIA Product';
    if (category === 'Body Scrub') {
      return `Begin your routine by gently exfoliating your skin with the ${name}. Massage a small amount onto damp skin using gentle circular motions, paying attention to rough areas, then rinse thoroughly with water.`;
    }
    if (category === 'Body Wash') {
      return `Begin your routine by cleansing your body with the ${name}. Apply to damp skin, work into a rich lather, and rinse thoroughly to leave your skin feeling refreshed and renewed.`;
    }
    if (category === 'Face Wash') {
      return `Begin your routine by cleansing your face with the ${name}. Massage a small amount onto damp skin using gentle circular motions, then rinse thoroughly with water.`;
    }
    return `Begin your routine with the ${name}. Apply a small amount as directed, massaging gently into the skin, and enjoy the natural aromas of your daily ritual.`;
  };

  const tabs: Tab[] = [
    {
      id: 'ritual',
      label: 'The Ritual',
      title: 'Cleansing as Meditation',
      content: getRitualText(),
    },
    {
      id: 'ingredients',
      label: 'Ingredients',
      title: 'Nature’s Raw Potency',
      content: ingredients && ingredients.length > 0
        ? `Key ingredients: ${ingredients.join(', ')}. Our formula is anchored by these carefully selected natural ingredients. No synthetic fragrances, sulfates, or parabens.`
        : 'Our formula is anchored by Multani Mitti (Fuller’s Earth) to draw out impurities, and Reetha (Soapnut) for a gentle natural lather. We combine this with Wild Honey to lock in moisture, known for its anti-inflammatory properties. No synthetic fragrances, sulfates, or parabens.',
    },
    {
      id: 'ethics',
      label: 'Our Ethics',
      title: 'Conscious Craftsmanship',
      content: (
        <ul className="list-disc pl-5 space-y-3">
          <li><strong>Thoughtful Formulations:</strong> Combining nature-inspired ingredients with modern cosmetic science.</li>
          <li><strong>Cruelty-Free:</strong> We are strictly cruelty-free and never test on animals.</li>
          <li><strong>100% Vegan:</strong> Formulas made entirely without animal-derived ingredients.</li>
          <li><strong>Dermatologist Tested:</strong> Ensuring safety and skin compatibility.</li>
          <li><strong>Made in India:</strong> Proudly crafted adhering to international quality standards.</li>
        </ul>
      )
    }
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section className="mt-24 bg-surface-container-low relative py-20">
      <div className="absolute inset-0 pointer-events-none noise-overlay opacity-[0.03]"></div>
      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="flex border-b border-outline-variant/20 mb-12 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab)}
              className={`px-8 pb-4 font-headline italic text-xl whitespace-nowrap transition-all duration-300 ${
                activeTab.id === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="space-y-12 transition-all duration-500">
          <div className="max-w-3xl">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
              <h2 className="font-headline text-3xl text-primary italic leading-tight">{activeTab.title}</h2>
              <div className="text-on-surface-variant leading-relaxed text-lg">
                {activeTab.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

