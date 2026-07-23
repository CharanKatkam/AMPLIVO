import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { blogPosts } from '@/data/blogPosts';
import { Clock, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import { BlogInsightCard } from '@/components/marketing/BlogInsightCard';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { BackButton } from '@/components/ui/BackButton';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Amplivo Insights`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  
  if (!post) notFound();

  // Find related posts (same category, not this post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);
    
  // If not enough related by category, just grab the latest ones
  if (relatedPosts.length < 3) {
    const additional = blogPosts.filter(p => p.id !== post.id && !relatedPosts.some(rp => rp.id === p.id));
    relatedPosts.push(...additional.slice(0, 3 - relatedPosts.length));
  }

  return (
    <main className="bg-white">
      <Navbar alwaysSolid={true} />

      <article className="pt-32 pb-12">
        <div className="max-w-3xl mx-auto px-6">
          <AnimateOnScroll animation="fade-in">
          <div className="mb-8">
            <BackButton label="Back to Blog" className="text-slate-500 hover:text-[#4C1D95]" />
          </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={60}>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{post.category}</span>
            <span className="text-slate-500 text-sm flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
            <span className="text-slate-500 text-sm hidden sm:inline">•</span>
            <span className="text-slate-500 text-sm">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-y border-slate-200 py-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{post.author}</p>
                <p className="text-xs text-slate-500">Amplivo Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 hidden sm:inline mr-2">Share:</span>
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#1877F2] hover:text-white transition-colors"><FaFacebook size={14} /></button>
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#1DA1F2] hover:text-white transition-colors"><FaTwitter size={14} /></button>
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#0A66C2] hover:text-white transition-colors"><FaLinkedin size={14} /></button>
            </div>
          </div>
          </AnimateOnScroll>
        </div>
        
        {/* Featured Image */}
        <AnimateOnScroll animation="scale-in" delay={80}>
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
        </AnimateOnScroll>

        {/* Content Body */}
        <div className="max-w-3xl mx-auto px-6 prose prose-slate prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-[#4C1D95]">
          {post.content ? (
            post.content.map((paragraph, idx) => (
              <p key={idx} className={idx === 0 ? "lead text-xl text-slate-600 mb-8" : "text-slate-600 mb-6"}>
                {paragraph}
              </p>
            ))
          ) : (
            <>
              <p className="lead text-xl text-slate-600 mb-8">{post.excerpt}</p>
              
              <h2>The Landscape is Changing</h2>
              <p>Digital marketing in 2024 requires a significantly different approach than just two years ago. With the rise of AI-generated content, privacy updates affecting attribution, and the dominance of short-form video, brands must adapt or risk losing market share.</p>
              
              <p>Here are the key shifts we&apos;re seeing across our client portfolio:</p>
              <ul>
                <li><strong>First-Party Data is King:</strong> With cookie deprecation, capturing your own customer data is no longer optional.</li>
                <li><strong>Creative is the New Targeting:</strong> As algorithmic targeting becomes broader, your ad creative does the heavy lifting of qualifying your audience.</li>
                <li><strong>Omnichannel Consistency:</strong> Consumers need 7-11 touchpoints before converting. A siloed approach to SEO, Paid Ads, and Social no longer works.</li>
              </ul>

              <div className="bg-[#F9FAFB] border-l-4 border-[#4C1D95] p-6 rounded-r-xl my-8">
                <p className="m-0 italic text-slate-700 font-medium">&ldquo;The brands that win today are those that combine relentless data analysis with scroll-stopping creative execution.&rdquo;</p>
              </div>

              <h2>How to Implement This Strategy</h2>
              <p>To execute successfully, you need to align your team around a central growth metric (usually ROAS or Cost Per Qualified Lead), rather than channel-specific vanity metrics.</p>
              <ol>
                <li>Audit your current tracking setup to ensure data integrity.</li>
                <li>Develop a unified content calendar that feeds both SEO and Social.</li>
                <li>Implement a rapid creative testing framework for Paid Ads.</li>
                <li>Build automated nurture sequences for leads that don&apos;t convert immediately.</li>
              </ol>

              <h2>Conclusion</h2>
              <p>The tools and tactics will continue to evolve, but the core principles of understanding your audience and delivering value remain unchanged. The framework outlined above provides a resilient foundation for sustainable growth.</p>
            </>
          )}
        </div>

        {/* Campaign Performance Insight Card */}
        {post.insight && (
          <div className="max-w-4xl mx-auto px-6">
            <BlogInsightCard insight={post.insight} />
          </div>
        )}
        
        {/* Tags */}
        <div className="max-w-3xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 mr-2">Tags:</span>
            {post.tags.map(tag => (
              <span key={tag} className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Related Articles</h2>
            <Link href="/insights" className="hidden sm:flex items-center gap-2 text-[#4C1D95] font-semibold text-sm hover:gap-3 transition-all">
              View All Posts <ArrowRight size={16} />
            </Link>
          </div>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost, i) => (
              <AnimateOnScroll key={relatedPost.id} animation="fade-up" delay={i * 80}>
              <Link
                href={`/insights/${relatedPost.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 group flex flex-col card-hover"
              >
                <div className="h-48 overflow-hidden">
                  <img src={relatedPost.image} alt={relatedPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-[#4C1D95]/8 text-[#4C1D95] text-xs px-2.5 py-1 rounded-full font-medium">{relatedPost.category}</span>
                  </div>
                  <h3 className="text-slate-900 font-semibold text-sm leading-snug mb-3 flex-1">{relatedPost.title}</h3>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{relatedPost.date}</span>
                    <ArrowRight size={14} className="text-[#4C1D95] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              </AnimateOnScroll>
            ))}
          </div>
          
          <div className="mt-8 sm:hidden">
            <Link href="/insights" className="flex items-center justify-center gap-2 text-[#4C1D95] font-semibold text-sm w-full py-3 bg-white border border-slate-200 rounded-xl">
              View All Posts <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
