'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu as MenuIcon, X } from 'lucide-react';

import Menu from './Menu';
import SearchInline from './SearchInline';
import useLayoutService from '@/lib/hooks/useLayout';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/ritual', label: 'Rituals' },
  { href: '/ingredients', label: 'Ingredients' },
  { href: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { toggleDrawer, drawerOpen } = useLayoutService();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 w-full px-2 sm:px-4 md:px-8 py-2 md:py-3">
      <nav 
        aria-label="Main navigation" 
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between border ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgba(45,18,32,0.08)] border-white/80' 
            : 'bg-white/85 backdrop-blur-md shadow-[0_4px_20px_rgba(45,18,32,0.04)] border-white/70'
        }`}
      >
        {/* Left: Mobile Toggle + Logo */}
        <div className="flex items-center flex-shrink-0 gap-2 sm:gap-3">
          <button
            onClick={toggleDrawer}
            className="lg:hidden flex items-center justify-center p-2 rounded-full hover:bg-primary/10 transition-colors text-[#2D1220]"
            aria-label="Toggle Menu"
            suppressHydrationWarning
          >
            {drawerOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image
                src="/images/logo.png"
                alt="BeautyP Logo"
                fill
                sizes="(max-width: 640px) 32px, 40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block relative h-6 w-28 sm:h-7 sm:w-36 group-hover:opacity-85 transition-opacity">
              <Image
                src="/images/logo-text.png"
                alt="BeautyP Logo Text"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center: Navigation Tabs (Desktop) */}
        <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full group ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-[#2D1220]/80 hover:text-primary'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-primary rounded-full transition-all" />
                )}
                {!isActive && (
                  <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-primary/0 group-hover:bg-primary/40 rounded-full transition-all" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Search + Menu */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <SearchInline />
          <div className="hidden sm:block">
            <Menu showSearch={false} />
          </div>
          <div className="sm:hidden flex items-center">
            <Menu showSearch={false} showAccount={false} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

