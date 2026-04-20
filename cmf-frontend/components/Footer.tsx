'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function Footer() {
  const locale = useLocale();
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';
        const res = await fetch(`${strapiUrl}/api/global-setting?populate=logo`);
        const result = await res.json();
        if (result.data?.logo?.url) {
          setLogoUrl(`${strapiUrl}${result.data.logo.url}`);
        }
      } catch (err) {
        console.error('Failed to fetch global logo');
      }
    };
    fetchLogo();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex justify-center items-center">
        <p className="text-[10px] font-medium text-[#1E293B] uppercase tracking-[0.2em]">
          Copyright © CMF Global Centre 2026
        </p>
      </div>
    </footer>
  );
}
