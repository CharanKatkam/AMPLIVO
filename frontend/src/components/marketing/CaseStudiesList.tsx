'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import { CaseStudy } from '@/types';

interface CaseStudiesListProps {
  initialCaseStudies: CaseStudy[];
}

const categories = ['All', 'Paid Ads', 'Social Media', 'SEO', 'Branding', 'B2B Marketing', 'Local SEO'];

export function CaseStudiesList({ initialCaseStudies }: CaseStudiesListProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredCaseStudies = activeCategory === 'All'
    ? initialCaseStudies
    : initialCaseStudies.filter(
        (cs) => cs.category === activeCategory || cs.tag === activeCategory
      );

  return (
    <section className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                cat === activeCategory
                  ? 'bg-[#4C1D95] text-white border border-[#4C1D95]'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#4C1D95] hover:text-[#4C1D95]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Case Studies Grid */}
        {filteredCaseStudies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No case studies found for this category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaseStudies.map((cs) => (
              <Link
                key={cs.id}
                href={`/case-studies/${cs.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow group flex flex-col"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={cs.image}
                    alt={cs.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-[#4C1D95] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {cs.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/80 text-xs">
                    <MapPin size={12} /> {cs.location}
                    <span className="mx-1">·</span>
                    <Clock size={12} /> {cs.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-[#7C3AED] text-xs font-bold uppercase tracking-wider mb-2">
                    {cs.clientName}
                  </div>
                  <h2 className="text-slate-900 font-semibold text-base leading-snug mb-4 flex-1">
                    {cs.title}
                  </h2>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5 bg-[#F9FAFB] rounded-xl p-3">
                    {cs.metrics.slice(0, 3).map((m) => (
                      <div key={m.label} className="text-center">
                        <div
                          className="text-slate-900 font-bold text-sm"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {m.value}
                        </div>
                        <div className="text-slate-400 text-[10px] leading-tight mt-0.5">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Platforms */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {cs.platforms.map((p) => (
                      <span key={p} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[#4C1D95] text-sm font-semibold">
                    Read full case study{' '}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
