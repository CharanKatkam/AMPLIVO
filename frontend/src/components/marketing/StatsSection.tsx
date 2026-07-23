'use client';

import {
  Sparkles, Building2, GraduationCap, ShoppingBag, Heart, Leaf,
  Car, Globe, TreePine, Crown, Zap, TrendingUp
} from 'lucide-react';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

const stats = [
  { value: '85+', label: 'Marketing Professionals' },
  { value: '500+', label: 'Campaigns Delivered' },
  { value: '250+', label: 'Clients Supported' },
  { value: '40+', label: 'Industries Served' },
  { value: '15,000+', label: 'Creatives Produced' },
  { value: '3M+', label: 'Leads Generated' },
  { value: '₹50Cr+', label: 'Managed Ad Spend' },
  { value: '94%', label: 'Client Retention' },
];

const clientLogos = [
  { name: 'TechNova Solutions', icon: Sparkles, color: '#3B82F6' },
  { name: 'Prestige Estates', icon: Building2, color: '#10B981' },
  { name: 'EduPath Academy', icon: GraduationCap, color: '#8B5CF6' },
  { name: 'FashionFirst', icon: ShoppingBag, color: '#EC4899' },
  { name: 'HealthPlus Clinics', icon: Heart, color: '#EF4444' },
  { name: 'NutriBlend', icon: Leaf, color: '#059669' },
  { name: 'AutoDrive Motors', icon: Car, color: '#F59E0B' },
  { name: 'LogiTrade Systems', icon: Globe, color: '#06B6D4' },
  { name: 'GreenBuild Infra', icon: TreePine, color: '#15803D' },
  { name: 'StyleCo Fashion', icon: Crown, color: '#D97706' },
  { name: 'SpeedAuto', icon: Zap, color: '#EA580C' },
  { name: 'Horizon Finance', icon: TrendingUp, color: '#2563EB' },
];

export function StatsSection() {
  return (
    <>
      {/* Client Logo Slider */}
      <div className="bg-white border-y border-slate-100 py-10 overflow-hidden">
        <AnimateOnScroll animation="fade-up" className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Trusted by leading brands across India
          </p>
        </AnimateOnScroll>
        <div className="flex gap-8 items-center animate-marquee whitespace-nowrap">
          {[...clientLogos, ...clientLogos].map((client, i) => {
            const Icon = client.icon;
            return (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-slate-700 font-medium text-sm hover:border-[#4C1D95]/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default group"
              >
                <Icon size={16} className="transition-transform group-hover:scale-110 duration-300" style={{ color: client.color }} />
                <span className="font-semibold text-slate-600 group-hover:text-slate-800 transition-colors duration-300" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {client.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-[#0F0B2E] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 text-center">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={i} animation="scale-in" delay={i * 70}>
                <div className="flex flex-col items-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {stat.value}
                  </div>
                  <div className="text-[#6B7280] text-xs leading-tight">{stat.label}</div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
