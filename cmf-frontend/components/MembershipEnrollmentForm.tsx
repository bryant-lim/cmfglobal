'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Check, Search, User, Mail, Phone, MapPin, 
  Building, Camera, FileText, Upload, Copy, 
  ShieldCheck, ChevronLeft, ChevronRight,
  CreditCard
} from 'lucide-react';
import { getMembershipByDocumentId, getPaymentSettings, getFullImageUrl } from '@/lib/api';
import ImageCropper from './ImageCropper';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana",
  "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

function SearchableSelect({ label, value, onChange, icon: Icon, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => 
    COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{label} *</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full pl-12 pr-10 py-4 bg-white border border-gray-300 rounded-2xl focus-within:ring-2 focus-within:ring-red-100 outline-none transition-all font-bold cursor-pointer flex items-center shadow-sm"
      >
        <Icon size={16} className="absolute left-4 text-gray-400" />
        {value || <span className="text-gray-400 font-medium">{placeholder || "Select Option"}</span>}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div className="p-3 border-b border-gray-100 flex items-center space-x-2">
              <Search size={14} className="text-gray-400" />
              <input 
                autoFocus 
                className="w-full outline-none text-sm font-medium" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="max-h-[250px] overflow-y-auto">
              {filtered.map(c => (
                <div 
                  key={c} 
                  onClick={() => { onChange(c); setIsOpen(false); setSearch(''); }}
                  className="px-5 py-3 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-[var(--color-cmf-red)] cursor-pointer transition-colors"
                >
                  {c}
                </div>
              ))}
              {filtered.length === 0 && <div className="p-5 text-xs text-gray-400 font-bold text-center">No results found</div>}
           </div>
        </div>
      )}
    </div>
  );
}

