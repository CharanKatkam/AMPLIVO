import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Briefcase, MapPin, Clock, ArrowRight, Zap, Users, GraduationCap, Heart } from 'lucide-react';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Careers | Join Amplivo',
  description: 'Join our team of digital marketing experts, creatives, and technologists building the future of brand growth.',
};

import { OpenPositionsList } from '@/components/marketing/OpenPositionsList';

const benefits = [
  { icon: Zap, title: 'Fast-Paced Growth', desc: 'Work with top brands and scale your career rapidly in a high-growth environment.' },
  { icon: Users, title: 'Collaborative Culture', desc: 'No silos. We work together, win together, and celebrate each other.' },
  { icon: GraduationCap, title: 'Learning Budget', desc: 'Annual stipend for courses, certifications, and conferences.' },
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive health insurance for you and your dependents.' },
];

export default function CareersPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #EC4899 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimateOnScroll animation="fade-in">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              Careers at Amplivo
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Do the Best Work of Your Life
            </h1>
            <p className="text-white/75 text-lg max-w-xl mx-auto mb-8">
              We are always looking for curious, driven, and creative individuals to join our mission of amplifying brand growth.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="scale-in" delay={160}>
            <a
              href="#open-roles"
              className="inline-flex items-center gap-2 bg-white text-[#4C1D95] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/92 transition-all shadow-lg hover:-translate-y-1"
            >
              View Open Roles <ArrowRight size={16} />
            </a>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="Culture & Benefits"
            title="Why Join Amplivo?"
            subtitle="We believe that taking care of our team is the first step to taking care of our clients."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <AnimateOnScroll key={idx} animation="fade-up" delay={idx * 80}>
              <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-200 card-hover h-full">
                <div className="w-12 h-12 bg-[#4C1D95]/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <benefit.icon size={24} className="text-[#4C1D95]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-24 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader
            eyebrow="Join The Team"
            title="Open Positions"
          />

          <OpenPositionsList />
          
          <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Don&apos;t see a fit?</h3>
            <p className="text-slate-600 text-sm mb-4">We are always open to meeting talented people. Send your resume to careers@amplivo.in</p>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
