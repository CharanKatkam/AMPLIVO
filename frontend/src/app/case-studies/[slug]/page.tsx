import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { caseStudies } from '@/data/caseStudies';
import { CaseStudyDetailClient } from '@/components/marketing/CaseStudyDetailClient';

// SSG bypassed

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return {};
  return {
    title: `${cs.title} | Case Study | Amplivo`,
    description: `How Amplivo helped ${cs.clientName} achieve measurable growth through ${cs.category}.`,
  };
}

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) notFound();

  return (
    <main>
      <Navbar />
      <CaseStudyDetailClient caseStudy={cs} />
      <CTASection />
      <Footer />
    </main>
  );
}