export default function MembershipEnrollmentForm() {
  const t = useTranslations('Forms');
  const commonT = useTranslations('Common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const planId = searchParams.get('plan');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pricing State
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    chineseName: '',
    email: '',
    phone: '',
    country: 'China',
    companyName: '',
    designation: '',
    passportNo: '',
    tShirtSize: '',
    gender: '',
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',
    billingCountry: 'China',
  });

  const isCn = locale === 'cn';
  const currencyCode = isCn ? 'CNY' : 'USD';

  useEffect(() => {
    async function fetchPricing() {
      if (planId) {
        const [planData, settingsData] = await Promise.all([
          getMembershipByDocumentId(planId),
          getPaymentSettings()
        ]);
        setPlanDetails(planData);
        setSettings(settingsData);
      }
    }
    fetchPricing();
  }, [planId]);

  // Phase 3: VIP Express Auto-Populate
  useEffect(() => {
    async function autopopulateProfile() {
      const token = localStorage.getItem('cmf_token');
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';
      
      if (token) {
        try {
          const res = await fetch(`${strapiUrl}/api/profiles/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await res.json();
          
          if (result.data) {
            const p = result.data;
            setFormData(prev => ({
              ...prev,
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              chineseName: p.chineseName || '',
              email: p.email || '',
              phone: p.phone || '',
              country: p.country || 'China',
              companyName: p.companyName || '',
              designation: p.designation || '',
              passportNo: p.passportNo || '',
              gender: p.gender || '',
              tShirtSize: p.tShirtSize || '',
              billingName: p.billingName || `${p.firstName} ${p.lastName}`.trim(),
              billingEmail: p.billingEmail || p.email || '',
              billingPhone: p.billingPhone || p.phone || '',
              billingAddress: p.billingAddress || '',
              billingCountry: p.billingCountry || p.country || 'China'
            }));
          }
        } catch (err) {
          console.error('❌ VIP Express: Autopopulate failed', err);
        }
      }
    }
    autopopulateProfile();
  }, []);

  const pricing = useMemo(() => {
    if (!planDetails || !settings) return null;
    const subtotal = isCn ? (planDetails.priceCny || 0) : (planDetails.priceUsd || 0);
    const taxPercentage = settings.adminTaxPercentage || 0;
    const tax = subtotal * (taxPercentage / 100);
    return {
      subtotal,
      tax,
      total: subtotal + tax,
      taxPercentage
    };
  }, [planDetails, settings, isCn]);

  const [portraitPhoto, setPortraitPhoto] = useState<Blob | null>(null);
  const [incomeSlip, setIncomeSlip] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyPersonalInfoToBilling = () => {
    setFormData(prev => ({
      ...prev,
      billingName: `${prev.firstName} ${prev.lastName}`.trim(),
      billingEmail: prev.email,
      billingPhone: prev.phone,
      billingCountry: prev.country
    }));
  };

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.gender || !formData.tShirtSize) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    }
    if (s === 2) {
      return !!(formData.companyName && formData.designation && formData.passportNo && incomeSlip);
    }
    if (s === 3) {
      return !!(formData.billingName && formData.billingEmail && formData.billingPhone && formData.billingAddress);
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      setError('Please complete all mandatory fields correctly.');
      window.scrollTo(0, 0);
      return;
    }
    setError(null);
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const uploadPromises = [];
      
      const photoFormData = new FormData();
      if (portraitPhoto) {
        photoFormData.append('files', portraitPhoto, `${formData.firstName}_portrait.jpg`);
        uploadPromises.push(fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, { method: 'POST', body: photoFormData }).then(r => r.json()));
      }

      const slipFormData = new FormData();
      if (incomeSlip) {
        slipFormData.append('files', incomeSlip);
        uploadPromises.push(fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`, { method: 'POST', body: slipFormData }).then(r => r.json()));
      }

      const uploadResults = await Promise.all(uploadPromises);
      const files = {
        portraitPhotoId: uploadResults[0]?.[0]?.id,
        incomeSlipId: uploadResults[1]?.[0]?.id
      };

      const token = localStorage.getItem('cmf_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders/enroll`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          planId,
          formData,
          files,
          currency: currencyCode // Send the locale-based currency
        })
      });

      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error?.message || 'Failed to initiate payment');
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during enrollment.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between mb-12 px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center space-y-2 relative flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${
              step >= s ? 'bg-[var(--color-cmf-red)] text-white shadow-lg shadow-red-100' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s ? <Check size={18} strokeWidth={3} /> : s}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              step >= s ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {s === 1 ? t('profile.personalId') : s === 2 ? t('profile.professional') : t('profile.billing')}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-sm font-bold animate-in fade-in duration-300">
          <FileText size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.firstName')} *</label>
                 <div className="relative">
                   <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.firstName')} />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.lastName')} *</label>
                 <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.lastName')} />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.chineseName')}</label>
               <input name="chineseName" value={formData.chineseName} onChange={handleInputChange} className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.chineseName')} />
            </div>

           <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.email')} *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.email')} />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.phone')} *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.phone')} />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.gender')} *</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleInputChange} 
                    className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm appearance-none"
                  >
                    <option value="">{t('labels.gender')}</option>
                    <option value="Male">{t('labels.male')}</option>
                    <option value="Female">{t('labels.female')}</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.tShirtSize')} *</label>
                  <select 
                    name="tShirtSize" 
                    value={formData.tShirtSize} 
                    onChange={handleInputChange} 
                    className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm appearance-none"
                  >
                    <option value="">{t('labels.tShirtSize')}</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
               </div>
            </div>

           <SearchableSelect 
             label={t('labels.country')} 
             value={formData.country} 
             onChange={(val: string) => setFormData(p => ({ ...p, country: val }))} 
             icon={MapPin}
             placeholder={t('labels.country')}
           />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
           <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.company')} *</label>
              <div className="relative">
                <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.company')} />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.designation')} *</label>
              <input name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.designation')} />
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.passportNo')} *</label>
              <input name="passportNo" value={formData.passportNo} onChange={handleInputChange} className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.idNo')} />
           </div>

           <div className="p-6 bg-white border border-gray-300 rounded-[2.5rem] space-y-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center space-x-3">
                    <Camera size={18} className="text-[var(--color-cmf-red)]" />
                    <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">{t('labels.uploadPortrait')} *</h4>
                 </div>
                 <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">3:4 Ratio Required</div>
              </div>
              <div className="relative">
                <ImageCropper onCropComplete={(blob) => setPortraitPhoto(blob)} />
              </div>
           </div>

           <div className="p-6 bg-white border border-gray-300 rounded-[2.5rem] space-y-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                 <FileText size={18} className="text-[var(--color-cmf-red)]" />
                 <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">{t('labels.uploadIncomeSlip')} *</h4>
              </div>
              <label className={`relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer ${
                incomeSlip ? 'border-green-400 bg-green-50/20' : 'border-gray-200 bg-gray-50/30 hover:border-red-300'
              }`}>
                 <input type="file" className="hidden" onChange={(e) => setIncomeSlip(e.target.files?.[0] || null)} />
                 <div className="space-y-2">
                    {incomeSlip ? (
                       <>
                         <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
                           <Check size={24} strokeWidth={3} />
                         </div>
                         <div className="text-sm font-black text-green-800">{incomeSlip.name}</div>
                       </>
                    ) : (
                       <>
                         <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                         <div className="text-sm font-black text-gray-900">{t('labels.uploadIncomeSlip')}</div>
                         <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">PDF, JPEG, or PNG</div>
                       </>
                    )}
                 </div>
              </label>
           </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
           <div className="p-8 bg-white border border-gray-300 rounded-[2.5rem] shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                 <h4 className="text-sm font-black uppercase tracking-tight text-gray-900">{t('profile.billing')}</h4>
                 <button 
                    onClick={copyPersonalInfoToBilling}
                    className="flex items-center space-x-2 text-[10px] font-black text-[var(--color-cmf-red)] uppercase tracking-widest hover:opacity-70"
                 >
                    <Copy size={12} />
                    <span>Same as Personal</span>
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-600 ml-1">Billing Name *</label>
                    <input name="billingName" value={formData.billingName} onChange={handleInputChange} className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder="Full Name" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase text-gray-600 ml-1">Billing Email *</label>
                       <input name="billingEmail" value={formData.billingEmail} onChange={handleInputChange} className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.email')} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase text-gray-600 ml-1">Billing Phone *</label>
                       <input name="billingPhone" value={formData.billingPhone} onChange={handleInputChange} className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold shadow-sm placeholder:text-gray-300" placeholder={t('placeholders.phone')} />
                    </div>
                 </div>
                 
                 <SearchableSelect 
                   label={t('labels.country')} 
                   value={formData.billingCountry} 
                   onChange={(val: string) => setFormData(p => ({ ...p, billingCountry: val }))} 
                   icon={MapPin}
                   placeholder={t('labels.country')}
                 />

                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-gray-600 ml-1">{t('labels.billingAddress')} *</label>
                    <textarea 
                      name="billingAddress" 
                      value={formData.billingAddress} 
                      onChange={handleInputChange} 
                      className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold h-32 resize-none shadow-sm placeholder:text-gray-300" 
                      placeholder={t('placeholders.billing')}
                    />
                 </div>
              </div>
           </div>

           {/* Pricing Summary Card */}
           {!pricing ? (
             <div className="p-8 bg-gray-100 rounded-[2.5rem] animate-pulse flex flex-col items-center justify-center space-y-2">
                <div className="text-gray-400 font-black text-[10px] uppercase tracking-widest">{commonT('loading')}</div>
             </div>
           ) : (
             <div className="p-8 bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/10">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                   <CreditCard size={120} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/50 mb-6">{t('membership.payment')}</h4>
                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between items-center text-blue-50/70 text-sm">
                      <span className="font-medium">{locale === 'cn' ? (planDetails.nameZh || planDetails.name) : planDetails.name}</span>
                      <span className="font-bold">{currencyCode} {pricing.subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center text-blue-50/70 text-sm">
                      <span className="font-medium">{t('tickets.adminTax')} ({pricing.taxPercentage}%)</span>
                      <span className="font-bold">+ {currencyCode} {pricing.tax.toFixed(2)}</span>
                   </div>
                   <div className="h-[1px] bg-white/10 my-6"></div>
                   <div className="flex justify-between items-end">
                      <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest pb-1">{t('tickets.totalPayable')}</span>
                      <span className="text-4xl font-black text-white">{currencyCode} {pricing.total.toFixed(2)}</span>
                   </div>
                </div>
             </div>
           )}

           <div className="flex items-center justify-center space-x-3 p-5 bg-green-50/30 rounded-3xl border border-green-100/50">
              <ShieldCheck size={20} className="text-green-600" />
              <div className="text-[10px] font-black text-green-700 uppercase tracking-widest text-center">
                Secure 256-bit SSL encrypted payment
              </div>
           </div>
        </div>
      )}

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 z-[90] lg:relative lg:bg-transparent lg:border-t-0 lg:p-0">
        <div className="max-w-xl mx-auto flex items-center space-x-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 lg:flex-none border border-gray-300 bg-white py-4 px-8 rounded-2xl text-gray-600 font-black flex items-center justify-center hover:bg-gray-50 transition-all uppercase tracking-widest text-[11px] shadow-sm"
            >
              <ChevronLeft size={18} className="mr-1" />
              {commonT('back')}
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={loading}
            className="flex-[2] bg-[var(--color-cmf-red)] text-white py-4 px-10 rounded-2xl font-black flex items-center justify-center shadow-2xl shadow-red-200 hover:bg-black transition-all uppercase tracking-widest text-[11px]"
          >
            {loading ? commonT('loading') : step === 3 ? t('tickets.proceedPayment') : commonT('next')}
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
