'use client';
import { useState } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { MapPin, Mail, Clock, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { consultationService } from '@/services/moduleServices';

const offices = [
  { city: 'Hyderabad', address: 'Hi-Tech City, Hyderabad, Telangana 500081', email: 'hyderabad@amplivo.in', flag: '🇮🇳', primary: true },
  { city: 'Bengaluru', address: 'Indiranagar, Bengaluru, Karnataka 560038', email: 'bengaluru@amplivo.in', flag: '🇮🇳', primary: false },
  { city: 'Mumbai', address: 'Andheri West, Mumbai, Maharashtra 400053', email: 'mumbai@amplivo.in', flag: '🇮🇳', primary: false },
  { city: 'Dubai', address: 'Business Bay, Dubai, UAE', email: 'dubai@amplivo.in', flag: '🇦🇪', primary: false },
];

interface FormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  service_interest: string;
  budget_range: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service_interest: '',
  budget_range: '',
  message: '',
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.company.trim()) errs.company = 'Company name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormState]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await consultationService.submit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        service_interest: form.service_interest || undefined,
        budget_range: form.budget_range || undefined,
        message: form.message.trim() || undefined,
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
      setError(
        axiosErr?.response?.data?.detail ||
        axiosErr?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              Get In Touch
            </span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={80}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Sora', sans-serif" }}>
              Let&apos;s Build Your Growth Strategy
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={160}>
            <p className="text-white/75 text-lg max-w-xl mx-auto">
              Book a free 30-minute digital audit. Walk away with a clear, customised marketing roadmap for your business.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <AnimateOnScroll animation="fade-right">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Book Free Growth Audit
                </h2>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CheckCircle size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Request Submitted!</h3>
                    <p className="text-slate-500 max-w-xs">
                      Thank you! We&apos;ll review your request and get back to you within 4 business hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-2 px-5 py-2.5 bg-[#4C1D95] text-white text-sm font-semibold rounded-xl hover:bg-[#3b1574] transition-colors"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {error && (
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Rajesh Kumar"
                          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] ${fieldErrors.name ? 'border-red-300' : 'border-slate-200'}`}
                        />
                        {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Company *</label>
                        <input
                          type="text"
                          name="company"
                          value={form.company}
                          onChange={handleChange}
                          placeholder="Company Name"
                          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] ${fieldErrors.company ? 'border-red-300' : 'border-slate-200'}`}
                        />
                        {fieldErrors.company && <p className="text-red-500 text-xs mt-1">{fieldErrors.company}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="rajesh@company.in"
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] ${fieldErrors.email ? 'border-red-300' : 'border-slate-200'}`}
                      />
                      {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Required</label>
                      <select
                        name="service_interest"
                        value={form.service_interest}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] bg-white"
                      >
                        <option value="">Select a service...</option>
                        <option>Social Media Marketing</option>
                        <option>Performance Marketing</option>
                        <option>SEO</option>
                        <option>Branding & Creative</option>
                        <option>Content Marketing</option>
                        <option>Lead Generation</option>
                        <option>Website Development</option>
                        <option>Marketing Automation</option>
                        <option>Influencer Marketing</option>
                        <option>Video Marketing</option>
                        <option>Full-Service Package</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Budget Range</label>
                      <select
                        name="budget_range"
                        value={form.budget_range}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] bg-white"
                      >
                        <option value="">Select budget...</option>
                        <option>₹25,000 – ₹50,000</option>
                        <option>₹50,000 – ₹1,00,000</option>
                        <option>₹1,00,000 – ₹2,50,000</option>
                        <option>₹2,50,000 – ₹5,00,000</option>
                        <option>₹5,00,000+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about your business and marketing goals..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-[#4C1D95] text-white font-semibold py-3.5 rounded-xl hover:bg-[#3b1574] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Book Free Growth Audit <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-400 text-center">We respond within 4 business hours. No spam, ever.</p>
                  </form>
                )}
              </div>
            </AnimateOnScroll>

            {/* Info */}
            <AnimateOnScroll animation="fade-left">
              <div className="space-y-6">
                {/* Availability */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Reach Us Directly</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail size={16} className="text-[#4C1D95] flex-shrink-0" />
                      <a href="mailto:hello@amplivo.in" className="hover:text-[#4C1D95]">hello@amplivo.in</a>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock size={16} className="text-[#4C1D95] flex-shrink-0" />
                      <span>Mon – Sat, 9:00 AM – 7:00 PM IST</span>
                    </div>
                  </div>
                </div>

                {/* What to Expect */}
                <div className="bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] rounded-2xl p-6 text-white">
                  <h3 className="font-semibold text-lg mb-4">What to Expect from Your Free Audit</h3>
                  <div className="space-y-3">
                    {[
                      'Comprehensive review of your current digital presence',
                      'Competitor analysis and gap identification',
                      'Customised marketing strategy recommendation',
                      'Budget optimisation guidance',
                      'Clear 90-day action plan',
                      'No pressure, no obligation',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-white/85">
                        <span className="text-[#06B6D4] font-bold flex-shrink-0">✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Offices */}
                <div className="grid grid-cols-2 gap-3">
                  {offices.map((o) => (
                    <div key={o.city} className={`bg-white rounded-xl p-4 border ${o.primary ? 'border-[#4C1D95]/30' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{o.flag}</span>
                        <span className="font-semibold text-slate-900 text-sm">{o.city}</span>
                        {o.primary && <span className="text-[10px] bg-[#4C1D95]/10 text-[#4C1D95] px-1.5 py-0.5 rounded-full font-semibold">HQ</span>}
                      </div>
                      <p className="text-slate-500 text-[11px] leading-tight">{o.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
