'use client';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { industries } from '@/data/industries';
import {
  Building2, GraduationCap, Heart, Cpu, ShoppingBag, Shirt, Hotel, UtensilsCrossed,
  Car, TrendingUp, Rocket, Factory, Music, UserCircle, Briefcase, Package,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Building2, GraduationCap, Heart, Cpu, ShoppingBag, Shirt, Hotel, UtensilsCrossed,
  Car, TrendingUp, Rocket, Factory, Music, UserCircle, Briefcase, Package,
};

export function IndustriesSection() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader
            eyebrow="Industries"
            title="We Grow Businesses Across Every Sector"
            subtitle="With deep expertise across 40+ industries, we bring sector-specific strategies that truly resonate with your target market."
          />
        </AnimateOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {industries.map((industry, i) => {
            const Icon = iconMap[industry.icon] || Briefcase;
            return (
              <AnimateOnScroll key={industry.id} animation="scale-in" delay={i * 40}>
                <div className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-200 hover:border-[#4C1D95]/30 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer card-hover">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${industry.color}12` }}
                  >
                    <Icon size={20} style={{ color: industry.color }} />
                  </div>
                  <span className="text-slate-700 font-medium text-xs leading-tight">{industry.name}</span>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
