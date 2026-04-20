'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, ArrowRight, CheckCircle2, AlertCircle, Phone, Mail, User, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const t = useTranslations('Home');
  const locale = useLocale();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';

  useEffect(() => {
    // Fetch Global Logo
    const fetchLogo = async () => {
      try {
        const res = await fetch(`${strapiUrl}/api/global-setting?populate=logo`);
        const result = await res.json();
        if (result.data?.logo?.url) setLogoUrl(`${strapiUrl}${result.data.logo.url}`);
      } catch (e) { console.error('Logo fetch failed'); }
    };
    fetchLogo();
  }, [strapiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${strapiUrl}/api/profiles/register-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || result.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Success!</h2>
              <p className="text-gray-500 font-medium">Your account has been created successfully. We've sent your login credentials to <span className="text-gray-900 font-bold">{formData.email}</span>.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl flex items-start gap-4 text-left border border-amber-100">
              <AlertCircle className="text-amber-500 shrink-0 mt-1" size={18} />
              <p className="text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-wide">
                Please check your SPAM folder if you don't see the email within 2 minutes.
              </p>
            </div>
            <Link 
              href={`/${locale}/login`}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#E63946] transition-all shadow-xl shadow-gray-200 uppercase tracking-widest text-[11px]"
            >
              Go To Login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6 py-20 lg:py-32">
        <div className="max-w-xl w-full flex flex-col items-center">
          
          {/* Logo / Branding */}
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
             {logoUrl ? (
               <img src={logoUrl} alt="CMF Global" className="h-16 w-auto object-contain animate-in fade-in slide-in-from-top-4" />
             ) : (
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg text-[var(--color-cmf-red)]">
                 <ShieldCheck size={32} />
               </div>
             )}
             <div className="space-y-1">
               <h1 className="text-4xl font-black text-gray-900 tracking-tight">Join CMF Community<span className="text-[#E63946]">.</span></h1>
             </div>
          </div>

          <div className="w-full bg-white rounded-[3rem] p-10 lg:p-14 shadow-2xl shadow-gray-200 border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E63946] transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-red-100 transition-all outline-none"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E63946] transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-red-100 transition-all outline-none"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E63946] transition-colors" size={18} />
                  <input 
                    required
                    type="email" 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-red-100 transition-all outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E63946] transition-colors" size={18} />
                  <input 
                    required
                    type="tel" 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-red-100 transition-all outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold border border-red-100">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 hover:bg-[#E63946] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register'}
                {!loading && <UserPlus size={18} />}
              </button>

              <div className="text-center pt-4">
                <p className="text-gray-400 text-xs font-bold">
                  Already have an account? <Link href={`/${locale}/login`} className="text-[#E63946] hover:underline">Log in here</Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
