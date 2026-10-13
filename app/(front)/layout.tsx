import DrawerButton from '@/components/DrawerButton';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Sidebar from '@/components/Sidebar';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import FloatingContactWidget from '@/components/FloatingContactWidget';
import ResponsiveDrawerInit from '@/components/ResponsiveDrawerInit';
import PricingInitializer from '@/components/PricingInitializer';

export default function FrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='drawer z-[60]'>
      <DrawerButton />
      <ResponsiveDrawerInit />
      <PricingInitializer />
      <div className='drawer-content'>
        <div className='flex min-h-screen flex-col overflow-x-hidden'>
          {/* Luxury Sage Green Announcement Bar */}
          <div className="bg-[#4F6449] text-white py-2 px-4 sm:px-8 text-[11px] sm:text-xs font-medium tracking-wide z-40 relative border-b border-black/5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
              {/* Left: Quality & Ethics Certifications */}
              <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4 text-[10.5px] sm:text-[11px] tracking-wider uppercase font-semibold text-white/95">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🍃</span> Made In India
                </span>
                <span className="text-white/30">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">📜</span> FDA Registered
                </span>
                <span className="text-white/30">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🐰</span> Cruelty Free
                </span>
                <span className="text-white/30">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm">🌱</span> Vegan
                </span>
              </div>

              {/* Right: Signature Wellness Highlights */}
              <div className="hidden lg:flex items-center gap-3 text-[11px] text-white/90">
                <span className="flex items-center gap-1.5">
                  <span>✨</span> Natural Tan Removal • Body Odor Control
                </span>
                <span className="text-white/30">|</span>
                <span className="flex items-center gap-1.5">
                  <span>🌿</span> India&apos;s First Premium Body Care powered by Multani Mitti &amp; Reetha
                </span>
              </div>
            </div>
          </div>
          <Header />
          <main className='flex-grow'>{children}</main>
          <Footer />
          <ScrollToTopButton />
          <FloatingContactWidget />
        </div>
      </div>
      <div className='drawer-side z-[70]'>
        <label
          htmlFor='my-drawer'
          aria-label='close sidebar'
          className='drawer-overlay'
        ></label>
        <Sidebar />
      </div>
    </div>
  );
}
