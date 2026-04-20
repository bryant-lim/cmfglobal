'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, UserCircle } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('Forms');
  const commonT = useTranslations('Homepage'); // Using Homepage for welcome text if applicable or just generic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
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
      } catch (e: any) { console.error('Logo fetch failed:', e.message); }
    };
    fetchLogo();
  }, [strapiUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const cleanEmail = email.toLowerCase().trim();
      const url = `${strapiUrl}/api/auth/local`;
      
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanEmail, password }),
      });

      let data = await res.json();

      if (!data.jwt) {
        const diagUrl = `${strapiUrl}/api/profiles/testLogin?email=${encodeURIComponent(cleanEmail)}&password=${encodeURIComponent(password)}`;
        const diagRes = await fetch(diagUrl);
        const diagData = await diagRes.json();
        
        if (diagData.jwt) {
          data = { jwt: diagData.jwt };
        }
      }

      if (data.jwt) {
        localStorage.setItem('cmf_token', data.jwt);
        document.cookie = `cmf_token=${data.jwt}; path=/; max-age=86400; SameSite=Strict`;
        router.push(`/${locale}/dashboard`);
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      setError(t('auth.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#E63946] blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#E63946] blur-[100px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10 overflow-hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-white shadow-2xl mb-6 border border-gray-50 p-2 animate-in zoom-in-50 duration-500">
             {logoUrl ? (
               <img src={logoUrl} alt="CMF Global" className="w-full h-full object-contain" />
             ) : (
               <UserCircle className="w-10 h-10 text-[#E63946]" />
             )}
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('auth.welcomeBack')}<span className="text-[#E63946]">.</span></h1>
          <p className="text-gray-400 font-medium mt-2">{t('auth.portalAccess')}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-gray-100 backdrop-blur-sm animate-in slide-in-from-bottom-6 duration-1000">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">{t('labels.email')}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#E63946] transition-colors">
                  <Mail className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('placeholders.email')}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#E63946] focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 text-gray-900 font-bold placeholder:text-gray-300 placeholder:font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">{t('labels.password')}</label>
                <Link href="#" className="text-xs font-black uppercase tracking-widest text-[#E63946] hover:underline transition-all">{t('labels.forgotPassword')}</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#E63946] transition-colors">
                  <Lock className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#E63946] focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 text-gray-900 font-bold placeholder:text-gray-300"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-[#E63946] text-xs font-bold p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-[#E63946] text-white font-black py-5 rounded-2xl shadow-xl shadow-gray-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('auth.loginAction')} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
             <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
               {t('auth.noAccount')} <Link href={`/${locale}/register`} className="text-[#E63946] hover:underline ml-1">{t('auth.applyNow')}</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
