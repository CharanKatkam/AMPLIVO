import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { BackButton } from '@/components/ui/BackButton';
import { industries } from '@/data/industries';
import { ArrowRight, CheckCircle2, ChevronRight, Building2, GraduationCap, Heart, Cpu, ShoppingBag, Shirt, Hotel, UtensilsCrossed, Car, TrendingUp, Rocket, Factory, Music, UserCircle, Briefcase, Package } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Building2, GraduationCap, Heart, Cpu, ShoppingBag, Shirt, Hotel, UtensilsCrossed, Car, TrendingUp, Rocket, Factory, Music, UserCircle, Briefcase, Package
};

const industryImages: Record<string, string> = {
  'real-estate': '/images/industries/industry_real_estate_1784618524097.png',
  'education': '/images/industries/industry_education_1784618535761.png',
  'healthcare': '/images/industries/industry_healthcare_1784618548534.png',
  'information-technology': '/images/industries/industry_it_1784618560373.png',
  'e-commerce': '/images/industries/industry_ecommerce_1784618574063.png',
  'fashion-lifestyle': '/images/industries/industry_fashion_1784618586127.png',
  'hospitality': '/images/industries/industry_hospitality_1784618598421.png',
  'restaurants-food': '/images/industries/industry_food_1784618610639.png',
  'automotive': '/images/industries/industry_automotive_1784618637494.png',
  'finance-fintech': '/images/industries/industry_finance_1784618650210.png',
  'startups': '/images/industries/industry_startups_1784618661082.png',
  'manufacturing': '/images/industries/industry_manufacturing_1784618671588.png',
  'entertainment': '/images/industries/industry_entertainment_1784618684468.png',
  'personal-brands': '/images/industries/industry_startups_1784618661082.png',
  'professional-services': '/images/industries/industry_finance_1784618650210.png',
  'consumer-products': '/images/industries/industry_ecommerce_1784618574063.png',
};

export function generateStaticParams() {
  return industries.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return { title: 'Not Found' };
  
  return {
    title: `${industry.name} Digital Marketing Solutions | Amplivo`,
    description: industry.fullDesc,
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) notFound();

  const Icon = iconMap[industry.icon] || Building2;

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
        {/* Dynamic Background gradient based on industry color */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ background: `radial-gradient(circle at top right, ${industry.color}, transparent)` }}
        />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8 text-sm font-medium text-white/70">
                <BackButton href="/industries" label="Back to Industries" className="text-white/80 hover:text-white border border-white/20 bg-white/5 rounded-full px-4 py-2 mr-4" />
                <Link href="/industries" className="hover:text-white transition-colors">Industries</Link>
                <ChevronRight size={14} />
                <span className="text-white">{industry.name}</span>
              </div>

              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8"
                style={{ backgroundColor: `${industry.color}20`, color: industry.color }}
              >
                <Icon size={32} />
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight break-words" style={{ fontFamily: "'Sora', sans-serif" }}>
                Digital Marketing for <br />
                <span style={{ color: industry.color }} className="inline-block max-w-full">{industry.name}</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-10">
                {industry.fullDesc}
              </p>
              
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-6 py-3.5 rounded-xl hover:bg-slate-50 transition-colors">
                Book Industry Audit <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-slate-900/40 to-transparent z-10 pointer-events-none" />
              <Image 
                src={industryImages[industry.slug] || '/images/industries/industry_it_1784618560373.png'} 
                alt={`${industry.name} Digital Marketing`}
                width={800}
                height={460}
                className="h-[460px] object-cover rounded-2xl shadow-2xl border border-white/10"
              />
              <div 
                className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none z-0" 
                style={{ backgroundColor: industry.color }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-32">
                <h3 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Key Challenges
                </h3>
                <ul className="space-y-4">
                  {industry.challenges?.map((challenge, index) => (
                    <li key={index} className="flex gap-3 text-slate-600">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="leading-relaxed">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
                  How Amplivo Works in {industry.name}
                </h2>
                <p className="text-lg text-slate-600">
                  We leverage our comprehensive suite of services to overcome industry-specific hurdles and drive measurable growth.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {industry.solutions?.map((solution, index) => (
                  <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-[#4C1D95]/30 hover:shadow-lg transition-all group h-full">
                    <CheckCircle2 size={24} className="mb-5" style={{ color: industry.color }} />
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#4C1D95] transition-colors">{solution.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{solution.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
