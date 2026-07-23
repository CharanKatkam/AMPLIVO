import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketing Insights & Blog | Amplivo',
  description: 'Expert digital marketing insights, SEO guides, performance marketing tips, and growth strategies from the Amplivo team.',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
