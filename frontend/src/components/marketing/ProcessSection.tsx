'use client';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

const steps = [
  { num: '01', title: 'Client Onboarding', desc: 'We learn your business, goals, competitors, and current digital presence through a structured onboarding process.' },
  { num: '02', title: 'Business Audit', desc: 'Deep audit of your existing digital assets — website, ads, SEO, social, and analytics — to identify opportunities.' },
  { num: '03', title: 'Goal Definition', desc: 'We align on measurable KPIs: lead targets, ROAS, organic traffic, brand reach, or revenue goals.' },
  { num: '04', title: 'Strategy Creation', desc: 'Our strategists design a custom multi-channel marketing plan tailored to your market and budget.' },
  { num: '05', title: 'Campaign Planning', desc: 'Detailed content calendars, ad frameworks, creative briefs, and campaign structures are built for approval.' },
  { num: '06', title: 'Launch & Optimise', desc: 'Campaigns go live, data flows in, and we continuously optimise for performance and efficiency.' },
  { num: '07', title: 'Monitor & Report', desc: 'Real-time dashboards, weekly performance updates, and monthly strategy reviews keep you fully informed.' },
  { num: '08', title: 'Review & Scale', desc: 'We identify what works, double down on winning channels, and scale your results quarter over quarter.' },
];

export function ProcessSection() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimateOnScroll animation="fade-up">
          <SectionHeader
            eyebrow="Our Process"
            title="How We Deliver Consistent Growth"
            subtitle="A structured, data-backed marketing process designed to deliver results from day one and compound over time."
          />
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <AnimateOnScroll key={step.num} animation="fade-up" delay={i * 75}>
              <div className="relative group h-full">
                {/* Connector line (desktop) removed as requested */}
                <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-200 hover:border-[#4C1D95]/30 hover:shadow-md transition-all h-full card-hover">
                  <div
                    className="w-12 h-12 rounded-xl bg-[#4C1D95] flex items-center justify-center mb-4 text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
