'use client';

import Navbar from '@/components/Navbar';
import MembershipCard from '@/components/MembershipCard';
import { CreditCard, History, Ticket, User, Settings, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MemberDashboard() {
  // Mock member data - In real app, this would come from session/API
  const member = {
    name: "Bryant Lim",
    id: "CMF-00001",
    tier: "Titanium Membership",
    validUntil: "15 JAN 2027",
    portraitUrl: null
  };

  const history = [
    { year: '2025-2026', tier: 'Annual Membership', status: 'Expired', date: 'Jan 10, 2025' },
    { year: '2026-2027', tier: 'Titanium Membership', status: 'Active', date: 'Jan 11, 2026' }
  ];

  const tickets = [
    { name: 'CMF Annual Forum 2026', type: 'Super Early Bird', status: 'Valid', ref: 'TKT-992100' }
  ];

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* Sidebar Navigation */}
           <aside className="w-full lg:w-64 flex flex-col space-y-2">
              <div className="p-6 bg-white rounded-2xl border border-gray-100 mb-6 flex items-center space-x-3 shadow-sm">
                 <div className="w-12 h-12 bg-red-50 text-[var(--color-cmf-red)] rounded-full flex items-center justify-center font-black text-xl">BL</div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">Bryant Lim</p>
                    <p className="text-xs text-gray-400 font-medium truncate">{member.id}</p>
                 </div>
              </div>
              
              <Link href="/member" className="flex items-center space-x-3 px-4 py-3 bg-[var(--color-cmf-red)] text-white rounded-xl font-bold transition-all">
                <User size={20} />
                <span>My Membership</span>
              </Link>
              <Link href="/member/tickets" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-all">
                <Ticket size={20} />
                <span>Purchased Tickets</span>
              </Link>
              <Link href="/member/history" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-all">
                <History size={20} />
                <span>Renewal History</span>
              </Link>
              <Link href="/member/settings" className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-all">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-600 transition-all font-bold w-full">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
           </aside>

           {/* Main Content Area */}
           <div className="flex-1 space-y-8">
              
              {/* Membership Card Section */}
              <section className="bg-white rounded-[2rem] border border-gray-100 p-8 lg:p-12 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                   <MembershipCard 
                     name={member.name}
                     id={member.id}
                     tier={member.tier}
                     validUntil={member.validUntil}
                   />
                   <div className="flex-1 text-center lg:text-left space-y-6">
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Active Membership</h2>
                        <p className="text-gray-500 font-medium">Your current status is verified. Gain access to premium benefits and forum details.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link href="/membership/renew" className="btn-primary py-4 px-8">Renew Membership</Link>
                        <button className="px-8 py-4 border-2 border-gray-100 rounded-xl font-bold hover:bg-gray-50">Download Digital PDF</button>
                      </div>
                   </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 -mr-32 -mt-32 rounded-full blur-3xl opacity-50"></div>
              </section>

              {/* Stats / History Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                 {/* Membership History */}
                 <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-6 flex items-center">
                      <History className="mr-2 text-[var(--color-cmf-red)]" size={24} />
                      Membership History
                    </h3>
                    <div className="space-y-4">
                       {history.map(item => (
                         <div key={item.year} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                            <div>
                               <p className="font-bold text-gray-900 leading-none mb-1">{item.tier}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.date}</p>
                            </div>
                            <div className={`text-xs px-3 py-1 rounded-full font-black ${item.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                               {item.status.toUpperCase()}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Purchased Tickets */}
                 <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-6 flex items-center">
                      <Ticket className="mr-2 text-[var(--color-cmf-red)]" size={24} />
                      Latest Tickets
                    </h3>
                    <div className="space-y-4">
                       {tickets.map(ticket => (
                         <div key={ticket.ref} className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                               <p className="font-bold text-gray-900 group-hover:text-[var(--color-cmf-red)] transition-colors">{ticket.name}</p>
                               <ChevronRight size={16} className="text-gray-300" />
                            </div>
                            <div className="flex justify-between text-[10px] items-center">
                               <span className="font-bold text-gray-400 tracking-widest uppercase">REF: {ticket.ref}</span>
                               <span className="font-black text-green-600 uppercase">{ticket.status}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                    <Link href="/member/tickets" className="mt-8 text-sm font-bold text-[var(--color-cmf-red)] flex items-center hover:underline">
                       View All Tickets
                       <ChevronRight size={14} className="ml-1" />
                    </Link>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </main>
  );
}
