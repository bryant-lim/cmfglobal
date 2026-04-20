'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  History,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function OrdersPage() {
  const t = useTranslations('Forms.dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('cmf_token');
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      const res = await fetch(`${strapiUrl}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.data) {
        setOrders(result.data);
      }
    } catch (err) {
      console.error('Orders fetch failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <span className="flex items-center w-fit gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tight">
            <CheckCircle2 size={12} /> {t('paid')}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center w-fit gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-tight">
            <XCircle size={12} /> {t('failed')}
          </span>
        );
      default:
        return (
          <span className="flex items-center w-fit gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-tight">
            <Clock size={12} /> {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
           <History size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('loadingOrders')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('myOrders')}<span className="text-[#E63946]">.</span></h1>
        </div>
        <Link href={`/${locale}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#E63946] transition-all shadow-sm">
          <Home size={14} /> {t('goHome')}
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-gray-200" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noOrders')}</h3>
           <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8 font-medium leading-relaxed">
             {t('noOrdersDesc')}
           </p>
           <button 
             onClick={() => router.push(`/${locale}/membership`)}
             className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E63946] transition-all"
           >
             {t('joinMembership')}
           </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 italic">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#1E293B] italic w-[20%]">Ref / Date</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#1E293B] italic w-[35%]">{t('description')}</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#1E293B] italic w-[30%]">{t('status')}</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-[#1E293B] italic text-right w-[15%]">{t('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-mono font-bold text-gray-900">{order.refNo}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                          {new Date(order.createdAt).toLocaleDateString(locale, { dateStyle: 'medium' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1 max-w-[280px]">
                          <p className="text-sm font-black text-gray-800 leading-snug">
                             {order.membership_type?.name || order.event?.title || (order.type === 'membership' ? 'CMF Membership' : 'Event Ticket')}
                          </p>
                          <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                             {order.type === 'membership' ? 'Subscription' : 'Event Ticket'}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          {getStatusBadge(order.orderStatus)}
                          {order.orderStatus === 'paid' && (
                            <button 
                              onClick={async () => {
                                const token = localStorage.getItem('cmf_token');
                                try {
                                  const res = await fetch(`${strapiUrl}/api/orders/${order.documentId}/invoice`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  if (res.ok) {
                                    const blob = await res.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Invoice-${order.refNo}.pdf`;
                                    a.click();
                                  }
                                } catch (err) {
                                  alert('Could not download receipt.');
                                }
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-[#E63946] transition-all flex items-center gap-2"
                              title="Download Receipt"
                            >
                               <ExternalLink size={14} />
                              <span className="text-[10px] font-black uppercase">{t('receipt')}</span>
                            </button>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                       <p className="text-base font-black text-gray-900 leading-none">
                          {order.currency || 'USD'} {order.amountPaid?.toFixed(2)}
                       </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {t('showing')} {orders.length} {t('transactions')}
             </p>
             <Link href={`/${locale}/membership`} className="text-[10px] font-black uppercase tracking-widest text-[#E63946] flex items-center gap-2 hover:underline">
                {t('newPurchase')} <ChevronRight size={12} />
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
