import type { Metadata } from 'next';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CTASection } from '@/components/marketing/CTASection';
import { teamMembers } from '@/data/team';
import { Briefcase, MapPin, Calendar, Users, Award, Globe } from 'lucide-react';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'About Amplivo | Premium Digital Marketing Agency | Hyderabad',
  description: 'Learn about Amplivo Digital Growth Private Limited — our story, mission, vision, values, team, and offices across India.',
};

const values = [
  { title: 'Creativity', desc: 'Every campaign begins with a bold creative idea that cuts through noise.' },
  { title: 'Performance', desc: 'We measure success in business outcomes, not vanity metrics.' },
  { title: 'Transparency', desc: 'Real-time dashboards and honest reporting — no hidden surprises.' },
  { title: 'Innovation', desc: 'We embrace new technologies and platforms before your competitors do.' },
  { title: 'Data-Driven', desc: 'Every decision is backed by analytics, audience insights, and testing.' },
  { title: 'Client Growth', desc: 'Your growth is our growth. We succeed only when you succeed.' },
  { title: 'Ownership', desc: 'We take full responsibility for campaign outcomes and results.' },
  { title: 'Speed', desc: 'Fast execution without sacrificing quality or strategy.' },
  { title: 'Collaboration', desc: 'Deep partnership with every client — your team, extended.' },
  { title: 'Measurable Results', desc: 'Every rupee of ad spend is tracked, attributed, and optimised.' },
  { title: 'Continuous Testing', desc: 'We A/B test everything to discover what truly works for your audience.' },
  { title: 'Brand Integrity', desc: 'We protect and enhance your brand reputation at every touchpoint' },
];

const milestones = [
  { year: '2012', event: 'Founded in Hyderabad with a 4-person team' },
  { year: '2015', event: 'Expanded to Bengaluru and Mumbai offices' },
  { year: '2018', event: 'Launched proprietary campaign analytics platform' },
  { year: '2020', event: 'Crossed ₹10Cr managed ad spend milestone' },
  { year: '2022', event: 'Opened Chennai, Pune offices and Dubai sales office' },
  { year: '2024', event: '85+ team members, 250+ clients, 40+ industries served' },
];

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section
        className="pt-32 pb-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #1a0540 0%, #4C1D95 40%, #7C3AED 80%, #06B6D4 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <AnimateOnScroll animation="fade-in">
            <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
              About Amplivo
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              We Are a Digital Growth<br />Agency That Delivers Results
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={160}>
            <p className="text-white/75 text-lg leading-relaxed max-w-2xl mx-auto">
              Amplivo combines creativity, technology, and marketing analytics to help businesses amplify their digital presence and accelerate measurable growth.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <AnimateOnScroll animation="fade-right">
              <div className="bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] rounded-2xl p-8 text-white h-full">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Globe size={22} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Our Vision</h2>
                <p className="text-white/85 leading-relaxed">
                  To become a high-performance digital growth company known for measurable campaigns, outstanding creative execution, and transparent client reporting — trusted by ambitious brands across India and globally.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-left">
              <div className="bg-[#F9FAFB] rounded-2xl p-8 border border-slate-200 h-full">
                <div className="w-12 h-12 bg-[#4C1D95]/10 rounded-xl flex items-center justify-center mb-6">
                  <Award size={22} className="text-[#4C1D95]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Our Mission</h2>
                <p className="text-slate-600 leading-relaxed">
                  To help businesses acquire customers and build strong digital brands through data-driven marketing, compelling content, and scalable technology — delivering measurable ROI on every engagement.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-14">
              <span className="inline-block bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
                Core Values
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                What We Stand For
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {values.map((v, i) => (
              <AnimateOnScroll key={i} animation="scale-in" delay={i * 50}>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#4C1D95]/30 hover:shadow-md transition-all card-hover h-full">
                  <div className="w-8 h-8 bg-[#4C1D95] rounded-lg flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-xs">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{v.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-14">
              <span className="inline-block bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
                Leadership Team
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                The People Behind Your Growth
              </h2>
              <p className="text-slate-500 mt-3 max-w-lg mx-auto">85+ creative and marketing professionals united by a passion for measurable results.</p>
            </div>
          </AnimateOnScroll>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <AnimateOnScroll key={member.id} animation="fade-up" delay={i * 60}>
                <div className="group text-center">
                  <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D95]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {member.linkedin && (
                      <a href={member.linkedin} className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 bg-white text-[#4C1D95] text-xs font-semibold px-3 py-1.5 rounded-full">
                          <Briefcase size={12} /> LinkedIn
                        </div>
                      </a>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{member.name}</h3>
                  <p className="text-[#7C3AED] text-xs font-medium">{member.role}</p>
                  <p className="text-slate-400 text-xs">{member.department}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-14">
              <span className="inline-block bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
                Our Journey
              </span>
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Key Milestones</h2>
            </div>
          </AnimateOnScroll>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <AnimateOnScroll key={i} animation={i % 2 === 0 ? 'fade-left' : 'fade-right'} delay={i * 100}>
                  <div className={`flex items-center gap-6 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm inline-block max-w-xs card-hover">
                        <div className="font-bold text-[#4C1D95] text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{m.year}</div>
                        <div className="text-slate-700 text-sm">{m.event}</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#4C1D95] flex items-center justify-center flex-shrink-0 z-10">
                      <Calendar size={16} className="text-white" />
                    </div>
                    <div className="flex-1" />
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <AnimateOnScroll animation="fade-up">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Our Offices</h2>
            </div>
          </AnimateOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { city: 'Hyderabad', role: 'Headquarters', address: 'Hi-Tech City, Hyderabad, Telangana 500081', flag: '🇮🇳' },
              { city: 'Bengaluru', role: 'Branch Office', address: 'Indiranagar, Bengaluru, Karnataka 560038', flag: '🇮🇳' },
              { city: 'Mumbai', role: 'Branch Office', address: 'Andheri West, Mumbai, Maharashtra 400053', flag: '🇮🇳' },
              { city: 'Chennai', role: 'Branch Office', address: 'T. Nagar, Chennai, Tamil Nadu 600017', flag: '🇮🇳' },
              { city: 'Pune', role: 'Branch Office', address: 'Koregaon Park, Pune, Maharashtra 411001', flag: '🇮🇳' },
              { city: 'Dubai', role: 'Sales Office', address: 'Business Bay, Dubai, UAE', flag: '🇦🇪' },
            ].map((o, i) => (
              <AnimateOnScroll key={o.city} animation="fade-up" delay={i * 80}>
                <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-200 card-hover h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{o.flag}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{o.city}</h3>
                      <span className="text-xs text-[#7C3AED] font-medium">{o.role}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-500 text-sm">
                    <MapPin size={14} className="text-[#4C1D95] mt-0.5 flex-shrink-0" />
                    {o.address}
                  </div>
                </div>
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
