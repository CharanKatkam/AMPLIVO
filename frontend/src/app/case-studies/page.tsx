import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { caseStudies } from '@/data/caseStudies';
import { CaseStudiesList } from '@/components/marketing/CaseStudiesList';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Case Studies | Amplivo | Digital Marketing Results',
  description: 'Explore Amplivo\'s client success stories — real campaigns, real results across real estate, e-commerce, education, healthcare, B2B, and more.',
};

export default function CaseStudiesPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #7C3AED 80%, #06B6D4 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimateOnScroll animation="fade-in">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              Case Studies
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Results That Speak for Themselves
            </h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              Real campaigns. Real brands. Real results. Explore how we help businesses achieve measurable growth across India and beyond.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Case Study Grid */}
      <CaseStudiesList initialCaseStudies={caseStudies} />

      <CTASection />
      <Footer />
    </main>
  );
}
