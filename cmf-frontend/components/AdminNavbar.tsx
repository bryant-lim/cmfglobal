'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, UserCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const locale = useLocale();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('cmf_token');
    router.push(`/${locale}/login`);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center space-x-6">
            <a 
              href={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339'}/admin`}
              className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#E63946] transition-all group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Admin Portal
            </a>
            <div className="h-6 w-[1px] bg-gray-100"></div>
            <div className="flex items-center space-x-3">
               <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#E63946]">
                  <LayoutDashboard size={18} />
               </div>
               <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Admin Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-xl text-xs font-black text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
             >
                <LogOut size={16} className="mr-2" />
                Sign Out
             </button>
             <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                <UserCircle size={24} />
             </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
