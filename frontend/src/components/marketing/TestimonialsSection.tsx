'use client';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '@/data/testimonials';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export function TestimonialsSection() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader
            eyebrow="Client Testimonials"
            title="What Our Clients Say"
            subtitle="Hear directly from the brands and businesses that trust Amplivo to drive their digital growth."
          />
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <AnimateOnScroll key={t.id} animation="fade-up" delay={i * 90}>
              <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-200 hover:border-[#4C1D95]/25 hover:shadow-md transition-all group card-hover h-full">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-6">
                  <Quote size={20} className="text-[#4C1D95]/20 absolute -top-1 -left-1" />
                  <p className="text-slate-600 text-sm leading-relaxed pl-5">{t.content}</p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-slate-900 font-semibold text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
