import type { Metadata } from 'next';
import { Inter, Sora, Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import { PageTransition } from '@/components/PageTransition';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Amplivo Digital Growth Private Limited | Digital Marketing Agency',
    template: '%s | Amplivo',
  },
  description:
    'Amplivo is a premium digital marketing agency delivering SEO, performance marketing, social media, branding, content, lead generation, and web development for ambitious brands across India.',
  keywords: ['digital marketing agency', 'SEO', 'performance marketing', 'social media', 'lead generation', 'Hyderabad', 'India'],
  authors: [{ name: 'Amplivo Digital Growth Private Limited' }],
  creator: 'Amplivo',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://amplivo.in',
    siteName: 'Amplivo',
    title: 'Amplivo Digital Growth Private Limited',
    description: 'Digital Strategies That Deliver. Premium digital marketing agency based in Hyderabad, India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amplivo Digital Growth Private Limited',
    description: 'Amplify Visibility. Accelerate Growth. Premium digital marketing agency.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${spaceGrotesk.variable} ${plusJakarta.variable}`}>
      <body className="font-inter antialiased bg-[#F9FAFB]">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
