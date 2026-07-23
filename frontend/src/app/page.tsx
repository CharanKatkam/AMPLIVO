import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { HeroSection } from '@/components/marketing/HeroSection';
import { StatsSection } from '@/components/marketing/StatsSection';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { ProcessSection } from '@/components/marketing/ProcessSection';
import { CaseStudiesSection } from '@/components/marketing/CaseStudiesSection';
import { PortfolioSection } from '@/components/marketing/PortfolioSection';
import { TeamSection } from '@/components/marketing/TeamSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { BlogSection } from '@/components/marketing/BlogSection';
import { CTASection } from '@/components/marketing/CTASection';
import { IndustriesSection } from '@/components/marketing/IndustriesSection';

export const metadata: Metadata = {
  title: 'Amplivo | Digital Marketing Agency — Amplify Visibility. Accelerate Growth.',
  description: 'Amplivo is a premium digital marketing agency delivering SEO, performance marketing, social media, branding, and lead generation for businesses across India and beyond.',
};

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <IndustriesSection />
      <ProcessSection />
      <CaseStudiesSection />
      <PortfolioSection />
      <TeamSection />
      <TestimonialsSection />
      <BlogSection />
      <CTASection />
      <Footer />
    </main>
  );
}
