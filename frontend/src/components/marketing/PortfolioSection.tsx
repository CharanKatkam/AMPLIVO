'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { portfolioItems } from '@/data/portfolio';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

type PortfolioItem = typeof portfolioItems[0];

export function PortfolioSection() {
  const featured = portfolioItems.slice(0, 6);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <AnimateOnScroll animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
                Our Work
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                Work We Are Proud Of
              </h2>
              <p className="text-slate-500 mt-2 max-w-md">From social campaigns to websites — our creative output across industries.</p>
            </div>
            <Link
              href="/portfolio"
              className="hidden md:inline-flex items-center gap-2 text-[#4C1D95] font-semibold text-sm hover:underline whitespace-nowrap"
            >
              View full portfolio <ArrowRight size={14} />
            </Link>
          </div>
        </AnimateOnScroll>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {featured.map((item, i) => (
            <AnimateOnScroll key={item.id} animation="scale-in" delay={i * 80}>
              <div
                onClick={() => setSelectedItem(item)}
                className="relative group overflow-hidden rounded-2xl cursor-pointer h-52 md:h-60"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Always-visible bottom strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-3 group-hover:opacity-0 transition-opacity duration-300">
                  <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                  <p className="text-white/60 text-[10px] mt-0.5">{item.client}</p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0524]/95 via-[#1a0540]/70 to-[#4C1D95]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {/* Client badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {item.client}
                  </div>

                  {/* Content slides up */}
                  <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="text-[#06B6D4] text-[10px] font-bold uppercase tracking-widest mb-1">{item.category}</div>
                    <h3 className="text-white font-bold text-sm leading-snug mb-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="inline-flex items-center gap-1.5 text-white text-xs font-semibold bg-[#4C1D95] px-3 py-1.5 rounded-lg hover:bg-[#5b21b6] transition-colors">
                      View Project <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-[#4C1D95] font-semibold text-sm">
            View full portfolio <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
            style={{ animation: 'modalIn 0.25s ease-out' }}>
            {/* Close */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            {/* Image */}
            <div className="w-full md:w-1/2 h-56 md:h-auto relative flex-shrink-0">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
              <div className="text-[#06B6D4] text-xs font-bold uppercase tracking-widest mb-2">
                {selectedItem.category}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                {selectedItem.title}
              </h3>
              <div className="text-slate-500 text-sm mb-5">
                Client: <span className="font-semibold text-slate-800">{selectedItem.client}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-8">
                This is a showcase of our work for <strong>{selectedItem.client}</strong>. Through strategic{' '}
                {selectedItem.category.toLowerCase()} and tailored campaigns, we were able to significantly boost
                their digital presence and drive measurable results.
              </p>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#4C1D95] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#3b1574] transition-colors w-fit"
              >
                Discuss a Similar Project <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>
    </section>
  );
}
