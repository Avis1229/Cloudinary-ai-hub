import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import AddToCart from '@/components/products/AddToCart';
import { Rating } from '@/components/products/Rating';
import ProductGallery from '@/components/products/ProductGallery';
import WishlistButton from '@/components/products/WishlistButton';
import productService from '@/lib/services/productService';
import { convertDocToObj, formatPrice } from '@/lib/utils';
import FAQSection from '@/components/footer/FAQ';
import ProductTabs from '@/components/products/ProductTabs';
import ProductModel from '@/lib/models/ProductModel';
import AvailableOffers from '@/components/products/AvailableOffers';
import ProductReviews from '@/components/products/ProductReviews';
import ComplementaryCarousel from '@/components/products/ComplementaryCarousel';
import dbConnect from '@/lib/dbConnect';
import TestimonialModel from '@/lib/models/TestimonialModel';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  let product;
  try {
    product = await productService.getBySlug(slug);
  } catch {
    return {
      title: 'Product',
      description: '',
    };
  }

  if (!product) {
    return notFound();
  }

  return {
    title: product.name,
    description: product.description,
  };
};

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  let product;
  try {
    product = await productService.getBySlug(slug);
  } catch {
    return notFound();
  }

  if (!product) {
    return notFound();
  }


  // Fetch related products (excluding current)
  let relatedProducts: any[] = [];
  let reviewStats = { averageRating: 0, totalReviews: 0 };
  try {
    await dbConnect();
    relatedProducts = await ProductModel.find({
      slug: { $ne: slug },
    })
      .limit(10)
      .lean();

    // Compute real review stats from Testimonials
    const productId = product._id?.toString();
    if (productId) {
      const ratingAgg = await TestimonialModel.aggregate([
        { $match: { productId: new (await import('mongoose')).default.Types.ObjectId(productId), published: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (ratingAgg.length > 0) {
        reviewStats = {
          averageRating: +(ratingAgg[0].avg || 0).toFixed(1),
          totalReviews: ratingAgg[0].count || 0,
        };
      }
    }
  } catch (error) {
    console.error('[ProductPage] Failed to load related products:', error);
    relatedProducts = [];
  }

  return (
    <div className="pt-8 md:pt-12 pb-12 overflow-x-hidden">
      {/* Product Section */}
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        {/* Product Gallery (Interactive) */}
        <ProductGallery 
          images={
            product.images && product.images.length > 0
              ? product.images
              : [/^(\/|https?:)/.test(product.image) ? product.image : '/images/banner/banner0.jpg']
          } 
        />

        {/* Product Info */}
        <div className="lg:col-span-7 flex flex-col space-y-6 mt-8 lg:mt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {product.countInStock > 0 ? (
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">In Stock</span>
              ) : (
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Out of Stock</span>
              )}
              <div className="flex items-center text-primary">
                 <Rating 
                    value={reviewStats.averageRating}
                    caption={`${reviewStats.totalReviews} review${reviewStats.totalReviews !== 1 ? 's' : ''}`}
                 />
              </div>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-primary tracking-tighter italic leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <p className="text-2xl font-body font-light text-on-surface">{formatPrice(product.price)}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string, idx: number) => (
                <span key={idx} className="bg-surface-variant/30 border border-outline-variant/30 text-on-surface-variant px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {product.countInStock > 0 && (
               <div className="flex-1">
                 <AddToCart
                   item={{
                     ...convertDocToObj(product),
                     qty: 0,
                     color: '',
                     size: '',
                   }}
                 />
               </div>
            )}
            <WishlistButton product={convertDocToObj(product)} />
          </div>



          {/* Available Offers */}
          <AvailableOffers productId={product._id?.toString() || ''} />

          {/* Description (moved down for scrollability) */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/20">
            <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">About This Product</h3>
            <p className="text-on-surface-variant leading-relaxed text-base">
              {product.description}
            </p>
          </div>
        </div>
      </section>

      {/* Product Infographic Image */}
      {(['Face Wash', 'Body Wash', 'Body Scrub'].includes(product.category)) && (() => {
        const infoImages: Record<string, string> = {
          'Face Wash': '/images/products/facewash-info.jpeg',
          'Body Wash': '/images/products/bodywash-info.jpeg',
          'Body Scrub': '/images/products/bodyscrub-info.jpeg',
        };
        return (
          <section className="mt-16 md:mt-24 max-w-screen-md mx-auto px-6 md:px-12">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
              <Image
                src={infoImages[product.category]}
                alt={`${product.category} - Product Details & Benefits`}
                width={800}
                height={2000}
                className="w-full h-auto object-contain"
                quality={90}
                priority={false}
              />
            </div>
          </section>
        );
      })()}

      {/* Detailed Content Tabs */}
      <ProductTabs description={product.description} ingredients={product.ingredients} productName={product.name} category={product.category} />

      {/* Customer Reviews - Product Specific */}
      <ProductReviews productId={product._id?.toString() || ''} productName={product.name} />

      <section className="mt-24 max-w-screen-2xl mx-auto px-6 md:px-12">
        <ComplementaryCarousel relatedProducts={relatedProducts.map(p => convertDocToObj(p))} />
      </section>

      <div className="mt-24 max-w-screen-2xl mx-auto px-6 md:px-12 border-t border-outline-variant/20 pt-16">
        <FAQSection />
      </div>
    </div>
  );
};

export default ProductPage;
