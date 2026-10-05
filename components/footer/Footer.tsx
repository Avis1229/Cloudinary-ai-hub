import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Share2, Globe, ArrowRight } from 'lucide-react';
import dbConnect from '@/lib/dbConnect';
import SiteSettingsModel from '@/lib/models/SiteSettingsModel';

const Footer = async () => {
  let settings: any = null;
  try {
    await dbConnect();
    settings = await SiteSettingsModel.findOne({}).lean();
  } catch (error) {
    console.error('Footer failed to load site settings', error);
  }

  const currentYear = new Date().getFullYear();
  const email = settings?.supportEmail || 'aethravia@gmail.com';
  const address = settings?.shopAddress || 'H.No.46, Mohalla Mohammad Wasil Near Hadri Masjid, Pilibhit, UP-262001 (India)';
  const phone = settings?.supportPhone || '+91-XXXX-XXXXXX';
  const phoneClean = phone.replace(/[^0-9+]/g, '');
  const rawWhatsapp = (settings?.whatsappNumber || phone).replace(/[^0-9+]/g, '');
  const whatsappUrlSafe = rawWhatsapp.startsWith('+') ? rawWhatsapp.substring(1) : rawWhatsapp;
  const whatsappUrl = `https://wa.me/${whatsappUrlSafe}?text=Hello! I have a query regarding Aethravia products.`;

  return (
    <footer className="bg-[#e5e2dd] relative overflow-hidden text-[#1c1c19]">
      {/* Noise Texture Overlay (3%) */}
      <div className="absolute inset-0 noise-overlay opacity-[0.03] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          
          {/* Column 1: Brand Story & Socials */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center group">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/images/logo.png"
                  alt="Aethravia Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div className="relative h-8 w-40 md:h-10 md:w-48">
                <Image
                  src="/images/logo-text.png"
                  alt="Aethravia Logo Text"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>

            <div className="space-y-4">
              <h2 className="text-xl font-serif tracking-tight text-primary">Our Heritage</h2>
              <p className="text-sm font-medium leading-relaxed text-secondary opacity-90">
                Aethravia is built on the ancient wisdom of Multani Mitti and Reetha. 
                Inspired by the earth, crafted for the soul.
              </p>
            </div>

            {/* Social Area */}
            <div className="flex items-center space-x-6 pt-4">
              <a 
                href="https://www.instagram.com/_aethravia/?hl=en" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors flex items-center space-x-2 group"
              >
                <Instagram size={18} className="transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Instagram</span>
              </a>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors flex items-center space-x-2 group"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-[19px] h-[19px] fill-current transition-transform group-hover:scale-110"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-[10px] font-bold tracking-widest uppercase">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Collections</h3>
            <nav className="flex flex-col space-y-4">
              <Link href="/shop?category=Body Wash" className="text-sm font-medium text-secondary hover:text-primary transition-colors inline-flex items-center group">
                Body Wash 
                <ArrowRight size={12} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link href="/shop?category=Body Scrub" className="text-sm font-medium text-secondary hover:text-primary transition-colors inline-flex items-center group">
                Body Scrub
                <ArrowRight size={12} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link href="/shop?category=Face Wash" className="text-sm font-medium text-secondary hover:text-primary transition-colors inline-flex items-center group">
                Face Wash
                <ArrowRight size={12} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </nav>
          </div>

          {/* Column 3: The House */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-primary">The House</h3>
            <nav className="flex flex-col space-y-4">
              <Link href="/about" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Our Story</Link>
              <Link href="/ritual" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Rituals</Link>
              <Link href="/loyalty" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Loyalty Program</Link>
              <Link href="/referral" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Invite a Friend</Link>
            </nav>
          </div>

          {/* Column 4: Assistance */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-primary">Assistance</h3>
            <nav className="flex flex-col space-y-4">
              <Link href="/shipping-policy" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Shipping Policy</Link>
              <Link href="/returns" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Returns & Refund Policy</Link>
              <Link href="/privacy" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Terms & Conditions</Link>
              <Link href="/cookies" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Cookie Policy</Link>
              <Link href="/faq" className="text-sm font-medium text-secondary hover:text-primary transition-colors uppercase tracking-widest text-[11px]">FAQ</Link>
              <Link href={`mailto:${email}`} className="pt-2 text-xs font-bold text-primary underline underline-offset-4">{email}</Link>
              <a href={`tel:${phoneClean}`} className="text-xs font-bold text-primary underline underline-offset-4">{phone}</a>
            </nav>
          </div>
        </div>

        {/* Company Details */}
        <div className="mt-16 pt-10 pb-10 border-t border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b25a24] mb-3">Head Office</h4>
            <div className="text-xs text-secondary/80 leading-relaxed font-medium space-y-1 whitespace-pre-wrap">
              <p>Heuk care Private limited</p>
              <p>{address}</p>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#b25a24] mb-3">Manufacturer</h4>
            <div className="text-xs text-secondary/80 leading-relaxed font-medium space-y-1">
              <p>Sage Apothecary PVT. LTD., Plot No. 516, Pace City-II, Sector-37, Gurugram-122001 (Haryana)</p>
            </div>
          </div>
        </div>

        {/* Minimalist Legal Bottom Bar */}
        <div className="pt-10 border-t border-primary/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-center md:text-left">
            <p className="text-[10px] font-medium text-secondary/60 tracking-wider">
              &copy; {currentYear} Aethravia. All Rights Reserved.
            </p>
            
            <div className="flex items-center space-x-10">
              <span className="hidden md:inline text-[10px] font-bold text-primary/40 tracking-widest uppercase">Grounded in Nature</span>
              <div className="flex items-center space-x-2 text-secondary/80">
                <Globe size={14} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">India (English)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

