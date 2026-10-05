import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Our Story | Aethravia',
  description: 'A dialogue between ancestral memory and modern science. Learn about the genesis of Aethravia.',
};

export default function AboutPage() {
  return (
    <main className="relative pt-16 overflow-x-hidden bg-surface text-on-surface">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBs4LRkuZ_fgnZA5hlF5xmln5wZhl-f2UNDmy_eT_QRjQvmmhxapg_F7nZjGZHVYULdfvLGdEcX375td5zla1K2E59t3glVSRSaSomsXpHFqPtsK8Q31UBD3b2A67ruxK1llebrGaibNkCfTvW2cAq2Avkj0IZXQzVce3sVHPllgP-mqABjGfaZoRj3iJgvwV4WKekdV1dWRYqkCIbFYml4iRYkC9ZYzcOfNoutS1GBUT3IrFEB3jq-0ZsxVINkx7NUC1ThEFhiwVi-)',
          opacity: 0.03
        }}
      ></div>

      {/* 1. Hero Section */}
      <section className="px-8 md:px-24 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative z-10 max-w-xl">
          <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-primary leading-tight -tracking-[0.03em]">
            Our Story
          </h1>
          <p className="mt-6 font-headline text-xl md:text-2xl text-secondary leading-relaxed italic">
            A dialogue between ancestral memory and modern science.
          </p>
          <div className="mt-10 h-px w-24 bg-primary/30"></div>
        </div>
        
        <div className="relative grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center w-full">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md">
            <img 
              className="w-full h-full object-cover" 
              alt="Close up of raw blocks of Multani Mitti clay with organic textures on a neutral stone background" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8YBHIo6CQzqQt_KJAxL29Yk3q-E1yfbcO04zDH-T1vJpbPPFxmqbdqiyArK1O_0Ozf1ePi9ltyN39qjRP1WcQySUMRWycv7qSfyJ_cIpo5oXJOUeUaqMdjq8B810oSOuUL5yEg54FJijv-n3BAc9RSn-wYmlndGhBlY7vj4OJf611-DuUITkC7qsnrNAUYc0zyWiAx3mllYILIjX6wzC04S_sLmCNbFtyGef30VS_c3dfukDOVSbcZJAm7jUSZXSgcO2gMwro4QjH"
            />
            <div className="absolute bottom-4 left-4 text-on-primary bg-primary/30 backdrop-blur-md px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-widest rounded-sm border border-white/10">
              Multani Mitti
            </div>
          </div>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md">
            <img 
              className="w-full h-full object-cover" 
              alt="Sun-dried Reetha soapnuts in a rustic wooden bowl with soft natural window light" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8eWB785McbCCijXIJ998jpQ6a0YL7qFxZZOaF1S0FfVtYSiflkDE8fgpTq8KVwPbDLEDhy2F4hLJHDpEDsS8rih3B7hM0uumijYULGHkHsSXY6NqV6DeniJ2Dalg5aPNG3iF3lkPgEdOtoP9jUtp5ryCTk6h19fhS9kZpOEjzYp_8PcsXJvVIGlezWS90ah7nWxssCA6OfRA30MQD-Kda1yaQCIyx2IqbdI1RDUA7Bbo6xKahVC8qUK68KDTUWquZ9EGmHGndq0uF"
            />
            <div className="absolute bottom-4 left-4 text-on-primary bg-primary/30 backdrop-blur-md px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-widest rounded-sm border border-white/10">
              Reetha
            </div>
          </div>
        </div>
      </section>

      {/* 2. How Aethravia Began */}
      <section className="bg-surface-container-low px-8 md:px-24 py-16 md:py-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20 items-center">
          <div className="w-full md:w-1/2 relative group">
            <div className="absolute -top-6 -left-6 w-full h-full bg-surface-container-highest -z-10 rounded-lg"></div>
            <img 
              className="w-full aspect-[4/5] object-cover rounded shadow-2xl transition-transform duration-500 group-hover:-translate-y-2" 
              alt="How Aethravia Began" 
              src="/images/aethravia-began.jpeg"
            />
          </div>
          <div className="w-full md:w-1/2">
            <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4 block">The Genesis</span>
            <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-6 leading-tight">How Aethravia Began</h2>
            <div className="space-y-5 text-on-surface-variant leading-loose text-base md:text-lg font-light font-body">
              <p>
                Aethravia began with a simple yet relatable problem. Its founder, Arpita Kashyap, struggled with frequent sun tanning and often relied on traditional remedies like Multani Mitti. While these natural solutions were effective, they were not always practical for a busy lifestyle. This inspired a simple question: why not create skincare products that deliver the benefits of trusted natural ingredients in a convenient, ready-to-use form? What started as personal research and home-crafted formulations soon evolved into Aethravia—a brand committed to blending the wisdom of nature with everyday convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Mission */}
      <section className="px-8 py-20 md:py-40 text-center bg-surface relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block px-4 py-1 mb-8 border border-primary/20 rounded-full text-[10px] uppercase tracking-[0.3em] text-primary">
            Manifesto
          </div>
          <h2 className="font-headline text-4xl md:text-5xl text-primary leading-tight mb-8">
            Revolutionizing body care by proving that earth's wisdom is the ultimate laboratory.
          </h2>
          <p className="font-body text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed tracking-wide">
            Our mission is to elevate the ritual of self-care into a sacred dialogue with nature, guided by transparency, ethics, and unparalleled performance.
          </p>
        </div>
        {/* Decorative botanical ghost image */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none">
          <img 
            className="w-96 grayscale" 
            alt="Delicate dried botanical leaf veins against a pale background" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1tUFa_1ND1gU0MplZU634sdsqya53-cvEH8Ov5IVlHYMZ8aKkc-S5WLDJkTH5LnL5THzXoNNvGvsU2kVAWdWkSyslYzjHKlIV0vXcTuiHK5jOa45UqYoWX7VvIyG_mPbgWnP7yiYGcz5ofio2cahLmECpLtLjcpErYuxO8EYadA7SZouaOYvRio8lCC7HaBmieq_D6QrCl-PpkRR4ZCY99aJ6cRo7_rE54YyrwXUHNNH8p1Fg0oXY-lTiKwimgRI7ea7qpjP1Udqu"
          />
        </div>
      </section>

      {/* 4. What Makes Us Unique (Bento-style Grid) */}
      <section className="px-8 md:px-24 py-16 md:py-32 bg-surface-container-highest">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-4">Our Philosophy</h2>
            <p className="font-body text-secondary tracking-widest uppercase text-xs">The Aethravia Standard</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/10">
            {/* Card 1 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">eco</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Small-Batch</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Small-batch skincare made with intention.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">science</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Safety First</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Tested for safety, not trends.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">experiment</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Ingredient-Backed</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Ingredient-backed formulations.</p>
            </div>
            {/* Card 4 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">inventory_2</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Minimal Packaging</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Thoughtful, minimal packaging.</p>
            </div>
            {/* Card 5 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">health_and_safety</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Clean Beauty</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">No parabens. No false claims.</p>
            </div>
            {/* Card 6 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">favorite</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Honest Care</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Honest care for real skin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Founders' Messages Section */}
      <section className="px-8 md:px-24 py-16 md:py-32 space-y-16 md:space-y-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4 block">Our Leadership</span>
            <h2 className="font-headline text-3xl md:text-4xl text-on-surface">The Minds Behind the Ritual</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-24">
            {/* Founder: Arpita Kashyap */}
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="lg:w-1/3 relative">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <img 
                    className="w-full h-full object-cover grayscale brightness-90 contrast-110" 
                    alt="Professional and serene portrait of Arpita Kashyap, founder of Aethravia, in a modern artisanal studio" 
                    src="/founder-arpita.jpeg"
                  />
                </div>
                <div className="relative sm:absolute mt-4 sm:mt-0 sm:-bottom-8 sm:-right-8 bg-primary text-on-primary p-6 sm:p-8 rounded-lg shadow-xl">
                  <p className="font-headline text-lg italic">"Nature does not hurry, yet everything is accomplished."</p>
                </div>
              </div>
              <div className="lg:w-2/3 max-w-2xl">
                <h4 className="font-headline text-2xl md:text-3xl text-on-surface mb-6">A Message from Our Founder</h4>
                <blockquote className="text-xl md:text-2xl font-headline text-secondary leading-relaxed mb-8 italic">
                  "Aethravia isn't just about skincare; it's about reclaiming the moments of quietude we've lost to a fast-paced world. We invite you to slow down, feel the texture of the earth on your skin, and remember who you are."
                </blockquote>
                <div>
                  <p className="font-bold font-body text-on-surface tracking-widest uppercase">Arpita Kashyap</p>
                  <p className="font-body text-on-surface-variant text-sm mt-1">Founder & Chief Formulation Officer</p>
                </div>
              </div>
            </div>
            
            {/* Co-Founder: Prajjwal Kashyap */}
            <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
              <div className="lg:w-1/3 relative">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <img 
                    className="w-full h-full object-cover grayscale brightness-90 contrast-110" 
                    alt="Professional studio portrait of Prajjwal Kashyap, co-founder of Aethravia, with a warm, confident expression." 
                    src="/prajjwal-co-founder.jpeg"
                  />
                </div>
                <div className="relative sm:absolute mt-4 sm:mt-0 sm:-bottom-8 sm:-left-8 bg-secondary text-on-primary p-6 sm:p-8 rounded-lg shadow-xl">
                  <p className="font-headline text-lg italic">"Precision is the highest form of respect for tradition."</p>
                </div>
              </div>
              <div className="lg:w-2/3 max-w-2xl lg:text-right">
                <h4 className="font-headline text-2xl md:text-3xl text-on-surface mb-6">A Note from Our Co-Founder</h4>
                <blockquote className="text-xl md:text-2xl font-headline text-secondary leading-relaxed mb-8 italic">
                  "Our goal was never to replicate the past, but to refine it. By applying the rigor of modern science to heritage ingredients, we ensure that the wisdom of the ancients meets the expectations of the future."
                </blockquote>
                <div className="lg:flex lg:flex-col lg:items-end">
                  <p className="font-bold font-body text-on-surface tracking-widest uppercase">Prajjwal Kashyap</p>
                  <p className="font-body text-on-surface-variant text-sm mt-1">Co-Founder & Head of Innovation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Our Commitments */}
      <section className="bg-surface-container-high py-16 md:py-32 px-8 text-center">
        <div className="max-w-3xl mx-auto border-y border-outline-variant/30 py-16">
          <h2 className="font-headline text-3xl md:text-4xl text-primary mb-6">Our Everlasting Commitment</h2>
          <p className="font-body text-on-surface-variant text-base md:text-lg leading-loose mb-10">
            We pledge to remain transparent about our supply chain, to never compromise on ingredient purity, and to continuously innovate toward a more regenerative future for our planet and your skin.
          </p>
          <a className="inline-flex items-center gap-3 bg-primary text-on-primary px-10 py-5 rounded-lg font-bold font-label tracking-widest uppercase text-xs transition-all hover:bg-primary/90" href="/ritual">
            Explore the Rituals
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </section>
    </main>
  );
}
