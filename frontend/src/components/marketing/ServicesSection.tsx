'use client';
import Link from 'next/link';
import { ArrowRight, Share2, Target, Search, Palette, FileText, Users, Globe, Zap, Star, Video } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

const iconMap: Record<string, React.ElementType> = {
  Share2, Target, Search, Palette, FileText, Users, Globe, Zap, Star, Video,
};

const services = [
  { slug: 'social-media-marketing', title: 'Social Media Marketing', desc: 'Strategic content, community management, and social campaigns that build loyal audiences and drive engagement.', icon: 'Share2', color: '#7C3AED' },
  { slug: 'performance-marketing', title: 'Performance Marketing', desc: 'ROI-focused paid campaigns across Google, Meta, LinkedIn & YouTube that deliver measurable conversions.', icon: 'Target', color: '#4C1D95' },
  { slug: 'search-engine-optimisation', title: 'Search Engine Optimisation', desc: 'Technical, on-page, and off-page SEO strategies that dominate search rankings and drive organic growth.', icon: 'Search', color: '#06B6D4' },
  { slug: 'branding-and-creative-design', title: 'Branding & Creative Design', desc: 'Powerful brand identities — logos, guidelines, and creative systems that make your brand unmistakable.', icon: 'Palette', color: '#EC4899' },
  { slug: 'content-marketing', title: 'Content Marketing', desc: 'Compelling content strategies that educate, engage, and convert your ideal customers at every stage.', icon: 'FileText', color: '#10B981' },
  { slug: 'lead-generation', title: 'Lead Generation', desc: 'Multi-channel systems that deliver qualified prospects directly to your sales team with full attribution.', icon: 'Users', color: '#F59E0B' },
  { slug: 'website-development', title: 'Website Development', desc: 'High-performance Next.js websites engineered for conversions, speed, and exceptional user experience.', icon: 'Globe', color: '#0EA5E9' },
  { slug: 'marketing-automation', title: 'Marketing Automation', desc: 'Intelligent workflows that capture, nurture, score, and route leads to your sales team automatically.', icon: 'Zap', color: '#8B5CF6' },
  { slug: 'influencer-marketing', title: 'Influencer Marketing', desc: 'Strategic influencer campaigns that amplify brand reach with authentic creators and measurable results.', icon: 'Star', color: '#EC4899' },
  { slug: 'video-marketing', title: 'Video Marketing', desc: 'Cinematic brand films, reels, explainers, and YouTube content that captivates audiences and drives action.', icon: 'Video', color: '#EF4444' },
];

export function ServicesSection() {
  return (
    <section className="bg-[#F9FAFB] py-14">
      <div className="max-w-7xl mx-auto px-6">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader
            eyebrow="Our Services"
            title="Everything Your Brand Needs to Dominate"
            subtitle="From visibility to conversion, our integrated services create compounding growth for ambitious brands across India and beyond."
          />
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon] || Zap;
            return (
              <AnimateOnScroll key={s.slug} animation="fade-up" delay={i * 60}>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer card-hover h-full">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${s.color}12` }}
                  >
                    <Icon size={22} style={{ color: s.color }} />
                  </div>
                  <h3 className="text-slate-900 font-semibold text-sm mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">{s.desc}</p>
                  <Link
                    href={`/services/${s.slug}`}
                    className="flex items-center gap-1 text-[#4C1D95] text-xs font-semibold group-hover:gap-2 transition-all"
                  >
                    Learn more <ArrowRight size={12} />
                  </Link>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
