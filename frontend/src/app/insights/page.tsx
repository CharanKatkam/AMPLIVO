'use client';

import { useState } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { blogPosts } from '@/data/blogPosts';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const categories = ['All', 'Performance Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Influencer Marketing', 'Marketing Automation'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #7C3AED 80%, #06B6D4 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            Insights Blog
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
            Marketing Insights & Growth Strategies
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Expert perspectives on digital marketing, SEO, performance advertising, and brand building for ambitious businesses.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-[#4C1D95] text-white border-[#4C1D95]' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#4C1D95] hover:text-[#4C1D95]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts list */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500">No articles found in this category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/insights/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow group flex flex-col"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex gap-2 mb-3">
                      <span className="bg-[#4C1D95]/8 text-[#4C1D95] text-xs px-2.5 py-1 rounded-full font-medium">{post.category}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                    </div>
                    <h3 className="text-slate-900 font-semibold text-sm leading-snug mb-3 flex-1">{post.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{post.author} · {post.date}</span>
                      <ArrowRight size={14} className="text-[#4C1D95] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
