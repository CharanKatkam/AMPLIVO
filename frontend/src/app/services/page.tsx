import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { services } from '@/data/services';
import { ArrowRight, Share2, Target, Search, Palette, FileText, Users, Globe, Zap, Star, Video } from 'lucide-react';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { PageHero } from '@/components/marketing/PageHero';
import { servicesHero } from '@/data/heroConfigs';

export const metadata: Metadata = {
  title: 'Digital Marketing Services | Amplivo | SEO, Ads, Social Media',
  description: 'Explore Amplivo\'s 10 core digital marketing services: SEO, performance marketing, social media, branding, content, lead generation, web development, automation, influencer, and video marketing.',
};

const iconMap: Record<string, React.ElementType> = {
  Share2, Target, Search, Palette, FileText, Users, Globe, Zap, Star, Video,
};

export default function ServicesPage() {
  return (
    <main id="main-content">
      <Navbar />

      <PageHero config={servicesHero} />

      {/* Services Grid */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Zap;
              return (
                <AnimateOnScroll key={service.id} animation="fade-up" delay={i * 80}>
                <div
                  className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group card-hover h-full flex flex-col"
                >
                  <div className="flex items-start gap-5 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${service.color}12` }}
                    >
                      <Icon size={26} style={{ color: service.color }} />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold mb-1">Service {String(i + 1).padStart(2, '0')}</div>
                      <h2 className="text-slate-900 font-bold text-lg">{service.title}</h2>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">{service.fullDesc}</p>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {service.features.slice(0, 6).map((f) => (
                      <div key={f} className="flex items-start gap-1.5 text-xs text-slate-500">
                        <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>

                  {service.platforms && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {service.platforms.map((p) => (
                        <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{p}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 text-[#4C1D95] text-sm font-semibold group-hover:gap-3 transition-all"
                    >
                      View service details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
