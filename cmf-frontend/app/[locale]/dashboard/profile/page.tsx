'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, User, Mail, Phone, MapPin, Building, 
  Save, Lock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { getFullImageUrl } from '@/lib/api';
import ImageCropper from '@/components/ImageCropper';

export default function ProfilePage() {
  const t = useTranslations('Forms');
  const commonT = useTranslations('Common');
  const homepageT = useTranslations('Homepage');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Password Change State
  const [pwData, setPwData] = useState({ currentPassword: '', password: '', passwordConfirmation: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
      if (result.data) {
        setProfile(result.data);
      }
    } catch (err) {
      console.error('Profile fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const token = localStorage.getItem('cmf_token');
    try {
      const res = await fetch(`${strapiUrl}/api/profiles/update-me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          data: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            chineseName: profile.chineseName,
            phone: profile.phone,
            companyName: profile.companyName,
            designation: profile.designation,
            country: profile.country,
            gender: profile.gender,
            tShirtSize: profile.tShirtSize
          }
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('profile.updateSuccess') });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.updateError') });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (blob: Blob) => {
    setSaving(true);
    const token = localStorage.getItem('cmf_token');
    
    try {
      const formData = new FormData();
      formData.append('files', blob, `${profile.firstName}_portrait.jpg`);
      
      const uploadRes = await fetch(`${strapiUrl}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      const photoId = uploadData[0]?.id;

      if (photoId) {
        await fetch(`${strapiUrl}/api/profiles/update-me`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            data: { portraitPhoto: photoId }
          })
        });
        setMessage({ type: 'success', text: t('profile.photoSuccess') });
        fetchProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.photoError') });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.password !== pwData.passwordConfirmation) {
      setMessage({ type: 'error', text: t('auth.passwordMismatch') });
      return;
    }

    setPwLoading(true);
    const token = localStorage.getItem('cmf_token');
    
    try {
      const res = await fetch(`${strapiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(pwData)
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('auth.passwordSuccess') });
        setPwData({ currentPassword: '', password: '', passwordConfirmation: '' });
      } else {
        const error = await res.json();
        throw new Error(error.error?.message || 'Password change failed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase tracking-widest text-gray-400">{commonT('loading')}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('profile.editProfile')}<span className="text-[#E63946]">.</span></h1>
        </div>
        <Link href={`/${locale}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#E63946] transition-all shadow-sm">
          <Home size={14} /> {t('profile.goHome')}
        </Link>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-xs font-bold uppercase tracking-tight">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 text-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('labels.uploadPortrait')}</h3>
              <ImageCropper 
                onCropComplete={handlePhotoUpload} 
                initialImage={profile?.portraitPhoto ? getFullImageUrl(profile.portraitPhoto.url) : ''} 
              />
              <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">
                {t('profile.photoInfo')}
              </p>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-4">
                 <User size={18} className="text-[#E63946]" />
                 <h2 className="text-sm font-black uppercase tracking-tight text-gray-900">{t('profile.personalId')}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.firstName')}</label>
                    <input 
                      value={profile.firstName || ''} 
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.lastName')}</label>
                    <input 
                      value={profile.lastName || ''} 
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.chineseName')}</label>
                 <input 
                   value={profile.chineseName || ''} 
                   onChange={(e) => setProfile({...profile, chineseName: e.target.value})}
                   className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                   placeholder={t('placeholders.chineseName')}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.email')} <span className="text-[8px] opacity-40">({t('profile.verified')})</span></label>
                 <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input readOnly value={profile.email || ''} className="w-full pl-12 pr-4 py-3.5 bg-gray-100/50 border-none rounded-2xl text-gray-400 font-bold text-sm cursor-not-allowed" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.phone')}</label>
                    <div className="relative">
                       <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         value={profile.phone || ''} 
                         onChange={(e) => setProfile({...profile, phone: e.target.value})}
                         className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.country')}</label>
                    <div className="relative">
                       <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         value={profile.country || ''} 
                         onChange={(e) => setProfile({...profile, country: e.target.value})}
                         className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.company')}</label>
                    <div className="relative">
                       <Building size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                       <input 
                         value={profile.companyName || ''} 
                         onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                         className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.designation')}</label>
                    <input 
                      value={profile.designation || ''} 
                      onChange={(e) => setProfile({...profile, designation: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.gender')}</label>
                    <select 
                      value={profile.gender || ''} 
                      onChange={(e) => setProfile({...profile, gender: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                    >
                      <option value="">{t('labels.gender')}</option>
                      <option value="Male">{t('labels.male')}</option>
                      <option value="Female">{t('labels.female')}</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.tShirtSize')}</label>
                    <select 
                      value={profile.tShirtSize || ''} 
                      onChange={(e) => setProfile({...profile, tShirtSize: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
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

              <div className="pt-4">
                 <button 
                  disabled={saving}
                  className="w-full py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#E63946] transition-all shadow-xl shadow-gray-200"
                 >
                   {saving ? commonT('loading') : <><Save size={16} /> {t('profile.saveChanges')}</>}
                 </button>
              </div>
           </form>

           <form onSubmit={handleChangePassword} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-4">
                 <Lock size={18} className="text-[#E63946]" />
                 <h2 className="text-sm font-black uppercase tracking-tight text-gray-900">{t('profile.professional')}</h2>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.currentPassword')}</label>
                 <input 
                   type="password"
                   value={pwData.currentPassword}
                   onChange={(e) => setPwData({...pwData, currentPassword: e.target.value})}
                   required
                   className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.newPassword')}</label>
                    <input 
                      type="password"
                      value={pwData.password}
                      onChange={(e) => setPwData({...pwData, password: e.target.value})}
                      required
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t('labels.confirmPassword')}</label>
                    <input 
                      type="password"
                      value={pwData.passwordConfirmation}
                      onChange={(e) => setPwData({...pwData, passwordConfirmation: e.target.value})}
                      required
                      className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-100 outline-none transition-all font-bold text-sm"
                    />
                 </div>
              </div>

              <div className="pt-4">
                 <button 
                  disabled={pwLoading}
                  className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-900 hover:text-white transition-all"
                 >
                   {pwLoading ? commonT('loading') : t('profile.changePassword')}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
