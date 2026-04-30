'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Users, 
  ChevronDown, 
  User,
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
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
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
    fetchMembers(1);
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

  const fetchMembers = async (pageNumber: number, append = false, query = searchTerm, type = selectedType) => {
    if (append) setIsFetchingMore(true);
    else setIsLoading(true);

    try {
      const strapiLocale = locale === 'cn' ? 'zh-Hans' : 'en';
      let url = `${strapiUrl}/api/profiles/directory?locale=${strapiLocale}&page=${pageNumber}&pageSize=24`;
      
      if (query) url += `&search=${encodeURIComponent(query)}`;
      if (type !== t('allTypes')) url += `&type=${encodeURIComponent(type)}`;

      const res = await fetch(url);
      const result = await res.json();
      
      if (result.data) {
        if (append) {
          setMembers(prev => [...prev, ...result.data]);
        } else {
          setMembers(result.data);
        }
        setPagination(result.meta?.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch directory');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (isLoading && page === 1) return;
    
    const timer = setTimeout(() => {
      setPage(1);
      fetchMembers(1, false, searchTerm, selectedType);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedType]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMembers(nextPage, true);
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

  const displayMembers = members;
  const filteredTypes = availableTypes.filter(type => type.toLowerCase().includes(typeSearch.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
              <Users className="text-[#E63946]" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
           <h1 className="text-5xl font-black text-gray-900 tracking-tight">{t('directoryTitle')}<span className="text-[#E63946]">.</span></h1>
        </div>

        <div className="relative z-20 flex flex-col md:flex-row gap-4 mb-16 animate-in fade-in duration-1000 delay-300">
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
                </div>
              </div>
            )}
          </div>
        </div>

        {displayMembers.length === 0 ? (
          <div className="py-40 text-center space-y-4 animate-in fade-in duration-500">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FilterX size={32} className="text-gray-200" />
             </div>
             <h3 className="text-xl font-black text-gray-900">{t('noMembersFound')}</h3>
             <p className="text-sm font-medium text-gray-400">{t('noMembersDesc')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayMembers.map((member, idx) => (
                <div 
                  key={member.id} 
                  className="group h-[500px] perspective-1000 animate-in fade-in slide-in-from-bottom-6 duration-700"
                  style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative w-full h-full transition-transform duration-700 preserve-3d group-hover:rotate-y-180">
                    <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center overflow-hidden">
                      <div className="w-full aspect-[3/4] rounded-[2rem] bg-gray-50 overflow-hidden mb-6 border border-gray-100 shadow-inner group-hover:border-red-100 transition-colors relative z-10">
                        {member.portraitPhoto ? (
                          <img 
                            src={getFullImageUrl(member.portraitPhoto.url)} 
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-full h-full object-cover transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                             <User size={64} className="opacity-50" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 mb-6 flex-1 relative z-10 w-full">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight line-clamp-2 leading-tight min-h-[3rem] flex items-center justify-center">
                          <div>
                            {member.firstName} {member.lastName}
                            {member.chineseName && <span className="ml-2 text-base font-bold text-gray-400 block sm:inline">{member.chineseName}</span>}
                          </div>
                        </h3>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-full w-fit mx-auto uppercase">
                           {member.memberId || 'PENDING'}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-1.5 pt-4 border-t border-gray-50 w-full">
                         {member.membershipTypes.map((type: string) => (
                           <span 
                             key={type} 
                             className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-red-50 text-[#E63946] rounded-lg"
                           >
                             {type}
                           </span>
                         ))}
                      </div>
                    </div>

                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gray-900 rounded-[2.5rem] p-8 flex flex-col shadow-2xl overflow-hidden border border-gray-800">
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                          <Award className="text-[#E63946]" size={20} />
                          <h3 className="text-xs font-black uppercase tracking-widest text-white">{t('membershipHistory')}</h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                          {member.membershipHistory && member.membershipHistory.map((h: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group/item">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{h.year}</p>
                                <p className="text-xs font-bold text-white group-hover/item:text-[#E63946] transition-colors">{h.type}</p>
                              </div>
                              <div className={`w-1.5 h-1.5 rounded-full ${h.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-700'}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.page < pagination.pageCount && (
              <div className="mt-20 flex justify-center animate-in fade-in duration-1000">
                <button
                  onClick={loadMore}
                  disabled={isFetchingMore}
                  className="group relative bg-white border border-gray-100 px-10 py-5 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-red-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {isFetchingMore ? (
                      <div className="w-5 h-5 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Users className="text-[#E63946] group-hover:scale-110 transition-transform" size={20} />
                    )}
                    <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                      {isFetchingMore ? t('loading') : t('loadMore')}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(230, 57, 70, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(230, 57, 70, 0.3); }
      `}</style>
    </div>
  );
}
