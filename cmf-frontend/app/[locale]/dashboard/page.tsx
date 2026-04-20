'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  User, 
  ShieldCheck,
  Award,
  Briefcase
} from 'lucide-react';
import { clsx } from 'clsx';

import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Forms');
  const commonT = useTranslations('Common');
  const [profile, setProfile] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch(`${strapiUrl}/api/global-setting?populate=logo`);
        const result = await res.json();
        if (result.data?.logo?.url) setLogoUrl(`${strapiUrl}${result.data.logo.url}`);
      } catch (e) {
        console.error('Logo fetch failed');
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem('cmf_token');
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      try {
        const res = await fetch(`${strapiUrl}/api/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (result.data) {
          setProfile(result.data);
        }
      } catch (err) {
        console.error('Profile fetch failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
    fetchProfile();
  }, [strapiUrl, locale, router]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getMembershipStatusInfo = (validUntil: string) => {
    if (!validUntil) return { isExpired: false, isExpiringSoon: false };
    const today = new Date();
    const expiry = new Date(validUntil);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      isExpired: diffDays < 0,
      isExpiringSoon: diffDays >= 0 && diffDays <= 30,
      daysRemaining: diffDays
    };
  };

  const [showExpired, setShowExpired] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-[#E63946] rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{commonT('loading')}</p>
      </div>
    );
  }

  if (!profile) return null;

  // Unified Wallet Logic (Migrated Legacy + New Records)
  const allWalletItems = [...(profile.wallet_records || [])];

  // Split into Active vs Expired
  const activeWallet = allWalletItems.filter(item => !getMembershipStatusInfo(item.validUntil).isExpired);
  const expiredWallet = allWalletItems.filter(item => getMembershipStatusInfo(item.validUntil).isExpired);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 px-4">
      {/* Header - Scaled Down */}
      <div className="pt-4 flex justify-between items-end">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {t('dashboard.welcome')}, {profile.firstName || t('dashboard.member')}<span className="text-[#E63946]">.</span>
        </h1>
        <Link href={`/${locale}/membership`} className="text-xs font-bold text-[#E63946] hover:underline flex items-center gap-1">
          + {t('dashboard.addNew')}
        </Link>
      </div>

      <div className="space-y-6">
        {activeWallet.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
             <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
             <p className="text-sm font-bold text-gray-400">{t('dashboard.noActive')}</p>
          </div>
        ) : (
          activeWallet.map((record: any, index: number) => {
            const displayId = record.membershipCode;
            const displayTier = record.name;
            const displayStatus = record.membershipStatus;
            const displayExpiry = record.validUntil;
            const { isExpiringSoon } = getMembershipStatusInfo(displayExpiry);

            return (
              <div key={record.id || index} className="flex justify-start">
                <div 
                  className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative group overflow-hidden animate-in slide-in-from-bottom-4" 
                  style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                >
                  {/* Accent Line */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#E63946]" />
                  
                  <div className="flex items-start gap-6">
                    {/* PHOTO SECTION */}
                    <div className="shrink-0 relative z-10">
                       <div className="w-21 h-28 aspect-[3/4] rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
                          {profile.portraitPhoto ? (
                             <img 
                               src={profile.portraitPhoto.url.startsWith('http') ? profile.portraitPhoto.url : `${strapiUrl}${profile.portraitPhoto.url}`} 
                               alt="Member" 
                               className="w-full h-full object-cover"
                             />
                          ) : (
                             <User className="w-10 h-10 text-gray-200" />
                          )}
                       </div>
                    </div>

                    {/* WATERMARK SEAL */}
                    {logoUrl && (
                      <div className="absolute -bottom-6 -right-6 w-38 h-38 opacity-[0.05] pointer-events-none select-none grayscale invert-0 transform -rotate-12 z-0">
                        <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {/* INFO SECTION */}
                    <div className="flex-1 min-w-0 py-1 relative z-10">
                      {/* Row 1: Type & Status */}
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E63946] flex items-center gap-1.5">
                          <Award className="w-3 h-3" />
                          {displayTier || 'Elite Member'}
                        </div>
                        <div className="flex items-center gap-3">
                          {isExpiringSoon && (
                            <Link 
                              href={`/${locale}/membership/join?plan=${record.membership_type?.documentId}`} 
                              className="text-[9px] font-black uppercase tracking-widest bg-[#E63946] text-white px-3 py-1 rounded-full hover:bg-black transition-all shadow-lg shadow-red-100"
                            >
                              {t('dashboard.renewNow')}
                            </Link>
                          )}
                          <div className={clsx(
                            "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            displayStatus === 'active' ? "text-emerald-500 bg-emerald-50" : "text-amber-500 bg-amber-50"
                          )}>
                            <span className={clsx("w-1.5 h-1.5 rounded-full", displayStatus === 'active' ? "bg-emerald-500 animate-pulse" : "bg-amber-500")}></span>
                            {displayStatus === 'active' ? t('dashboard.statusActive') : t('dashboard.statusPending')}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Name */}
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">
                        {profile.firstName} {profile.lastName}
                      </h2>

                      {/* Row 3: ID & Validity */}
                      <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono font-bold text-gray-800 tracking-wider">
                            {displayId || 'CMF-000000'}
                          </p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {t('dashboard.validTill')}: <span className="text-gray-900">{formatDate(displayExpiry)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* EXPIRED SECTION TOGGLE */}
        {expiredWallet.length > 0 && (
          <div className="pt-10 border-t border-gray-50">
            <button 
              onClick={() => setShowExpired(!showExpired)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all flex items-center gap-2"
            >
              {showExpired ? t('dashboard.hide') : t('dashboard.view')} {t('dashboard.expiredMemberships')} ({expiredWallet.length})
              <div className={clsx("w-1.5 h-1.5 rounded-full bg-gray-200 transition-all", showExpired && "bg-[#E63946]")} />
            </button>

            {showExpired && (
              <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {expiredWallet.map((record: any, idx: number) => (
                  <div key={record.id || idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 opacity-90 transition-opacity hover:opacity-100 uppercase tracking-tight">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-[#E63946]/40" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-[0.1em] text-gray-400">{record.membership_type?.name || 'Legacy Membership'}</p>
                        <p className="text-sm font-bold text-gray-900">{record.memberId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black tracking-[0.1em] text-gray-400">{t('dashboard.expiredOn')}</p>
                      <p className="text-xs font-bold text-gray-800">{formatDate(record.validUntil)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
