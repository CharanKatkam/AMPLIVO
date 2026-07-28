import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { industries } from '@/data/industries';
import { Building2, GraduationCap, Heart, Cpu, ShoppingBag, Shirt, Hotel, UtensilsCrossed, Car, TrendingUp, Rocket, Factory, Music, UserCircle, Briefcase, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { PageHero } from '@/components/marketing/PageHero';
import { industriesHero } from '@/data/heroConfigs';

export const metadata: Metadata = {
  title: 'Industries We Serve | Amplivo',
  description: 'Specialized digital marketing solutions for Real Estate, Healthcare, Education, E-Commerce, and more.',
};

const iconMap: Record<string, React.ElementType> = {
  Building2, GraduationCap, Heart, Cpu, ShoppingBag, Shirt, Hotel, UtensilsCrossed, Car, TrendingUp, Rocket, Factory, Music, UserCircle, Briefcase, Package
};

export default function IndustriesPage() {
  return (
    <main>
      <Navbar />

      <PageHero config={industriesHero} />

      {/* Industries Grid */}
      <section className="pt-12 pb-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, i) => {
              const Icon = iconMap[industry.icon] || Building2;
              return (
                <AnimateOnScroll key={industry.id} animation="fade-up" delay={i * 60}>
                <Link
                  href={`/industries/${industry.slug}`}
                  className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all group flex flex-col h-full hover:-translate-y-1 card-hover cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${industry.color}15` }}>
                    <Icon size={28} style={{ color: industry.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>{industry.name}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 flex-1">{industry.description}</p>
                  <div className="mt-8">
                    <span
                      className="inline-flex items-center gap-2 font-semibold text-sm transition-all group-hover:gap-3" 
                      style={{ color: industry.color }}
                    >
                      Discuss Strategy <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
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
