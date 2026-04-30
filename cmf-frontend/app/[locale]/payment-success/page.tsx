'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, UserPlus, Mail, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState<string | null>(null);
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [orderType, setOrderType] = useState<'membership' | 'ticket' | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    const r = searchParams.get('ref');
    const paymentStatus = searchParams.get('status');

    if (!r) {
      setStatus('failed');
      return;
    }
    setRef(r);

    // Immediately stop if HitPay explicitly returns a canceled status
    if (paymentStatus === 'canceled' || paymentStatus === 'failed') {
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/orders/confirm?ref=${r}`);
        const data = await res.json();

        if (data.status === 'paid') {
          setOrderType(data.type);
          const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1339';
          setInvoiceUrl(data.invoicePath ? `${strapiUrl}${data.invoicePath}` : null);
          setStatus('success');
        } else if (data.status === 'canceled' || data.status === 'failed') {
          setStatus('failed');
        } else {
          // Only retry if it's pending/processing
          setTimeout(verifyPayment, 3000);
        }
      } catch (err) {
        console.error('Verification failed:', err);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {status === 'verifying' && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
                <Loader2 className="w-16 h-16 text-[#E63946] animate-spin relative" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Verifying Payment</h1>
              <p className="text-gray-500 font-medium">
                {ref?.startsWith('TKT') ? 'Securing your event tickets...' : 'Securing your membership credentials...'}
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                {orderType === 'ticket' ? 'Tickets Secured!' : 'Welcome to CMF Global!'}
              </h1>
              <p className="text-gray-600 font-medium leading-relaxed px-4">
                {orderType === 'ticket' 
                  ? "Your purchase was successful. We've confirmed your spots for the event. See you there!"
                  : "Your payment was successful. We've created your account and your membership is currently pending for approval."
                }
              </p>
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6 text-left shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="mt-1 w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#E63946]">
                   <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Check Your Inbox</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {orderType === 'ticket' 
                      ? "Your digital tickets and receipt have been sent to your registered email address."
                      : "We just sent your temporary password and login instructions to your email."
                    }
                  </p>
                  {invoiceUrl && (
                    <a 
                      href={invoiceUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center mt-2 text-[#E63946] font-bold text-[11px] hover:underline"
                    >
                      <FileText size={14} className="mr-1" />
                      Download Invoice/Receipt
                    </a>
                  )}
                </div>
              </div>
              
              {orderType !== 'ticket' && (
                <div className="flex items-start space-x-4">
                  <div className="mt-1 w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Application Pending</p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">Your membership is currently pending for approval. We will notify you once it is active.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Link
                href={orderType === 'ticket' ? "/dashboard" : "/"}
                className="inline-flex items-center justify-center w-full bg-black text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gray-900 transition-all hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 shadow-xl"
              >
                {orderType === 'ticket' ? 'Back to Dashboard' : 'Access My Dashboard'}
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">⚠️</span>
             </div>
             <div className="space-y-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Verification Incomplete</h1>
                <p className="text-gray-500 font-medium leading-relaxed">
                  We couldn't verify the payment status automatically. Please check your email or contact support with your reference: <br/>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block mt-2">{ref}</span>
                </p>
             </div>
             <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">Return Home</Link>
          </div>
        )}
      </div>
    </div>
  );
}
