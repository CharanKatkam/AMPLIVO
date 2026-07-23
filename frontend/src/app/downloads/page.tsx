import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DownloadCloud, FileText, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Downloads & Resources | Amplivo',
  description: 'Free digital marketing resources, templates, guides, and whitepapers to help you grow your business.',
};

const resources = [
  {
    title: 'B2B Lead Generation Playbook 2024',
    desc: 'A comprehensive 40-page guide on setting up high-converting LinkedIn and Email outreach systems.',
    type: 'E-Book',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1542435503-ec7b0aa60d72?w=400&h=300&fit=crop',
  },
  {
    title: 'Social Media Content Calendar Template',
    desc: 'The exact Notion and Excel templates we use to plan 30 days of content in 3 hours.',
    type: 'Template',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
  },
  {
    title: 'Local SEO Audit Checklist',
    desc: 'A 50-point checklist to ensure your business ranks in the Google Map Pack for your city.',
    type: 'Checklist',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop',
  },
  {
    title: 'Brand Identity Blueprint',
    desc: 'A workbook to help you define your brand voice, mission, vision, and core visual identity.',
    type: 'Workbook',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
  },
];

export default function DownloadsPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #06B6D4 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <DownloadCloud size={30} className="text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
            Free Growth Resources
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Actionable templates, guides, and blueprints used by top performing brands.
          </p>
        </div>
      </section>

      {/* Downloads Grid */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Resources"
            title="Templates & Guides"
            subtitle="Download our free resources to level up your internal marketing efforts."
          />

          <div className="grid md:grid-cols-2 gap-8">
            {resources.map((resource, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all group flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-40 h-48 sm:h-auto rounded-xl overflow-hidden shrink-0">
                  <img src={resource.image} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-[#4C1D95] bg-[#4C1D95]/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <resource.icon size={12} /> {resource.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {resource.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                    {resource.desc}
                  </p>
                  
                  <Link href={`/contact?subject=Download Request: ${resource.title}`} className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#4C1D95] transition-colors w-full sm:w-auto text-sm">
                    <DownloadCloud size={16} /> Get Access
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
