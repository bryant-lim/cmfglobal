'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Users, 
  ChevronDown, 
  User,
  ShieldCheck,
  Award,
  FilterX
} from 'lucide-react';
import { getFullImageUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  useTranslations,
  useLocale 
} from 'next-intl';

export default function DirectoryPage() {
  const t = useTranslations('Forms.dashboard');
  const locale = useLocale();
  const [members, setMembers] = useState<any[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(t('allTypes'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';

  useEffect(() => {
    fetchLogo();
    fetchMembers();
    fetchMembershipTypes();
  }, []);

  const fetchLogo = async () => {
    try {
      const res = await fetch(`${strapiUrl}/api/global-setting?populate=logo`);
      const result = await res.json();
      if (result.data?.logo?.url) setLogoUrl(`${strapiUrl}${result.data.logo.url}`);
    } catch (e) {
      console.error('Logo fetch failed');
    }
  };

  const fetchMembers = async () => {
    try {
      const strapiLocale = locale === 'cn' ? 'zh-Hans' : 'en';
      const res = await fetch(`${strapiUrl}/api/profiles/directory?locale=${strapiLocale}`);
      const result = await res.json();
      if (result.data) {
        setMembers(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch directory');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembershipTypes = async () => {
    try {
      const strapiLocale = locale === 'cn' ? 'zh-Hans' : 'en';
      const res = await fetch(`${strapiUrl}/api/membership-types?locale=${strapiLocale}`);
      const result = await res.json();
      if (result.data) {
        const names = result.data.map((t: any) => t.name).sort();
        setAvailableTypes([t('allTypes'), ...names]);
      }
    } catch (err) {
      console.error('Failed to fetch membership types');
    }
  };

  // Extract all unique membership types for the dropdown (Fallback if fetch fails)
  const allTypes = useMemo(() => {
    if (availableTypes.length > 0) return availableTypes;
    const types = new Set<string>();
    members.forEach(m => m.membershipTypes.forEach((t: string) => types.add(t)));
    return [t('allTypes'), ...Array.from(types).sort()];
  }, [members, availableTypes, t]);

  // Filtered list logic
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const chineseName = (m.chineseName || '').toLowerCase();
      const matchSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          chineseName.includes(searchTerm.toLowerCase()) ||
                          (m.memberId && m.memberId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchType = selectedType === t('allTypes') || m.membershipTypes.includes(selectedType);
      
      return matchSearch && matchType;
    });
  }, [members, searchTerm, selectedType, t]);

  const filteredTypes = allTypes.filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
              <Users className="text-[#E63946]" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('loadingDirectory')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
           <h1 className="text-5xl font-black text-gray-900 tracking-tight">{t('directoryTitle')}<span className="text-[#E63946]">.</span></h1>
        </div>

        {/* Controls Section */}
        <div className="relative z-20 flex flex-col md:flex-row gap-4 mb-16 animate-in fade-in duration-1000 delay-300">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center text-gray-400 group-focus-within:text-[#E63946] transition-colors">
               <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder={t('searchDirectory')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-red-50/50 focus:border-[#E63946] transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Membership Type Dropdown */}
          <div className="relative min-w-[300px]">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 px-8 flex items-center justify-between text-sm font-bold shadow-sm hover:border-red-200 transition-all text-gray-700"
            >
              <span className="truncate">{selectedType === t('allTypes') ? t('filterByType') : selectedType}</span>
              <ChevronDown className={isDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} size={18} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-4 animate-in zoom-in-95 duration-200 origin-top">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-2.5 text-gray-300" size={14} />
                  <input 
                    type="text" 
                    placeholder={t('searchTypes')}
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:ring-2 focus:ring-red-100 outline-none"
                  />
                </div>
                <div className="max-h-[250px] overflow-y-auto space-y-1 custom-scrollbar">
                  {filteredTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                        selectedType === type ? 'bg-[#E63946] text-white' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                  {filteredTypes.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-[10px] font-black uppercase italic">{t('noTypesFound')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="py-40 text-center space-y-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FilterX size={32} className="text-gray-200" />
             </div>
             <h3 className="text-xl font-black text-gray-900">{t('noMembersFound')}</h3>
             <p className="text-sm font-medium text-gray-400">{t('noMembersDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMembers.map((member, idx) => (
              <div 
                key={member.id} 
                className="group animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center h-full relative overflow-hidden">
                   {/* WATERMARK SEAL */}
                   {logoUrl && (
                     <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.04] pointer-events-none select-none transform -rotate-12 z-0">
                       <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                     </div>
                   )}
                  {/* Portrait 3:4 */}
                  <div className="w-full aspect-[3/4] rounded-[2rem] bg-gray-50 overflow-hidden mb-6 border border-gray-100 shadow-inner group-hover:border-red-100 transition-colors relative z-10">
                     {member.portraitPhoto ? (
                       <img 
                         src={getFullImageUrl(member.portraitPhoto.url)} 
                         alt={`${member.firstName} ${member.lastName}`}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <User size={64} className="opacity-50" />
                       </div>
                     )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-6 flex-1 relative z-10">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-[#E63946] transition-colors line-clamp-1">
                      {member.firstName} {member.lastName}
                      {member.chineseName && <span className="ml-2 text-lg font-bold text-gray-400 group-hover:text-[#E63946]/50">{member.chineseName}</span>}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full w-fit mx-auto uppercase">
                       {member.memberId || 'PENDING'}
                    </div>
                  </div>

                  {/* Tiers */}
                  <div className="flex flex-wrap justify-center gap-1.5 pt-4 border-t border-gray-50 w-full">
                     {member.membershipTypes.map((type: string) => (
                       <span 
                         key={type} 
                         className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-red-50 text-[#E63946] rounded-lg transition-all"
                       >
                         {type}
                       </span>
                     ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(230, 57, 70, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(230, 57, 70, 0.3);
        }
      `}</style>
    </div>
  );
}
