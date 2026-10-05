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
          <div className="bg-primary text-white text-center py-2 text-xs md:text-sm font-semibold tracking-wider flex justify-center items-center gap-2 md:gap-4 px-4 uppercase font-body z-40 relative">
            <span>Made in India</span>
            <span className="hidden sm:inline">•</span>
            <span>FDA Registered</span>
            <span className="hidden sm:inline">•</span>
            <span>Cruelty Free</span>
            <span className="hidden sm:inline">•</span>
            <span>Vegan</span>
          </div>
          {/* Scrolling marquee ticker below the trust bar */}
          <div className="overflow-hidden bg-[#1a0a00] text-[#f5c97a] py-[7px] text-[11px] md:text-[12.5px] font-semibold tracking-wide font-body z-40 relative border-b border-[#f5c97a]/20">
            <div
              className="flex whitespace-nowrap"
              style={{
                animation: 'marquee-scroll 28s linear infinite',
              }}
            >
              {[...Array(4)].map((_, i) => (
                <span key={i} className="flex items-center gap-0 shrink-0">
                  <span className="mx-6">🌿 India&apos;s First Premium Body Care powered by Multani Mitti &amp; Reetha</span>
                  <span className="mx-2 text-[#f5c97a]/50">✦</span>
                  <span className="mx-6">✨ Natural Tan Removal + Body Odor Control</span>
                  <span className="mx-2 text-[#f5c97a]/50">✦</span>
                </span>
              ))}
            </div>
            <style>{`
              @keyframes marquee-scroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
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
