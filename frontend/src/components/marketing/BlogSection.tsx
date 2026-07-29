'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export function BlogSection() {
  const featured = blogPosts.slice(0, 3);

  return (
    <section className="bg-[#F9FAFB] py-14">
      <div className="max-w-7xl mx-auto px-6">
        <AnimateOnScroll animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
                Insights
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                Marketing Insights & Strategies
              </h2>
            </div>
            <Link href="/insights" className="hidden md:flex items-center gap-2 text-[#4C1D95] font-semibold text-sm whitespace-nowrap hover:underline">
              Read all articles <ArrowRight size={14} />
            </Link>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((post, i) => (
            <AnimateOnScroll key={post.id} animation="fade-up" delay={i * 90}>
              <Link
                href={`/insights/${post.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 group flex flex-col card-hover"
              >
                <div className="h-44 overflow-hidden relative">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs bg-[#4C1D95]/8 text-[#4C1D95] px-2.5 py-1 rounded-full font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-semibold text-sm leading-snug mb-3 flex-1">{post.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{post.author} · {post.date}</span>
                    <ArrowRight size={14} className="text-[#4C1D95] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
