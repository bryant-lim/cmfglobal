'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  UserCircle, 
  Ticket, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ShieldCheck,
  Home
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Forms.dashboard');
  const navT = useTranslations('Navigation');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale || 'en';
  const router = useRouter();

  // Handle window resize for mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

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

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: t('title'), icon: LayoutDashboard, href: `/${locale}/dashboard` },
    { name: navT('profile'), icon: UserCircle, href: `/${locale}/dashboard/profile` },
    { name: t('myTickets'), icon: Ticket, href: `/${locale}/dashboard/tickets` },
    { name: t('myOrders'), icon: CreditCard, href: `/${locale}/dashboard/orders` },
    { name: t('goHome'), icon: Home, href: `/${locale}` },
  ];

  const handleLogout = () => {
    localStorage.removeItem('cmf_token');
    document.cookie = "cmf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push(`/${locale}/login`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar Overlay (Mobile) */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 bg-white border-r border-gray-100 z-50 transition-all duration-500 ease-in-out lg:static lg:translate-x-0",
        isSidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-8 pb-12 flex items-center gap-3">
             {logoUrl ? (
               <img src={logoUrl} alt="CMF Global" className="w-10 h-10 object-contain rounded-lg" />
             ) : (
               <div className="w-10 h-10 bg-[#E63946] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#E63946]/20">
                 <ShieldCheck className="w-6 h-6" />
               </div>
             )}
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">CMF Global</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400">{t('portalName')}</p>
              </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300",
                    isActive 
                      ? "bg-[#E63946] text-white shadow-lg shadow-[#E63946]/20" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-50">
             <button 
               onClick={handleLogout}
               className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-[#E63946] transition-all duration-300"
             >
               <LogOut className="w-5 h-5" />
               {navT('logout')}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 hidden sm:block">{t('title')}</h1>
          </div>

          <div className="flex items-center gap-6">
            {/* User info and notifications removed for minimalist design */}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8F9FA]/50 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
