'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Ticket, 
  ShieldCheck,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MyTicketsPage() {
  const t = useTranslations('Forms.dashboard');
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';

  useEffect(() => {
    const fetchTickets = async () => {
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
        
        if (result.data && result.data.tickets) {
          setTickets(result.data.tickets);
        }
      } catch (err) {
        console.error('Tickets fetch failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [strapiUrl, locale, router]);

  const handleDownload = (attendeeId: string) => {
    window.open(`${strapiUrl}/api/orders/ticket/${attendeeId}/pdf`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-[#E63946] rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('loadingTickets')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      <div className="pt-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
          {t('myTickets')}<span className="text-[#E63946]">.</span>
        </h1>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
          {t('ticketsDesc')}
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[40px] border border-dashed border-gray-200 shadow-sm">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-gray-200" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noTickets')}</h3>
           <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8">
             {t('ticketsDesc')}
           </p>
           <button 
             onClick={() => router.push(`/${locale}/tickets`)}
             className="px-8 py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#E63946] transition-all"
           >
             {t('browseEvents')}
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {tickets.map((ticket, idx) => (
            <div key={ticket.id || idx} className="group relative bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
               {/* Ticket Top - Header style */}
               <div className="p-8 pb-4 relative">
                  <div className="space-y-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-[#E63946] text-[9px] font-black uppercase tracking-widest leading-none">
                       Official Ticket
                    </span>
                    <h2 className="text-xl font-black text-gray-900 pr-12 leading-tight">
                       {ticket.event?.title || 'CMF Global Event'}
                    </h2>
                  </div>
               </div>

               {/* Ticket Main Info */}
               <div className="px-8 py-6 space-y-6 flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                        <Calendar className="w-4 h-4 text-[#E63946]" />
                        <span>{ticket.event?.startDateTime ? new Date(ticket.event.startDateTime).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' }) : 'Date TBD'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                        <MapPin className="w-4 h-4 text-[#E63946]" />
                        <span className="truncate">{ticket.event?.location || 'Venue TBD'}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-[#F8F9FA] rounded-[24px] space-y-4">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Pass Holder</p>
                        <p className="text-base font-black text-gray-900 tracking-tight">
                           {ticket.firstName} {ticket.lastName}
                        </p>
                     </div>
                     <div className="flex justify-between items-end gap-4 pt-4 border-t border-gray-200/50">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Reference No</p>
                           <p className="text-sm font-mono font-bold text-[#E63946]">
                              {ticket.referenceCode}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Status</p>
                           <span className="text-[9px] font-black uppercase bg-emerald-500 text-white px-3 py-1 rounded-full">Valid Card</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Ticket Footer - Perforated Look */}
               <div className="relative h-16 bg-gray-50 border-t border-dashed border-gray-200 mt-auto flex items-center px-8">
                  {/* Perforation holes */}
                  <div className="absolute top-0 -left-3 w-6 h-6 bg-[#F8F9FA] rounded-full -mt-3 border-r border-gray-200/50" />
                  <div className="absolute top-0 -right-3 w-6 h-6 bg-[#F8F9FA] rounded-full -mt-3 border-l border-gray-200/50" />
                  
                  <div className="flex justify-between items-center w-full">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {t('digitalEntry')}
                     </p>
                     <button 
                       onClick={() => handleDownload(ticket.documentId)}
                       className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E63946] hover:text-black transition-colors"
                     >
                        {t('receipt')} <ExternalLink className="w-3 h-3" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
