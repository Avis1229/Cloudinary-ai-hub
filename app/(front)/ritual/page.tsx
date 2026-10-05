import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rituals | Aethravia Artisanal Heritage',
  description: 'Explore the artisanal heritage and our ritual guides.',
};

export default function RitualPage() {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary-container relative w-full overflow-x-hidden">
      {/* SideNavBar (Contextual for Ritual Selection) */}
      <div className="pt-8 md:pt-12 w-full max-w-[1400px] mx-auto min-h-screen">
        <div className="noise-overlay fixed inset-0"></div>

        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center px-6 md:px-16 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-6 z-10 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold font-label tracking-[0.3em] uppercase text-primary opacity-60">Handcrafted Wisdom</span>
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-headline text-on-surface leading-[1.1] tracking-tighter">
                  The Art of <br /><span className="italic text-primary font-light">the Ritual</span>
                </h1>
              </div>
              <p className="text-lg text-secondary max-w-lg leading-relaxed font-body font-light">
                In the silence of the morning or the twilight of the evening, skincare becomes a bridge to heritage. We invite you to slow down, feel the textures of the earth, and reconnect with the artisanal wisdom of the ages.
              </p>
              <div className="flex gap-6 pt-4">
                <Link 
                  href="#preparation"
                  className="bg-primary text-on-primary px-10 py-4 font-label uppercase tracking-widest text-xs font-bold rounded-sm hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 text-center"
                >
                  Explore Ceremonies
                </Link>
                <Link 
                  href="/about"
                  className="border border-outline-variant/30 text-on-surface px-10 py-4 font-label uppercase tracking-widest text-xs font-bold rounded-sm hover:bg-surface-container-low transition-all duration-300 text-center"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
                <img alt="Ritual setup" className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000" data-alt="close-up of raw earth clay and wooden bowls on a textured linen cloth in soft cinematic lighting" src="/images/ritual.jpeg" />
              </div>
              <div className="absolute -bottom-8 -left-8 md:-left-12 p-10 bg-surface-container-lowest/90 backdrop-blur-xl shadow-2xl rounded-sm max-w-xs border border-outline-variant/20 z-20">
                <span className="font-headline italic text-primary text-xl block mb-3 leading-none">The Earth Speaks</span>
                <p className="text-sm text-secondary leading-relaxed font-body font-normal opacity-80">"Every smear of clay is a dialogue between the soil and your soul."</p>
              </div>
            </div>
          </div>
        </section>

        {/* Preparation Section */}
        <section id="preparation" className="py-32 px-6 md:px-16 bg-surface-container-lowest/50 backdrop-blur-sm mt-16 rounded-3xl border border-outline-variant/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-baseline mb-24 gap-12">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6 block font-label opacity-60">Stage One</span>
                <h2 className="text-4xl md:text-6xl font-headline tracking-tight leading-tight">Preparation: <br/>The Sensory Altar</h2>
              </div>
              <p className="text-xl text-secondary max-w-md italic font-light leading-relaxed">Gather your elements with intention. The weight of the bowl, the temperature of the water, and the scent of the wood are as vital as the ingredients themselves.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-16 mb-16">
              <div className="group">
                <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                  <img alt="Botanical Ingredients" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/ingredients.jpeg" />
                </div>
              </div>
              
              <div className="group">
                <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                  <img alt="Refreshing Texture" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/texture.jpeg" />
                </div>
              </div>
              
              <div className="group">
                <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                  <img alt="Everyday Self-Care Ritual" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/selfcare-ritual.jpeg" />
                </div>
              </div>
            </div>

            <div className="group w-full">
              <div className="w-full bg-surface-container rounded-3xl overflow-hidden shadow-xl border border-outline-variant/10">
                <img alt="Aethravia Complete Collection" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" src="/images/below-3.jpeg" />
              </div>
            </div>
          </div>
        </section>

        {/* Ritual Guides */}
        <section className="py-32 px-6 md:px-16" id="cleansing">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-12 mb-40">
              <div className="space-y-6 text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/20 font-label">Earth Element</span>
                  <span className="text-xs text-secondary/60 font-bold font-label tracking-widest">15 MINS</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-headline leading-[1.1]">The Deep Cleansing Ritual <br /><span className="italic text-primary-container font-light">(Multani Mitti)</span></h2>
              </div>
              
              <div className="relative w-full">
                <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest group cursor-pointer">
                  {/* Dictates the aspect ratio dynamically */}
                  <img alt="Multani Mitti Product" className="w-full h-auto object-cover relative z-10 transition-opacity duration-700 ease-in-out opacity-100 group-hover:opacity-0" src="/images/multani-pic.jpeg" />
                  {/* Overlays perfectly within the dictated ratio */}
                  <img alt="Multani Mitti Texture" className="w-full h-full object-cover absolute inset-0 z-20 transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100" src="/images/multani-mitti.jpeg" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-[21/9] bg-secondary-container rounded-full overflow-hidden -z-0 blur-[100px] opacity-30"></div>
              </div>
            </div>

            <div className="flex flex-col gap-12" id="hydrating">
              <div className="space-y-6 text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/20 font-label">Air Element</span>
                  <span className="text-xs text-secondary/60 font-bold font-label tracking-widest">5 MINS</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-headline leading-[1.1]">The Pure Foam Ritual <br /><span className="italic text-primary-container font-light">(Reetha)</span></h2>
              </div>
              
              <div className="relative w-full">
                <div className="relative z-10 w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest group cursor-pointer">
                  {/* Dictates the aspect ratio dynamically */}
                  <img alt="Reetha Product" className="w-full h-auto object-cover relative z-10 transition-opacity duration-700 ease-in-out opacity-100 group-hover:opacity-0" src="/images/reetha.jpeg" />
                  {/* Overlays perfectly within the dictated ratio */}
                  <img alt="Reetha Texture" className="w-full h-full object-cover absolute inset-0 z-20 transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100" src="/images/reetha-image.jpeg" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-[21/9] bg-secondary-container rounded-full overflow-hidden -z-0 blur-[100px] opacity-30"></div>
              </div>
            </div>
          </div>
        </section>


      </div>
    </div>
  );
}

