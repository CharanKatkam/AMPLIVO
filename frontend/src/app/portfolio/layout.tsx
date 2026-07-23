import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | Amplivo | Creative Work & Campaign Results',
  description: 'Explore Amplivo\'s creative portfolio — social media campaigns, SEO work, paid ads, branding projects, websites, and influencer campaigns.',
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
