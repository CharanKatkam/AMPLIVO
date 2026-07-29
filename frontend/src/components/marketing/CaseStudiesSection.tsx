'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { caseStudies } from '@/data/caseStudies';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export function CaseStudiesSection() {
  const featured = caseStudies.slice(0, 3);

  return (
    <section className="bg-[#F1F5F9] py-14">
      <div className="max-w-7xl mx-auto px-6">
        <AnimateOnScroll animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
                Case Studies
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                Results That Speak for Themselves
              </h2>
            </div>
            <Link
              href="/case-studies"
              className="hidden md:flex items-center gap-2 text-[#4C1D95] font-semibold text-sm hover:underline whitespace-nowrap"
            >
              View all case studies <ArrowRight size={14} />
            </Link>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((cs, i) => (
            <AnimateOnScroll key={cs.id} animation="fade-up" delay={i * 100}>
              <Link
                href={`/case-studies/${cs.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 group flex flex-col card-hover"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[#4C1D95]/10">
                  <img
                    src={cs.image}
                    alt={cs.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <span className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/25">
                    {cs.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-[#7C3AED] text-xs font-bold uppercase tracking-wider mb-2">{cs.clientName}</p>
                  <h3 className="text-slate-900 font-semibold text-sm leading-snug mb-4 flex-1">{cs.title}</h3>

                  {/* Metrics */}
                  <div className="flex gap-8 mb-5">
                    {cs.metrics.slice(0, 2).map((m) => (
                      <div key={m.label}>
                        <div className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {m.value}
                        </div>
                        <div className="text-xs text-slate-400">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[#4C1D95] text-sm font-semibold group-hover:gap-2 transition-all">
                    Read case study <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-[#4C1D95] font-semibold text-sm">
            View all case studies <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
