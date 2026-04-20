'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AdminAuthBridge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const secret = searchParams.get('secret');
    if (!secret) {
      setError('Unauthorized access. Secret missing.');
      return;
    }

    const authenticate = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders/admin-bridge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret })
        });

        const data = await res.json();
        if (data.jwt) {
          localStorage.setItem('cmf_token', data.jwt);
          document.cookie = `cmf_token=${data.jwt}; path=/; max-age=86400; SameSite=Strict`;
          
          // Small delay for visual confirmation
          setTimeout(() => {
            router.push(`/${locale}/admin/reporting`);
          }, 1000);
        } else {
          setError(data.error?.message || 'Authentication failed');
        }
      } catch (err) {
        setError('Bridge connection error');
      }
    };

    authenticate();
  }, [searchParams, router, locale]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {!error ? (
          <>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
               <ShieldCheck size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Admin Auth Bridge</h1>
            <p className="text-gray-500 font-bold text-sm">Verifying your secure session... Please wait.</p>
            <div className="flex justify-center pt-4">
               <Loader2 className="animate-spin text-gray-300" size={24} />
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
               <ShieldAlert size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Auth Failed</h1>
            <p className="text-red-500 font-bold text-sm">{error}</p>
            <button 
              onClick={() => router.push(`/${locale}/login`)}
              className="mt-6 px-8 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
