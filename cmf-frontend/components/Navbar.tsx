'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cmf_token') : null;
    setIsLoggedIn(!!token);

    // Fetch Global Logo
    const fetchLogo = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';
        const res = await fetch(`${strapiUrl}/api/global-setting?populate=logo`);
        const result = await res.json();
        if (result.data?.logo?.url) {
          setLogoUrl(`${strapiUrl}${result.data.logo.url}`);
        }
      } catch (err) {
        console.error('Failed to fetch global logo');
      }
    };
    fetchLogo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cmf_token');
    document.cookie = "cmf_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = `/${locale}/login`;
  };

  const navItems = [
    { name: t('home'), href: `/${locale}` },
    { name: t('membership'), href: `/${locale}/membership` },
    { name: t('tickets'), href: `/${locale}/tickets` },
    { name: t('directory'), href: `/${locale}/directory` },
  ];

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'cn' : 'en';
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(Boolean);
    
    if (segments[0] === 'en' || segments[0] === 'cn') {
      // If the first segment is a locale, swap it
      segments[0] = nextLocale;
    } else {
      // If no locale prefix, prepend the new one
      segments.unshift(nextLocale);
    }
    
    let targetPath = '/' + segments.join('/');
    
    // For English, if we use 'as-needed', we should remove the /en prefix
    if (nextLocale === 'en') {
      // Use regex to only replace it at the beginning
      targetPath = targetPath.replace(/^\/en($|\/)/, '/') || '/';
      // Ensure we don't end up with // at the start
      targetPath = targetPath.replace(/^\/\//, '/');
    }

    window.location.href = targetPath;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-3 group">
               {logoUrl ? (
                 <img 
                   src={logoUrl} 
                   alt="CMF Global" 
                   className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                 />
               ) : (
                 <div className="text-2xl font-black text-[var(--color-cmf-red)] tracking-tighter">
                   CMF <span className="text-gray-900 font-light">GLOBAL</span>
                 </div>
               )}
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[15px] font-bold text-gray-700 hover:text-[var(--color-cmf-red)] transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            <button
              onClick={toggleLocale}
              className="flex items-center space-x-1 text-[15px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Globe size={16} />
              <span>{locale === 'en' ? '中文' : 'EN'}</span>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-6 pl-4 border-l border-gray-100">
                <Link href={`/${locale}/dashboard`} className="text-sm font-bold text-gray-900 hover:text-[var(--color-cmf-red)] flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-gray-400" />
                  {t('dashboard')}
                </Link>
                <button onClick={handleLogout} className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href={`/${locale}/login`} className="text-[15px] font-bold text-gray-900 hover:text-[var(--color-cmf-red)]">
                  {t('login')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[var(--color-cmf-red)] hover:bg-gray-50 rounded-md"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={toggleLocale}
              className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <Globe size={18} className="mr-2" />
              {locale === 'en' ? '中文' : 'English'}
            </button>
            
            {isLoggedIn ? (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <Link
                  href={`/${locale}/dashboard`}
                  className="block px-3 py-2 text-base font-bold text-[var(--color-cmf-red)] hover:bg-gray-50 rounded-md"
                >
                  {t('dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-400"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="block w-full text-center mt-4 btn-primary"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
