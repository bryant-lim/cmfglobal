'use client';

import { Star, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface MembershipCardProps {
  name: string;
  id: string;
  tier: string;
  validUntil: string;
  photoUrl?: string;
}

export default function MembershipCard({ name, id, tier, validUntil, photoUrl }: MembershipCardProps) {
  return (
    <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-[2rem] overflow-hidden shadow-2xl group transition-transform hover:scale-[1.02] duration-500">
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E60012] via-[#E60012] to-[#80000A]"></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      
      {/* Decorative Blur */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/20 blur-[60px] rounded-full"></div>
      
      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
        {/* Header */}
        <div className="flex justify-between items-start">
           <div>
             <div className="text-2xl font-black tracking-tighter mb-1">CMF <span className="font-light text-white/70">GLOBAL</span></div>
             <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/50">Insurance Elite Association</div>
           </div>
           <Star size={32} className="text-white/20" />
        </div>

        {/* Middle Section: Portrait & Name */}
        <div className="flex items-center space-x-5">
           <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-gray-900/40">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20">
                   <ShieldCheck size={40} />
                </div>
              )}
           </div>
           <div>
             <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">MEMBER NAME</div>
             <div className="text-xl font-black tracking-tight">{name}</div>
           </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end border-t border-white/10 pt-4">
           <div className="space-y-1">
             <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">MEMBERSHIP ID</div>
             <div className="text-sm font-black tracking-widest">{id}</div>
           </div>
           <div className="text-right space-y-1">
             <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">VALID UNTIL</div>
             <div className="text-sm font-black tracking-tight uppercase">{validUntil}</div>
           </div>
        </div>
      </div>

      {/* Holographic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
    </div>
  );
}
