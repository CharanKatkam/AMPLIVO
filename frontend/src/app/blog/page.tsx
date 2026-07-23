import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { blogPosts } from '@/data/blogPosts';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Marketing Insights & Blog | Amplivo',
  description: 'Expert digital marketing insights, SEO guides, performance marketing tips, and growth strategies from the Amplivo team.',
};

const categories = ['All', 'Performance Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Influencer Marketing', 'Marketing Automation'];

export default function BlogPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #7C3AED 80%, #06B6D4 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimateOnScroll animation="fade-in">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              Insights Blog
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Marketing Insights &amp; Growth Strategies
            </h1>
            <p className="text-white/75 text-lg max-w-xl mx-auto">
              Expert perspectives on digital marketing, SEO, performance advertising, and brand building for ambitious businesses.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Filter */}
          <AnimateOnScroll animation="fade-up">
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 ${
                  cat === 'All' ? 'bg-[#4C1D95] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#4C1D95] hover:text-[#4C1D95]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          </AnimateOnScroll>

          {/* Featured Post */}
          <AnimateOnScroll animation="fade-up" delay={80}>
          <div className="mb-8">
            <Link href={`/blog/${blogPosts[0].slug}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow flex flex-col md:flex-row">
              <div className="md:w-1/2 h-72 md:h-auto overflow-hidden">
                <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <div className="flex gap-2 mb-4">
                  <span className="bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-medium px-3 py-1 rounded-full">{blogPosts[0].category}</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1"><Clock size={11} /> {blogPosts[0].readTime}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-snug" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {blogPosts[0].title}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{blogPosts[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{blogPosts[0].author} · {blogPosts[0].date}</span>
                  <div className="flex items-center gap-1 text-[#4C1D95] font-semibold text-sm">
                    Read Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
          </AnimateOnScroll>

          {/* Rest of posts */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, i) => (
              <AnimateOnScroll key={post.id} animation="fade-up" delay={i * 80}>
              <Link
                href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 group flex flex-col card-hover"
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
                    <span className="text-xs text-slate-400">{post.author}</span>
                    <ArrowRight size={14} className="text-[#4C1D95] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
