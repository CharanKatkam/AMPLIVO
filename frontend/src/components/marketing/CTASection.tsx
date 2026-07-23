'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export function CTASection() {
  return (
    <section
      className="py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 60%, #06B6D4 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, #fff 0%, transparent 60%)' }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <AnimateOnScroll animation="fade-in">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Free 30-Minute Growth Audit — Book Now
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-up" delay={80}>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Ready to Accelerate Your Digital Growth?
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Book a free 30-minute strategy session with our experts and leave with a clear, customised digital marketing roadmap for your business.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll animation="scale-in" delay={160}>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              href="/contact"
              className="flex items-center gap-2 bg-white text-[#4C1D95] font-semibold px-8 py-4 rounded-xl hover:bg-white/92 transition-all shadow-xl shadow-black/20 text-base btn-primary hover:-translate-y-1"
            >
              Book Free Growth Audit <ArrowRight size={18} />
            </Link>
            <Link
              href="/case-studies"
              className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-base hover:-translate-y-1"
            >
              View Case Studies
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
