import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { industries } from '@/data/industries';
import { Building2, GraduationCap, Heart, Cpu, ShoppingBag, Shirt, Hotel, UtensilsCrossed, Car, TrendingUp, Rocket, Factory, Music, UserCircle, Briefcase, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

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

      {/* Hero */}
      <section
        className="pt-32 pb-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #06B6D4 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimateOnScroll animation="fade-in">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              Industries
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Industries We Serve
            </h1>
            <p className="text-white/75 text-lg max-w-xl mx-auto">
              We bring deep domain expertise to craft digital strategies that solve the unique challenges of your industry.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="pt-12 pb-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, i) => {
              const Icon = iconMap[industry.icon] || Building2;
              return (
                <AnimateOnScroll key={industry.id} animation="fade-up" delay={i * 60}>
                <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all group flex flex-col h-full hover:-translate-y-1 card-hover">
                  <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ backgroundColor: `${industry.color}15` }}>
                    <Icon size={28} style={{ color: industry.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>{industry.name}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 flex-1">{industry.description}</p>
                  <div className="mt-8">
                    <Link
                      href={`/industries/${industry.slug}`}
                      className="inline-flex items-center gap-2 font-semibold text-sm transition-all group-hover:gap-3" 
                      style={{ color: industry.color }}
                    >
                      Discuss Strategy <ArrowRight size={16} />
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
