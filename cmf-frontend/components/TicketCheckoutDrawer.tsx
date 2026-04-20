'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, CreditCard, User, Loader2 } from 'lucide-react';

interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
}

interface TicketCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  tier: any;
  quantity: number;
}

export default function TicketCheckoutDrawer({ isOpen, onClose, event, tier, quantity }: TicketCheckoutDrawerProps) {
  const t = useTranslations('Forms');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [buyerInfo, setBuyerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    billingAddress: '',
  });

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCn = locale === 'cn';
  const currencyCode = isCn ? 'CNY' : 'USD';
  const unitPrice = isCn ? (tier?.priceCny || 0) : (tier?.priceUsd || 0);
  const subtotal = unitPrice * quantity;
  const taxAmount = (subtotal * taxPercentage) / 100;
  const total = subtotal + taxAmount;

  useEffect(() => {
    if (isOpen && quantity > 0) {
      // Initialize attendees based on quantity
      const initialAttendees = Array.from({ length: quantity }).map(() => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
      }));
      setAttendees(initialAttendees);

      // Fetch Tax
      const fetchTax = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/payment-setting`);
          const { data } = await res.json();
          if (data?.adminTaxPercentage) {
            setTaxPercentage(data.adminTaxPercentage);
          }
        } catch (e) {}
      };
      fetchTax();

      // Auto-populate buyer info if logged in
      const token = localStorage.getItem('cmf_token');
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/profiles/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(data => {
            if (data.data) {
                const p = data.data;
                setBuyerInfo({
                    firstName: p.firstName || '',
                    lastName: p.lastName || '',
                    email: p.email || '',
                    phone: p.phone || '',
                    companyName: p.companyName || '',
                    billingAddress: p.billingAddress || '',
                });
            }
        }).catch(e => console.log('Not logged in or profile not found'));
      }
    }
  }, [isOpen, quantity]);

  const handleAttendeeChange = (index: number, field: keyof Attendee, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = { ...newAttendees[index], [field]: value };
    setAttendees(newAttendees);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('cmf_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders/ticket-checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          eventId: event.documentId,
          tierId: tier.tierName,
          quantity,
          buyerInfo,
          attendees,
          currency: currencyCode // Pass the determined currency
        })
      });

      const data = await res.json();
      if (data.paymentUrl) {
         window.location.href = data.paymentUrl;
      } else {
        const errorMsg = data.error?.message || data.message || 'Payment initiation failed';
        alert(`Error: ${errorMsg}`);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to payment gateway');
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t('tickets.checkout')}</h2>
            <p className="text-sm font-bold text-[#E63946] mt-1">
              {isCn ? (event.titleZh || event.title) : event.title} - {isCn ? (tier.tierNameZh || tier.tierName) : tier.tierName} x {quantity}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 bg-gray-50/30">
          
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-12">
            
            {/* 1. Billing Details */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                 <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-[#E63946]" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">{t('tickets.billingDetails')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  required
                  placeholder={t('labels.firstName')}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                  value={buyerInfo.firstName}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, firstName: e.target.value })}
                />
                <input
                  required
                  placeholder={t('labels.lastName')}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                  value={buyerInfo.lastName}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, lastName: e.target.value })}
                />
                <input
                  required
                  type="email"
                  placeholder={t('labels.email')}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                />
                <input
                  required
                  placeholder={t('labels.phone')}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-300"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                />
                <div className="md:col-span-2">
                   <textarea
                    required
                    placeholder={t('labels.billingAddress')}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 resize-none placeholder:text-gray-300"
                    value={buyerInfo.billingAddress}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, billingAddress: e.target.value })}
                   />
                </div>
              </div>
            </section>

             {/* 2. Attendee Details */}
            <section className="space-y-4">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                 <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                       <User className="w-4 h-4 text-[#E63946]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{t('tickets.attendeeInfo')}</h3>
                 </div>
                 
                 <button 
                  type="button"
                  onClick={() => {
                    if (attendees.length > 0) {
                      const newAttendees = [...attendees];
                      newAttendees[0] = {
                        firstName: buyerInfo.firstName,
                        lastName: buyerInfo.lastName,
                        email: buyerInfo.email,
                        phone: buyerInfo.phone,
                        companyName: buyerInfo.companyName
                      };
                      setAttendees(newAttendees);
                    }
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-[#E63946] bg-red-50 px-4 py-2 rounded-xl hover:bg-[#E63946] hover:text-white transition-all w-fit"
                 >
                   {t('tickets.imAttending')}
                 </button>
              </div>

               {attendees.map((a, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="px-3 py-1 rounded-full bg-gray-100 text-[11px] font-black uppercase text-gray-700 tracking-widest border border-gray-200">
                        {t('tickets.attendee')} {idx + 1}
                     </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      required
                      placeholder={t('labels.firstName')}
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      value={a.firstName}
                      onChange={(e) => handleAttendeeChange(idx, 'firstName', e.target.value)}
                    />
                    <input
                      required
                      placeholder={t('labels.lastName')}
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      value={a.lastName}
                      onChange={(e) => handleAttendeeChange(idx, 'lastName', e.target.value)}
                    />
                    <input
                      required
                      type="email"
                      placeholder={t('labels.email')}
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      value={a.email}
                      onChange={(e) => handleAttendeeChange(idx, 'email', e.target.value)}
                    />
                    <input
                      required
                      placeholder={t('labels.phone')}
                      className="px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                      value={a.phone}
                      onChange={(e) => handleAttendeeChange(idx, 'phone', e.target.value)}
                    />
                    <div className="md:col-span-2">
                      <input
                        required
                        placeholder={t('labels.company')}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#E63946] focus:ring-4 focus:ring-red-50 transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400"
                        value={a.companyName}
                        onChange={(e) => handleAttendeeChange(idx, 'companyName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </form>
        </div>

        {/* Footer Summary & Action */}
        <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <div className="space-y-3 mb-6 px-2">
            <div className="flex justify-between text-xs font-bold text-gray-600">
               <span>{t('tickets.ticketPrice')} x{quantity}</span>
               <span>{currencyCode} {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-600">
               <span>{t('tickets.adminTax')} ({taxPercentage}%)</span>
               <span>{currencyCode} {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
               <span className="text-sm font-black uppercase tracking-widest text-gray-900">{t('tickets.totalPayable')}</span>
               <span className="text-3xl font-black text-gray-900">{currencyCode} {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="w-full bg-[#E63946] hover:bg-black text-white font-black py-4 rounded-xl shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t('tickets.proceedPayment')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
