import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { caseStudies } from '@/data/caseStudies';
import { CaseStudiesList } from '@/components/marketing/CaseStudiesList';
import { PageHero } from '@/components/marketing/PageHero';
import { caseStudiesHero } from '@/data/heroConfigs';

export const metadata: Metadata = {
  title: 'Case Studies | Amplivo | Digital Marketing Results',
  description: 'Explore Amplivo\'s client success stories — real campaigns, real results across real estate, e-commerce, education, healthcare, B2B, and more.',
};

export default function CaseStudiesPage() {
  return (
    <main id="main-content">
      <Navbar />

      <PageHero config={caseStudiesHero} />

      {/* Case Study Grid */}
      <CaseStudiesList initialCaseStudies={caseStudies} />

      <CTASection />
      <Footer />
    </main>
  );
}
