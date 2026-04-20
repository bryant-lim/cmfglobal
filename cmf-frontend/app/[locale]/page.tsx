import {getTranslations, getLocale} from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Shield, Award, Users, Globe, Play } from 'lucide-react';

async function getGlobalSetting(locale: string = 'en') {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';
  const strapiLocale = locale === 'cn' ? 'zh-Hans' : 'en';
  try {
    const res = await fetch(`${strapiUrl}/api/global-setting?locale=${strapiLocale}`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || {};
  } catch (e) {
    return {};
  }
}

export default async function HomePage() {
  const t = await getTranslations('Home');
  const locale = await getLocale();
  const globalSetting = await getGlobalSetting(locale);

  const videos = [
    globalSetting.youtubeVideo1,
    globalSetting.youtubeVideo2,
    globalSetting.youtubeVideo3
  ].filter(Boolean);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section - Refined UI */}
      <section className="relative pt-24 pb-40 overflow-hidden flex-1">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 inset-x-0 h-[800px] -z-10 opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E63946]/10 blur-[120px] rounded-full animate-pulse"></div>
           <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
             <div className="inline-flex items-center space-x-2 px-6 py-2 bg-red-50 rounded-full mb-10 border border-red-100 animate-in fade-in slide-in-from-top-4 duration-1000">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E63946]"></span>
               </span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E63946]">{t('badge')}</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-gray-900 tracking-tighter mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 leading-[0.9] uppercase">
              {t('heroTitle')}<span className="text-[#E63946]">.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-14 max-w-3xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1200">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-16 duration-1500">
              <Link href={`/${locale}/membership`} className="group w-full sm:w-auto bg-[#E63946] text-white text-base px-16 py-6 flex items-center justify-center rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-red-200 hover:bg-black transition-all duration-500">
                {t('ctaJoin')}
                <ArrowRight size={20} className="ml-3 transition-transform group-hover:translate-x-2" />
              </Link>
              <Link href={`/${locale}/tickets`} className="w-full sm:w-auto px-16 py-6 border-2 border-gray-100 text-gray-900 rounded-[2rem] font-black uppercase tracking-widest hover:border-black transition-all flex items-center justify-center bg-white/50 backdrop-blur-sm">
                {t('ctaEvents')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Updated */}
      <section className="py-40 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-24">
            {[
              { icon: <Globe size={32} />, title: t('statCountries'), desc: t('statCountriesDesc') },
              { icon: <Shield size={32} />, title: t('statTrust'), desc: t('statTrustDesc') },
              { icon: <Award size={14} />, title: "CMF Global", desc: t('badgeSub') }
            ].map((stat, i) => (
              <div key={i} className="group p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-red-100/30 transition-all duration-700 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-10 group-hover:bg-[#E63946] group-hover:text-white transition-all duration-500 text-[#E63946] transform group-hover:rotate-6">
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">{stat.title}</h3>
                <p className="text-gray-400 font-bold leading-relaxed text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Gallery Section */}
      {videos.length > 0 && (
        <section className="py-40 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
               <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">{t('experiences')}<span className="text-[#E63946]">.</span></h2>
               <p className="text-gray-400 font-bold text-lg">{t('videosDesc')}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {videos.map((url, i) => (
                <div key={i} className="group relative aspect-video rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-xl border border-gray-100">
                   <iframe
                     src={getYoutubeEmbedUrl(url)}
                     title={`CMF Video ${i+1}`}
                     className="w-full h-full border-0 absolute inset-0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   ></iframe>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
