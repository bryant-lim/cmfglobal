import React from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white rounded-[2.5rem] p-10 lg:p-16 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl font-black text-gray-900 mb-12 tracking-tight uppercase border-b border-gray-100 pb-8">
            Refund Policy
          </h1>

          <div className="prose prose-red max-w-none space-y-10 text-gray-600 font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Membership Fee</h2>
              <p>
                Membership fees (One-Time) will be charged to Credit card holder’s account upon membership purchase. Each membership is valid for 1 year only. Subsequent membership renewal will be subject to management’s approval. Discounts, rebates or other special offers only valid for initial term;
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Membership Termination</h2>
              <p>
                You can cancel your subscription from your account profile page. The only valid method for canceling your Plan is via the cancellation link provided on your user “dashboard” page, accessible after logging in to the CMF Global Services website. Requests to cancel by e-mail or phone are not considered, and do not accomplish, cancellation. Once you cancel your membership subscription, you will not lose access immediately. Your membership will continue through the end of your current charge cycle.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Refunds</h2>
              <p>
                Membership fees are non-refundable; except that you may cancel membership subscription by contacting CMF Global Services within 3 (3) calendar days after membership activation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Need Help?</h2>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 font-bold text-gray-900">
                <p>Contact us at <span className="text-[#E63946]">enquiry@cmfglobalcentre.com</span> for questions related to refunds and returns.</p>
              </div>
            </section>

            <section className="pt-10 border-t border-gray-100 italic text-sm text-gray-400 font-bold uppercase tracking-widest">
              Last updated: January 2026
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
