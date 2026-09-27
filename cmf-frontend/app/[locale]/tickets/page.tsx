'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslations, useLocale } from 'next-intl';
import { getEvents, getFullImageUrl } from '@/lib/api';
import { Calendar, MapPin, ChevronRight, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import TicketCheckoutDrawer from '@/components/TicketCheckoutDrawer';

interface TicketTier {
  tierName: string;
  tierNameZh?: string;
  priceUsd: number;
  priceCny: number;
  startDateTime?: string;
  endDateTime?: string;
  deadline?: string;
}

interface Event {
  id: number;
  documentId: string;
  title: string;
  titleZh?: string;
  description: string;
  descriptionZh?: string;
  location: string;
  locationZh?: string;
  startDateTime: string;
  endDateTime: string;
  photo?: {
    url: string;
  };
  tiers: TicketTier[];
  isHidden?: boolean;
}

export default function TicketsPage() {
  const t = useTranslations('Home');
  const tTickets = useTranslations('Forms.tickets');
  const locale = useLocale();
  const isCn = locale === 'cn';
  const searchParams = useSearchParams();
  const directId = searchParams.get('id');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Checkout Drawer State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(0);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      setLoading(true);
      const data = await getEvents(locale);
      setEvents(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleQuantityChange = (eventId: number, tName: string, delta: number) => {
    const key = `${eventId}-${tName}`;
    setQuantities(prev => {
      const current = prev[key] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [key]: next };
    });
  };

  const getFormatDateRange = (start?: string, end?: string) => {
    if (!start) return 'TBA';
    const s = new Date(start);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    
    if (!end) return s.toLocaleDateString('en-GB', options);
    
    const e = new Date(end);
    const startStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = e.toLocaleDateString('en-GB', options);
    const timeStr = `${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')} - ${e.getHours().toString().padStart(2, '0')}:${e.getMinutes().toString().padStart(2, '0')}`;
    
    return `${startStr} - ${endStr} • ${timeStr}`;
  };

  const isTierActive = (tier: TicketTier) => {
    const now = new Date();
    if (tier.startDateTime && now < new Date(tier.startDateTime)) {
      return false;
    }
    const end = tier.endDateTime || tier.deadline;
    if (end && now > new Date(end)) {
      return false;
    }
    return true;
  };

  const handleSecureSeat = async (event: Event) => {
    const activeTier = event.tiers?.filter(isTierActive).find(t => (quantities[`${event.id}-${t.tierName}`] || 0) > 0);
    const qty = activeTier ? quantities[`${event.id}-${activeTier.tierName}`] : 0;

    if (!activeTier || qty === 0) {
      alert('Please select a ticket quantity first');
      return;
    }

    setSelectedEvent(event);
    setSelectedTier(activeTier);
    setSelectedQuantity(qty);
    setIsCheckoutOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Navbar />
      
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
           <h1 className="text-5xl font-black text-gray-900 tracking-tight">{t('eventsTitle')}<span className="text-[#E63946]">.</span></h1>
        </div>

        {loading ? (
          <div className="max-w-6xl mx-auto space-y-10 animate-pulse">
             <div className="h-[700px] bg-white rounded-[2.5rem] border border-gray-100"></div>
          </div>
        ) : (
          <div className="space-y-16 max-w-6xl mx-auto">
            {events
              .filter((event) => {
                if (directId) {
                  return event.documentId === directId || event.id.toString() === directId;
                }
                return !event.isHidden;
              })
              .map((event) => {
              const displayTitle = isCn ? (event.titleZh || event.title) : event.title;
              const displayLocation = isCn ? (event.locationZh || event.location) : event.location;
              const displayDescription = isCn ? (event.descriptionZh || event.description) : event.description;

              return (
                <div key={event.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl">
                  {/* Banner Image */}
                  {event.photo && (
                    <div className="w-full h-[400px] relative overflow-hidden bg-gray-100 p-4">
                       <img src={getFullImageUrl(event.photo.url) || ''} alt={displayTitle} className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    
                    {/* Left: Info (7/12) */}
                    <div className="lg:col-span-7 p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-gray-100">
                      <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-8 leading-tight tracking-tight uppercase">
                        {displayTitle}
                      </h3>

                      <div className="space-y-4 mb-12">
                        <div className="flex items-center space-x-3">
                          <Calendar size={18} className="text-[var(--color-cmf-red)]" />
                          <span className="text-base font-bold text-gray-900">
                            {mounted ? getFormatDateRange(event.startDateTime, event.endDateTime) : 'Loading...'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin size={18} className="text-[var(--color-cmf-red)]" />
                          <span className="text-base font-bold text-gray-900">{displayLocation}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="text-[13px] text-gray-600 leading-relaxed space-y-4 font-medium">
                          {displayDescription?.split('\n').map((para, i) => <p key={i}>{para}</p>)}
                        </div>
                      </div>
                    </div>

                    {/* Right: Booking (5/12) */}
                    <div className="lg:col-span-5 p-10 lg:p-14 bg-gray-50/50 flex flex-col">
                      <h4 className="text-[13px] font-black uppercase tracking-widest text-gray-400 mb-8">{t('selectTickets')}</h4>
                      
                      <div className="space-y-4 flex-1 mb-10">
                        {event.tiers?.filter(isTierActive).map((tier, i) => {
                          const endDate = tier.endDateTime || tier.deadline;
                          const qtyKey = `${event.id}-${tier.tierName || i}`;
                          const qty = quantities[qtyKey] || 0;
                          
                          return (
                            <div key={qtyKey} className="p-6 rounded-2xl border transition-all bg-white border-gray-100 shadow-sm">
                               <div className="flex justify-between items-center mb-0">
                                  <div className="flex-1 mr-4">
                                    <div className="text-base font-bold text-gray-900 mb-2">
                                      {isCn ? (tier.tierNameZh || tier.tierName) : tier.tierName}
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-lg font-black text-gray-900">
                                         {locale === 'cn' ? `CNY ${Number(tier.priceCny).toFixed(2)}` : `USD ${Number(tier.priceUsd).toFixed(2)}`}
                                       </span>
                                       {endDate && (
                                         <span className="text-xs text-gray-500 font-semibold mt-0.5">
                                           {isCn 
                                             ? `截止日期: ${new Date(endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })}` 
                                             : `Deadline: ${new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                         </span>
                                       )}
                                     </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                                     <button 
                                      type="button"
                                      disabled={qty === 0}
                                      onClick={() => handleQuantityChange(event.id, tier.tierName, -1)}
                                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-all border border-transparent hover:border-gray-200"
                                     >
                                       -
                                     </button>
                                     <span className="text-xs font-black min-w-[24px] text-center">{qty}</span>
                                     <button 
                                      type="button"
                                      onClick={() => handleQuantityChange(event.id, tier.tierName, 1)}
                                      className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200"
                                     >
                                       +
                                     </button>
                                  </div>
                               </div>
                            </div>
                          );
                        })}
                      </div>

                      <button 
                         onClick={() => handleSecureSeat(event)}
                         className="w-full btn-primary py-4 rounded-xl flex items-center justify-center font-black uppercase tracking-[0.2em] text-[13px] shadow-xl shadow-red-100 hover:-translate-y-0.5 active:translate-y-0"
                      >
                         {t('secureMySeat')}
                         <ChevronRight size={16} className="ml-1" />
                      </button>


                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      {selectedEvent && selectedTier && (
        <TicketCheckoutDrawer
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          event={selectedEvent}
          tier={selectedTier}
          quantity={selectedQuantity}
        />
      )}
    </main>
  );
}
