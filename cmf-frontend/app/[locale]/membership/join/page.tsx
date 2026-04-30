import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import MembershipEnrollmentForm from '@/components/MembershipEnrollmentForm';

export default function JoinPage() {
  const t = useTranslations('Forms.membership');
  
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">{t('enrollTitle')}</h1>
          <p className="text-gray-500 max-w-xl mx-auto font-medium">
            Join the elite community of insurance professionals. Complete the form below and verify your status.
          </p>
        </div>

        <MembershipEnrollmentForm />
      </div>
    </main>
  );
}
