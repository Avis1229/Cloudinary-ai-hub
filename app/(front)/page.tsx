import { Metadata } from 'next';
import { Suspense } from 'react';
import HeroModern from '@/components/home/HeroModern';
import IngredientGallery from '@/components/home/IngredientGallery';
import SkincareRitual from '@/components/home/SkincareRitual';
import FAQ from '@/components/home/FAQ';
import Newsletter from '@/components/home/Newsletter';
import Slider from '@/components/slider/Slider';
import ProductItems, { ProductItemsSkeleton } from '@/components/products/ProductItems';
import TrustBarModern from '@/components/home/TrustBarModern';
import TrustBar from '@/components/footer/TrustBar';
import Testimonials from '@/components/testimonials/Testimonials';
import productService from '@/lib/services/productService';

export const metadata: Metadata = {
  title: {
    absolute: 'Aethravia',
  },
  description: 'Grounded elegance for the modern heritage seeker. Discover artisanal skin rituals crafted from Multani Mitti and Reetha.',
};

const HomePage = async () => {
  const categories = await productService.getCategories();

  return (
    <div className='flex flex-col bg-surface'>
      {/* Hero Section: Ancient Wisdom */}
      <HeroModern />

      {/* Product Sections */}
      <section className="py-12 md:py-24 w-full space-y-16 md:space-y-32">
        {/* Signature Collection — pulls from isSignature toggle */}
        <Suspense fallback={<ProductItemsSkeleton qty={4} layout="slider" />}>
          <ProductItems 
            layout="slider" 
            title="Signature" 
            highlight="Collection" 
            category="signature_collection_special_flag"
          />
        </Suspense>

        {/* Each category gets its own row so ALL products are visible */}
        {(() => {
          const preferredOrder = ['Body Wash', 'Face Wash', 'Body Scrub', 'Combo'];
          const sorted = [
            ...preferredOrder.filter(c => categories.includes(c)),
            ...categories.filter(c => !preferredOrder.includes(c)),
          ];
          return sorted.map(cat => (
            <Suspense key={cat} fallback={<ProductItemsSkeleton qty={4} layout="slider" />}>
              <ProductItems 
                layout="slider" 
                title={cat}
                highlight="Products"
                category={cat}
              />
            </Suspense>
          ));
        })()}
      </section>

      {/* Key Ingredients: The Elemental Three */}
      <IngredientGallery />

      {/* Client Reviews */}
      <section className="py-12 md:py-24 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Testimonials heading="Ritual Reviews" />
      </section>

      {/* Trust & Heritage Values */}
      <TrustBarModern />

      {/* Artisanal Rituals Section */}
      <SkincareRitual />

      {/* FAQ Section */}
      <FAQ />

      {/* Newsletter / Editorial Section */}
      <Newsletter />
      
      {/* Features TrustBar */}
      <TrustBar />
    </div>
  );
};

export default HomePage;
