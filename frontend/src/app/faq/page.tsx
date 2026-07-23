import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HelpCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Amplivo',
  description: 'Got questions? We have answers. Learn more about how Amplivo works, our pricing, onboarding process, and reporting structure.',
};

const faqs = [
  {
    category: 'General',
    questions: [
      { q: 'What services do you offer?', a: 'We offer a full suite of digital marketing services including Performance Marketing (Google/Meta Ads), SEO, Social Media Management, Content Marketing, Branding, Influencer Marketing, and Website Development.' },
      { q: 'Do you work with startups or only established brands?', a: 'We work with both! We have tailored growth frameworks for early-stage startups looking to scale rapidly, as well as enterprise solutions for established brands looking to optimize their market share.' },
      { q: 'Where are you located?', a: 'Our headquarters is in Hyderabad, India, but we work with clients globally across the US, UK, UAE, and Australia.' },
    ]
  },
  {
    category: 'Process & Onboarding',
    questions: [
      { q: 'How long does onboarding take?', a: 'Our standard onboarding process takes 1-2 weeks. This includes audit access, strategy workshops, creative brief alignment, and setting up your dedicated client portal.' },
      { q: 'Will I have a dedicated account manager?', a: 'Yes. Every client is assigned a dedicated Account Manager who acts as your primary point of contact and coordinates with our specialized internal teams (SEO, Paid Ads, Creative, etc.).' },
      { q: 'How do you handle creative approvals?', a: 'All creatives are uploaded to your Client Portal. You will receive an email notification to review, leave comments, and approve or request revisions directly within the dashboard.' },
    ]
  },
  {
    category: 'Reporting & Analytics',
    questions: [
      { q: 'How often do I get reports?', a: 'You have 24/7 access to live data via your Client Portal. Additionally, we provide comprehensive monthly performance reports and strategy review calls.' },
      { q: 'How do you measure ROI?', a: 'We implement advanced tracking (Google Tag Manager, Meta Pixel, Conversion API) to track full-funnel metrics. We attribute revenue and leads directly to specific campaigns so you know exactly what your marketing dollars are doing.' },
    ]
  }
];

export default function FAQPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #06B6D4 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimateOnScroll animation="scale-in">
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={30} className="text-white" />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Frequently Asked Questions
            </h1>
            <p className="text-white/75 text-lg max-w-xl mx-auto">
              Everything you need to know about working with Amplivo.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-3xl mx-auto px-6">
          
          <div className="space-y-12">
            {faqs.map((section, idx) => (
              <AnimateOnScroll key={idx} animation="fade-up" delay={idx * 100}>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {section.category}
                </h2>
                <div className="space-y-4">
                  {section.questions.map((faq, fIdx) => (
                    <AnimateOnScroll key={fIdx} animation="fade-up" delay={fIdx * 60}>
                    <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden [&_summary::-webkit-details-marker]:hidden card-hover">
                      <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-slate-900">
                        {faq.q}
                        <span className="transition group-open:rotate-180">
                          <ChevronDown size={20} className="text-slate-400" />
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-2">
                        {faq.a}
                      </div>
                    </details>
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll animation="scale-in">
          <div className="mt-16 bg-white rounded-2xl p-8 border border-slate-200 text-center card-hover">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Still have questions?</h3>
            <p className="text-slate-600 mb-6">Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team.</p>
            <Link href="/contact" className="inline-flex items-center justify-center bg-[#4C1D95] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3b1574] transition-colors">
              Get in touch
            </Link>
          </div>
          </AnimateOnScroll>

        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
