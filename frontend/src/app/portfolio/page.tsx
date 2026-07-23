'use client';
import { useState } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { portfolioItems, portfolioCategories } from '@/data/portfolio';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<typeof portfolioItems[0] | null>(null);

  const filteredItems = activeCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory);
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #7C3AED 80%, #EC4899 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimateOnScroll animation="fade-in">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              Our Portfolio
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Work We Are Proud Of
            </h1>
            <p className="text-white/75 text-lg max-w-xl mx-auto">
              Browse our campaigns across social media, SEO, paid advertising, branding, web development, and influencer marketing.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Category Filter */}
          <AnimateOnScroll animation="fade-up">
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {portfolioCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 ${
                  cat === activeCategory ? 'bg-[#4C1D95] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#4C1D95] hover:text-[#4C1D95]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          </AnimateOnScroll>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
            {filteredItems.map((item, i) => (
              <AnimateOnScroll key={item.id} animation="scale-in" delay={i * 60}>
              <div
                className={`relative group overflow-hidden rounded-2xl cursor-pointer card-hover ${i === 0 ? 'col-span-2 row-span-1' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="w-full overflow-hidden h-56">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-[#06B6D4] text-xs font-semibold uppercase tracking-wider mb-1">{item.category}</div>
                    <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{item.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="bg-white/15 text-white text-[10px] px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.client}
                </div>
              </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row shadow-2xl anim-scale-in">
            {/* Close button */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-[#000000]/20 hover:bg-[#000000]/40 text-white md:text-slate-800 md:bg-slate-100 md:hover:bg-slate-200 p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="text-[#06B6D4] text-xs font-bold uppercase tracking-wider mb-2">
                {selectedItem.category}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">
                {selectedItem.title}
              </h3>
              <div className="text-slate-500 font-medium text-sm mb-6">
                Client: <span className="text-slate-800">{selectedItem.client}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                We partnered with <strong>{selectedItem.client}</strong> to design and execute a{' '}
                {selectedItem.category.toLowerCase()} strategy that delivered measurable growth —
                from increased brand visibility to real conversion improvements across channels.
              </p>

              <Link href="/contact" className="inline-flex w-fit items-center justify-center gap-2 bg-[#4C1D95] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#3b1574] transition-colors self-start">
                Discuss a Similar Project <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <CTASection />
      <Footer />
    </main>
  );
}
