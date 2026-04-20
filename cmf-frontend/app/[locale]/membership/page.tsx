'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getMemberships, getFullImageUrl } from '@/lib/api';

interface Plan {
  id: number;
  documentId: string;
  name: string;
  nameZh?: string;
  priceUsd: number;
  priceCny: number;
  features: string;
  featuresZh?: string;
  description?: string;
  descriptionZh?: string;
  photo?: {
    url: string;
  };
  category?: {
    name: string;
  };
}

import MembershipDrawer from '@/components/MembershipDrawer';

export default function MembershipPage() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [activeTiers, setActiveTiers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const token = localStorage.getItem('cmf_token');
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';
      
      const [data, profileRes] = await Promise.all([
        getMemberships(locale),
        token ? fetch(`${strapiUrl}/api/profiles/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()) : Promise.resolve(null)
      ]);

      setPlans(data);

      if (profileRes?.data) {
        const p = profileRes.data;
        const tiers = [];
        // Check unified wallet
        if (p.wallet_records) {
          p.wallet_records.forEach((r: any) => {
            if (r.membership_type?.documentId) tiers.push(r.membership_type.documentId);
          });
        }
        setActiveTiers(tiers);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const openPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDrawerOpen(true);
  };

  // Group plans by category
  const categories = Array.from(new Set(plans.map(p => p.category?.name || 'General')));

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />

      <MembershipDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        plan={selectedPlan}
        locale={locale}
      />
      
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">CMF Global Membership<span className="text-[#E63946]">.</span></h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
             {[...Array(8)].map((_, i) => <div key={i} className="h-80 bg-white rounded-3xl"></div>)}
          </div>
        ) : (
          <div className="space-y-24">
            {categories.map((catName) => {
              const categoryPlans = plans.filter(p => (p.category?.name || 'General') === catName);
              return (
                <div key={catName} className="space-y-10">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">{catName}</h3>
                    <div className="h-[1px] w-full bg-gray-200"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryPlans.map((plan) => (
                      <div 
                        key={plan.id} 
                        onClick={() => !activeTiers.includes(plan.documentId) && openPlan(plan)}
                        className={clsx(
                          "relative flex flex-col p-6 bg-white border border-gray-100 rounded-3xl shadow-sm transition-all group",
                          !activeTiers.includes(plan.documentId) ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : "cursor-default"
                        )}
                      >
                        
                        {plan.photo && (
                          <div className={clsx(
                            "aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-6 transition-transform duration-500",
                            !activeTiers.includes(plan.documentId) && "group-hover:scale-[1.02]"
                          )}>
                            <img src={getFullImageUrl(plan.photo.url) || ''} alt={plan.name} className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="mb-8">
                          <h4 className="text-lg font-bold text-gray-900 mb-2 truncate">
                            {locale === 'cn' ? (plan.nameZh || plan.name) : plan.name}
                          </h4>
                          <div className="flex items-baseline space-x-1">
                            <span className="text-xl font-black text-gray-900">
                              {locale === 'cn' ? `CNY ${plan.priceCny}` : `USD ${plan.priceUsd}`}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">/ year</span>
                          </div>
                          <div className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tight">
                            {locale === 'cn' ? `Approx. USD ${plan.priceUsd}` : `Approx. CNY ${plan.priceCny}`}
                          </div>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                          {(locale === 'cn' ? (plan.featuresZh || plan.features) : plan.features)?.split('\n').slice(0, 4).map((feature) => (
                            <li key={feature} className="flex items-start text-[11px] text-gray-500 font-medium leading-relaxed">
                              <Check size={12} className="mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                              <span className="line-clamp-2">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div 
                          className={clsx(
                            "w-full py-4 rounded-xl font-black text-center transition-all uppercase tracking-widest text-[10px] flex items-center justify-center",
                            activeTiers.includes(plan.documentId) 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-gray-100 text-gray-400 group-hover:bg-[var(--color-cmf-red)] group-hover:text-white"
                          )}
                        >
                          {activeTiers.includes(plan.documentId) ? 'Active Membership' : 'View Details'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
