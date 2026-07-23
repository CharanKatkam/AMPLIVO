'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Quote,
  DollarSign,
  ArrowRight,
  Eye,
  X,
  ExternalLink,
  Target,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CaseStudy } from '@/types';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { BackButton } from '@/components/ui/BackButton';

const platformLinks: Record<string, string> = {
  'Google Ads': 'https://ads.google.com',
  'Meta Ads': 'https://www.facebook.com/business/ads',
  'LinkedIn Ads': 'https://www.linkedin.com/ad-advertising',
  'YouTube Ads': 'https://www.youtube.com/ads',
  'Landing Pages': 'https://pages.github.com',
  'CRM Integration': 'https://www.hubspot.com',
  'Instagram': 'https://www.instagram.com',
  'Facebook': 'https://www.facebook.com',
  'LinkedIn': 'https://www.linkedin.com',
  'LinkedIn Organic': 'https://www.linkedin.com',
  'YouTube Shorts': 'https://www.youtube.com',
  'WhatsApp Business': 'https://business.whatsapp.com',
  'Google Search': 'https://www.google.com',
  'Bing': 'https://www.bing.com',
  'Google My Business': 'https://www.google.com/business',
  'Google Maps': 'https://maps.google.com',
  'Google Business Profile': 'https://www.google.com/business',
  'Email Marketing': 'https://mailchimp.com',
  'Influencers': 'https://www.instagram.com',
};

interface CaseStudyDetailClientProps {
  caseStudy: CaseStudy;
}

