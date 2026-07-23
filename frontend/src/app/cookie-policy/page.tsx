import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { BackButton } from '@/components/ui/BackButton';

export const metadata: Metadata = {
  title: 'Cookie Policy | Amplivo',
  description: 'Cookie Policy for Amplivo Digital Growth Private Limited.',
};

export default function CookiePolicyPage() {
  return (
    <main className="bg-[#F9FAFB] min-h-screen text-slate-700">
      <Navbar />
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <BackButton label="Back to Home" className="text-slate-500 hover:text-[#4C1D95]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8" style={{ fontFamily: "'Sora', sans-serif" }}>
          Cookie Policy
        </h1>
        <div className="max-w-4xl mx-auto px-6 space-y-6 text-sm leading-relaxed text-slate-600 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-400">Last updated: July 2026</p>
          <p>
            This is the Cookie Policy for Amplivo, accessible from www.amplivo.in.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. What Are Cookies</h2>
          <p>
            As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. How We Use Cookies</h2>
          <p>
            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Disabling Cookies</h2>
          <p>
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.
          </p>
          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Third-Party Cookies</h2>
          <p>
            In some special cases we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience.</li>
            <li>We also use social media buttons and/or plugins on this site that allow you to connect with your social network in various ways.</li>
          </ul>
        </div>
      </div>
      <Footer />
    </main>
  );
}
