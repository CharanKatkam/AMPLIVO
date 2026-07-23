import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { BackButton } from '@/components/ui/BackButton';
import { services } from '@/data/services';
import { ArrowRight, ChevronRight, CheckCircle2, Zap, Share2, Target, Search, Palette, FileText, Users, Globe, Star, Video } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Share2, Target, Search, Palette, FileText, Users, Globe, Zap, Star, Video,
};

function ServiceHeroBackground({ slug }: { slug: string }) {
  switch (slug) {
    case 'social-media-marketing':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20%" cy="30%" r="8" fill="#fff" className="animate-pulse" />
          <circle cx="80%" cy="40%" r="12" fill="#fff" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="50%" cy="70%" r="6" fill="#fff" className="animate-pulse" style={{ animationDelay: '2s' }} />
          <path d="M 120 180 L 517 450 L 827 257" stroke="#fff" strokeWidth="2" strokeDasharray="5 5" />
          <path d="M 30% 60% C 30% 55%, 35% 50%, 40% 55% C 45% 50%, 50% 55%, 50% 60% C 50% 70%, 40% 75%, 40% 75% C 40% 75%, 30% 70%, 30% 60% Z" fill="#EC4899" opacity="0.3" transform="translate(100, 100) scale(1.5)" />
          <path d="M 70% 20% C 70% 15%, 75% 10%, 80% 15% C 85% 10%, 90% 15%, 90% 20% C 90% 30%, 80% 35%, 80% 35% C 80% 35%, 70% 30%, 70% 20% Z" fill="#EC4899" opacity="0.3" transform="translate(700, 50) scale(1.2)" />
        </svg>
      );
    case 'performance-marketing':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 450 L 300 360 L 500 390 L 700 250 L 900 110" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 100 450 L 300 360 L 500 390 L 700 250 L 900 110 L 900 500 L 100 500 Z" fill="url(#perf-grad)" />
          <defs>
            <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="250" y="250" width="30" height="200" fill="#fff" rx="4" />
          <rect x="450" y="300" width="30" height="150" fill="#fff" rx="4" />
          <rect x="650" y="160" width="30" height="290" fill="#fff" rx="4" />
          <rect x="850" y="80" width="30" height="370" fill="#fff" rx="4" />
        </svg>
      );
    case 'search-engine-optimisation':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r="80" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="160" stroke="#fff" strokeWidth="1.5" strokeDasharray="8 8" />
          <circle cx="50%" cy="50%" r="240" stroke="#fff" strokeWidth="1.5" />
          <path d="M 150 100 H 400 V 300 H 150 Z" stroke="#fff" strokeWidth="2" />
          <line x1="200" y1="150" x2="350" y2="150" stroke="#fff" strokeWidth="3" />
          <line x1="200" y1="200" x2="300" y2="200" stroke="#fff" strokeWidth="3" />
        </svg>
      );
    case 'branding-and-creative-design':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,-100 C 300,100 100,500 800,400 C 1200,300 900,900 1200,1200" stroke="#fff" strokeWidth="40" strokeOpacity="0.4" strokeLinecap="round" />
          <circle cx="20%" cy="70%" r="60" fill="#EC4899" opacity="0.3" />
          <circle cx="80%" cy="20%" r="90" fill="#7C3AED" opacity="0.3" />
        </svg>
      );
    case 'content-marketing':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="150" y="100" width="120" height="150" rx="8" stroke="#fff" strokeWidth="2" />
          <line x1="180" y1="130" x2="240" y2="130" stroke="#fff" strokeWidth="2" />
          <line x1="180" y1="160" x2="260" y2="160" stroke="#fff" strokeWidth="2" />
          <line x1="180" y1="190" x2="230" y2="190" stroke="#fff" strokeWidth="2" />
          <rect x="700" y="200" width="140" height="180" rx="8" stroke="#fff" strokeWidth="2" />
          <line x1="730" y1="240" x2="810" y2="240" stroke="#fff" strokeWidth="2" />
          <line x1="730" y1="270" x2="830" y2="270" stroke="#fff" strokeWidth="2" />
          <line x1="730" y1="300" x2="790" y2="300" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    case 'lead-generation':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 300 100 L 700 100 L 600 350 L 400 350 Z" stroke="#fff" strokeWidth="2" />
          <path d="M 450 350 L 450 500 L 550 500 L 550 350" stroke="#fff" strokeWidth="2" />
          <circle cx="500" cy="200" r="15" fill="#fff" className="animate-bounce" />
          <circle cx="500" cy="420" r="10" fill="#fff" className="animate-ping" />
        </svg>
      );
    case 'website-development':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,80 H1200 M0,160 H1200 M0,240 H1200 M0,320 H1200 M80,0 V600 M160,0 V600 M240,0 V600" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x="100" y="250" fill="#fff" fontSize="56" fontWeight="bold" fontFamily="monospace">{"</>"}</text>
          <text x="750" y="450" fill="#fff" fontSize="64" fontWeight="bold" fontFamily="monospace">{"{ }"}</text>
        </svg>
      );
    case 'marketing-automation':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="250" cy="200" r="50" stroke="#fff" strokeWidth="3" strokeDasharray="6 4" />
          <circle cx="250" cy="200" r="15" stroke="#fff" strokeWidth="2" />
          <circle cx="750" cy="300" r="70" stroke="#fff" strokeWidth="4" strokeDasharray="8 6" />
          <circle cx="750" cy="300" r="25" stroke="#fff" strokeWidth="2" />
          <path d="M 300 200 H 680 V 300" stroke="#fff" strokeWidth="2" />
          <circle cx="680" cy="300" r="8" fill="#fff" />
        </svg>
      );
    case 'influencer-marketing':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 200 150 L 230 220 L 300 220 L 250 270 L 270 340 L 200 290 L 130 340 L 150 270 L 100 220 L 170 220 Z" fill="#fff" />
          <path d="M 800 350 L 830 420 L 900 420 L 850 470 L 870 540 L 800 490 L 730 540 L 750 470 L 700 420 L 770 420 Z" fill="#fff" />
          <circle cx="500" cy="200" r="35" stroke="#fff" strokeWidth="2" />
          <path d="M 485 180 L 525 200 L 485 220 Z" fill="#fff" />
        </svg>
      );
    case 'video-marketing':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 150 150 L 250 210 L 150 270 Z" fill="#fff" className="animate-pulse" />
          <path d="M 750 350 L 850 410 L 750 470 Z" fill="#fff" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <rect x="400" y="400" width="200" height="40" stroke="#fff" strokeWidth="2" />
          <rect x="420" y="405" width="25" height="30" fill="#fff" opacity="0.3" />
          <rect x="450" y="405" width="25" height="30" fill="#fff" opacity="0.3" />
          <rect x="480" y="405" width="25" height="30" fill="#fff" opacity="0.3" />
        </svg>
      );
    default:
      return null;
  }
}

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: `${service.title} Services | Amplivo Digital Marketing Agency`,
    description: service.shortDesc,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = iconMap[service.icon] || Zap;

  const relatedServices = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #111827 0%, #4C1D95 45%, #7C3AED 75%, #06B6D4 100%)' }}
      >
        {/* Service-Specific Background Overlay */}
        <ServiceHeroBackground slug={service.slug} />

        {/* Decorative blobs */}
        <div
          className="absolute inset-0 opacity-[0.06] select-none pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 60%, #fff 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #06B6D4 0%, transparent 50%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 z-20 mb-2 opacity-0 animate-fade-in-up">
          <BackButton href="/services" label="Back to Services" className="text-white/80 hover:text-white border border-white/20 bg-white/5 rounded-full px-4 py-2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 z-20 mb-8 opacity-0 animate-fade-in-up">
          <nav className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <ChevronRight size={14} />
            <span className="text-white/90">{service.title}</span>
          </nav>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-0 animate-fade-in-up">
            <Icon size={30} className="text-white" />
          </div>
          <h1 
            className="text-4xl lg:text-5xl font-bold text-white mb-5 opacity-0 animate-fade-in-up" 
            style={{ fontFamily: "'Sora', sans-serif", animationDelay: '100ms' }}
          >
            {service.title}
          </h1>
          <p 
            className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {service.fullDesc}
          </p>
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#4C1D95] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/92 transition-all shadow-lg"
            >
              Get a Free Strategy Call <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-3xl font-bold text-slate-900 mb-8" style={{ fontFamily: "'Sora', sans-serif" }}>
                What&apos;s Included
              </h2>
              <div className="space-y-3">
                {service.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              {service.platforms && (
                <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Platforms & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.platforms.map((p) => (
                      <span key={p} className="bg-white border border-slate-200 text-slate-700 text-sm px-3 py-1.5 rounded-xl font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {service.deliverables && (
                <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Deliverables</h3>
                  <div className="space-y-2">
                    {service.deliverables.map((d) => (
                      <div key={d} className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="text-[#4C1D95] font-bold">→</span> {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 opacity-0 animate-fade-in-up" style={{ fontFamily: "'Sora', sans-serif" }}>Related Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedServices.map((rs, idx) => {
              const RIcon = iconMap[rs.icon] || Zap;
              return (
                <Link 
                  key={rs.id} 
                  href={`/services/${rs.slug}`} 
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all group opacity-0 animate-fade-in-up flex flex-col"
                  style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                >
                  <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-4" style={{ backgroundColor: `${rs.color}12` }}>
                    <RIcon size={20} style={{ color: rs.color }} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{rs.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">{rs.shortDesc}</p>
                  <span className="text-[#4C1D95] text-sm font-semibold group-hover:gap-2 flex items-center gap-1">Learn more <ArrowRight size={12} /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