export function CaseStudyDetailClient({ caseStudy: cs }: CaseStudyDetailClientProps) {
  const [activeMedia, setActiveMedia] = useState<{ url: string; title: string; desc?: string } | null>(null);

  return (
    <div className="bg-[#F9FAFB]">
      {/* Hero */}
      <section className="pt-32 pb-12 relative overflow-hidden bg-[#111827]">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <AnimateOnScroll animation="fade-in">
          <div className="mb-6">
            <BackButton label="Back to Case Studies" className="text-white/80 hover:text-white border border-white/20 bg-white/5 rounded-full px-4 py-2" />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-[#4C1D95] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {cs.category}
            </span>
            <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {cs.industry}
            </span>
            {cs.budgetRange && (
              <span className="bg-[#06B6D4]/20 text-[#22D3EE] text-xs font-semibold px-3 py-1 rounded-full border border-[#06B6D4]/30">
                Budget: {cs.budgetRange}
              </span>
            )}
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl" style={{ fontFamily: "'Sora', sans-serif" }}>
            {cs.title}
          </h1>

          <div className="flex flex-wrap gap-y-3 gap-x-6 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#EC4899]" /> {cs.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#06B6D4]" /> Duration: {cs.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#7C3AED] font-semibold">Client:</span> {cs.clientName}
            </span>
          </div>
          </AnimateOnScroll>
        </div>

        {/* Hero Banner Image */}
        <AnimateOnScroll animation="fade-up" delay={100}>
        <div className="relative max-w-5xl mx-auto px-6 mt-12">
          <div className="relative h-72 md:h-96 w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src={cs.image}
              alt={cs.title}
              className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500"
              onClick={() => setActiveMedia({ url: cs.image, title: cs.title, desc: `${cs.clientName} - Main Campaign Banner` })}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent" />
            <button
              onClick={() => setActiveMedia({ url: cs.image, title: cs.title, desc: `${cs.clientName} - Main Campaign Banner` })}
              className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-black/80 transition-colors cursor-pointer"
            >
              <Eye size={14} /> View Large Cover
            </button>
          </div>
        </div>
        </AnimateOnScroll>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left/Middle Columns: Case Details */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Campaign Objective */}
              {cs.objective && (
                <div className="bg-gradient-to-br from-[#4C1D95]/5 to-[#7C3AED]/5 border border-[#4C1D95]/10 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#4C1D95]/5 rounded-full translate-x-12 -translate-y-12 blur-xl" />
                  <h3 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                    <Target size={18} className="text-[#4C1D95]" /> Campaign Objective
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-sm">{cs.objective}</p>
                </div>
              )}

              {/* Challenge */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                  <span className="w-1.5 h-6 bg-red-500 rounded-full" /> The Challenge
                </h2>
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
                  <p className="text-slate-700 leading-relaxed text-sm">{cs.challenge}</p>
                </div>
              </div>

              {/* Solution */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full" /> Our Strategy & Solution
                </h2>
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6">
                  <p className="text-slate-700 leading-relaxed text-sm">{cs.solution}</p>
                </div>
              </div>

              {/* Platforms Used */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-slate-700" /> Platforms & Channels Integrated
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {cs.platforms.map((p) => {
                    const href = platformLinks[p] || 'https://www.google.com';
                    const isExternal = href.startsWith('http');
                    return (
                      <Link
                        key={p}
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-200 hover:text-[#4C1D95] hover:border-[#4C1D95]/30 transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Creatives Showcase */}
              {cs.creatives && cs.creatives.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                    <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full" /> Campaign Creatives & Ads
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cs.creatives.map((c, i) => (
                      <div
                        key={i}
                        className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                        onClick={() => setActiveMedia({ url: c.image, title: c.title, desc: `Creative Format: ${c.type}` })}
                      >
                        <div className="h-44 bg-slate-100 relative overflow-hidden">
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <Eye size={12} /> Inspect Creative
                            </span>
                          </div>
                          <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {c.type}
                          </span>
                        </div>
                        <div className="p-4 flex-1">
                          <h4 className="font-semibold text-slate-900 text-sm group-hover:text-[#4C1D95] transition-colors line-clamp-1">
                            {c.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">Status: Approved and Live</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Performance Screenshots Gallery */}
              {cs.screenshots && cs.screenshots.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                    <span className="w-1.5 h-6 bg-[#06B6D4] rounded-full" /> Performance & Analytics Reports
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {cs.screenshots.map((scr, idx) => (
                      <div
                        key={idx}
                        className="group relative h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all"
                        onClick={() => setActiveMedia({ url: scr, title: `Performance Report #${idx + 1}`, desc: `${cs.clientName} Analytics Insight` })}
                      >
                        <img
                          src={scr}
                          alt={`Report screenshot ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <Eye size={12} /> Zoom Report
                          </span>
                        </div>
                        <span className="absolute top-2 left-2 bg-[#111827]/75 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          Verified Audit
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonial */}
              {cs.testimonial && (
                <div className="bg-gradient-to-br from-[#4C1D95]/15 to-[#7C3AED]/10 border border-[#4C1D95]/20 rounded-3xl p-8 relative">
                  <span className="absolute -top-5 -left-5 bg-white text-violet-100 p-2 rounded-full border border-violet-100" />
                  <Quote size={40} className="text-[#4C1D95]/15 mb-4" />
                  <p className="text-slate-800 italic leading-relaxed text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    &ldquo;{cs.testimonial}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-sm">
                      {cs.clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-900 font-bold text-sm">{cs.clientName} Representative</div>
                      <div className="text-slate-400 text-xs font-medium">Amplivo Growth Client</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Results Sidebar */}
            <div className="space-y-6">
              <div className="bg-[#111827] rounded-3xl p-6 border border-slate-800 shadow-xl sticky top-24">
                <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                  <Sparkles size={16} className="text-[#06B6D4]" /> Campaign Results
                </h3>
                
                <div className="space-y-4">
                  {cs.metrics.map((m) => (
                    <div key={m.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                      <div
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {m.value}
                      </div>
                      <div className="text-[#9CA3AF] text-xs font-medium mt-1 uppercase tracking-wider">{m.label}</div>
                    </div>
                  ))}
                </div>

                {cs.budgetRange && (
                  <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Campaign Budget</span>
                    <span className="text-white font-bold font-mono">{cs.budgetRange}</span>
                  </div>
                )}

                <div className="mt-6 pt-5 border-t border-slate-800">
                  <Link
                    href="/contact"
                    className="w-full flex items-center justify-center gap-2 bg-[#4C1D95] hover:bg-[#3b1574] text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg hover:shadow-[#4C1D95]/20 cursor-pointer"
                  >
                    Start Similar Campaign <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {cs.relatedServices && cs.relatedServices.length > 0 && (
        <section className="py-16 bg-[#F9FAFB] border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-8" style={{ fontFamily: "'Sora', sans-serif" }}>
              Related Marketing Services
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {cs.relatedServices.map((srv, idx) => (
                <Link
                  key={idx}
                  href={`/services#${srv.slug}`}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#4C1D95] hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-[#4C1D95] transition-colors text-sm">
                      {srv.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Explore features and deliverables</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#4C1D95]/10 text-slate-400 group-hover:text-[#4C1D95] transition-all">
                    <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors border border-white/10 cursor-pointer z-10"
            >
              <X size={20} />
            </button>
            <div className="relative flex-1 min-h-[300px] max-h-[70vh] w-full bg-slate-950 flex items-center justify-center">
              <img
                src={activeMedia.url}
                alt={activeMedia.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-5 border-t border-white/10 bg-[#111827]">
              <h4 className="text-white font-bold text-base">{activeMedia.title}</h4>
              {activeMedia.desc && <p className="text-slate-400 text-xs mt-1">{activeMedia.desc}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
