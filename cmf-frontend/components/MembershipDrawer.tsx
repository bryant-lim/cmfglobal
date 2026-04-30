'use client';

import { X, Check, ArrowRight } from 'lucide-react';
import { getFullImageUrl } from '@/lib/api';
import Link from 'next/link';

interface MembershipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  locale: string;
}

export default function MembershipDrawer({ isOpen, onClose, plan, locale }: MembershipDrawerProps) {
  if (!plan) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full lg:w-[500px] bg-white z-[101] shadow-2xl transition-transform duration-500 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             {plan.photo && (
               <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                 <img src={getFullImageUrl(plan.photo.url) || ''} alt={plan.name} className="w-full h-full object-contain" />
               </div>
             )}
             <div>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{locale === 'cn' ? (plan.nameZh || plan.name) : plan.name}</h3>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 {plan.category?.name || 'General Membership'}
               </span>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
            {/* Price Highlight */}
            <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
               <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-gray-900">
                    {locale === 'cn' ? `CNY ${Number(plan.priceCny).toFixed(2)}` : `USD ${Number(plan.priceUsd).toFixed(2)}`}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase">/ YEAR</span>
               </div>
               <div className="text-xs font-bold text-[var(--color-cmf-red)] mt-2 uppercase">
                 {locale === 'cn' ? `USD ${Number(plan.priceUsd).toFixed(2)}` : `CNY ${Number(plan.priceCny).toFixed(2)}`}
               </div>
            </div>

            {/* Description / About */}
               <div className="text-gray-600 leading-relaxed font-medium space-y-4 text-[13px]">
                  {/* Rendering simple paragraphs if description is plain text, or rich text if available */}
                  {(locale === 'cn' ? (plan.descriptionZh || plan.description) : plan.description)?.split('\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  )) || <p>Elevate your career with the prestigious {locale === 'cn' ? (plan.nameZh || plan.name) : plan.name} through the CMF Global network.</p>}
               </div>

            {/* Core Benefits */}
            <div className="space-y-6">
               <ul className="space-y-4">
                {(locale === 'cn' ? (plan.featuresZh || plan.features) : plan.features)?.split('\n').map((feature: string) => (
                  <li key={feature} className="flex items-start">
                     <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center mr-4 mt-0.5">
                        <Check size={14} className="text-green-600" />
                     </div>
                     <span className="text-gray-700 font-medium text-[13px]">{feature}</span>
                  </li>
                ))}
               </ul>
            </div>
        </div>

        {/* Footer Action */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50">
           <Link 
              href={`/${locale}/membership/join?plan=${plan.documentId}`}
              className="w-full btn-primary py-3.5 rounded-2xl font-black flex items-center justify-center shadow-xl shadow-red-100 uppercase tracking-widest text-[11px]"
           >
              Apply Now
              <ArrowRight size={16} className="ml-2" />
           </Link>
           <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-tight">
             Secure payment via HitPay
           </p>
        </div>
      </div>
    </>
  );
}
