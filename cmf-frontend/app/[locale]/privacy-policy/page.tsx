import React from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  const t = useTranslations('Common');

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white rounded-[2.5rem] p-10 lg:p-16 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl font-black text-gray-900 mb-12 tracking-tight uppercase border-b border-gray-100 pb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-red max-w-none space-y-10 text-gray-600 font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Introduction</h2>
              <p>
                “CMF Global Resources”, respects and upholds your rights to privacy protection in respect of the collection, use, disclosure and handling of personal information. This Privacy Policy details the practices we have adopted to protect your privacy, so that you can feel confident about how we manage the personal information you entrust to us. By using our CMF Global Resources website(s) or otherwise providing CMF Global Resources with personal information, you are consenting to CMF Global Resources collecting, using, disclosing and/or transferring (including cross-border transfer) your personal information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">How we collect personal information?</h2>
              <p>
                Personal information is any information that can be used to identify you. CMF Global Resources may collect information about you (such as name, e-mail, phone number, date of birth, postal address, company name or designation, in the following ways:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>through our websites;</li>
                <li>when you contact us to enquire or feedback about our products/services;</li>
                <li>when you submit ratings or reviews about our products/services;</li>
                <li>and/or when you participate in any of our physical events;</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Cookies</h2>
              <p>
                Like many companies, we sometimes use “cookie” technology on our websites. Cookies are information stored on your computer by your browser to save your preferences while you are visiting a particular website. When you log in, the cookie tells us whether you visited us before or are a new visitor, and it enables us to learn which advertisements bring users to our website. We use the cookie to help us identify site features in which you have the greatest interest so that we can provide more of what you may want. If you choose, you can set your browser to reject cookies or you can manually delete individual or all of the cookies on your computer by following your browser’s help file directions. However, if you do not enable cookies to be received by your web browser, you may have trouble accessing some of the pages and certain features on this website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Web Beacon</h2>
              <p>
                A web beacon is an electronic file on a Web page that allows us to count and recognize users who have visited that page. Among other things, a web beacon can be used in HTML-formatted email to determine responses to our communications and measure their effectiveness – for instance, if you get an email from us and click on a link in that email to go to our website. You can generally avoid web beacons in email by turning off HTML display and displaying only the text portion of your email.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">How we use personal information?</h2>
              <p>
                CMF Global Resources’s primary goal in collecting personal information is to ensure that our consumers are satisfied with our products and to provide our consumers with the best possible quality of customer service. Your personal information is never shared, sold, rented or otherwise disclosed outside the company (except as required for any statutory or legal requirements) in ways different from what is described in this Privacy Policy. We will take all reasonable steps to maintain the security and integrity of your personal information including the use of computer access passwords, lock-up cabinets, personnel policies and firewalls. CMF Global Resources may use the personal information you provide: to communicate with you about our products and services; to allow you to participate in events; to address, investigate and monitor enquiries or feedbacks about our products and services; for internal product & service development and quality control purposes; to measure performance of marketing initiatives, advertising, and websites; and/or to personalize, assess and improve our websites.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">How we share personal information?</h2>
              <p>We may share information about you with third parties in certain circumstances including in the following situations:</p>
              <ul className="list-disc pl-5 space-y-4">
                <li>
                  <strong>CMF Global Resources Group:</strong> We may share information with CMF Global Resources group of companies, including our parent company, subsidiaries and affiliates.
                </li>
                <li>
                  <strong>Partner Companies:</strong> We may share your information with carefully selected partner companies when we believe their products or services may interest you. You may “opt out” of partner offers and programs at any time by updating your User Profile (if available) or contacting us.
                </li>
                <li>
                  <strong>Service Providers:</strong> We may share information with companies or individuals that provide us with services such as database maintenance, research, analysis, and communications.
                </li>
                <li>
                  <strong>Legal Process:</strong> We may share your information with government entities, or third parties in response to subpoenas, court orders, or other legal processes.
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Links</h2>
              <p>
                Websites operated by CMF Global Resources may contain links to other sites operated by third parties. CMF Global Resources makes no representations or warranties as to the privacy practices of any third-party site and is not responsible for the privacy policies of other sites.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Contact Us</h2>
              <p>
                If you wish to access your personal information or if you have any questions about our Privacy Policy, please contact:
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 font-bold text-gray-900">
                <p>Consumer Voice: +6012 977 7148 (Weekdays, 9am – 5pm)</p>
                <p>Email: enquiry@cmfglobalcentre.com</p>
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
