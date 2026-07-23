'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { teamMembers } from '@/data/team';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';

export function TeamSection() {
  const featured = teamMembers.slice(0, 8);

  return (
    <section className="bg-[#F9FAFB] py-14">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <AnimateOnScroll animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
                Our Team
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                The People Behind Your Growth
              </h2>
              <p className="text-slate-500 mt-2 max-w-md">85+ creative and marketing professionals united by a passion for measurable results.</p>
            </div>
            <Link
              href="/about#team"
              className="hidden md:flex items-center gap-2 text-[#4C1D95] font-semibold text-sm hover:underline whitespace-nowrap"
            >
              Meet the full team <ArrowRight size={14} />
            </Link>
          </div>
        </AnimateOnScroll>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {featured.map((member, i) => (
            <AnimateOnScroll key={member.id} animation="fade-up" delay={i * 70}>
              <div className="group text-center">
                <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D95]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-1.5 bg-white text-[#4C1D95] text-xs font-semibold px-3 py-1.5 rounded-full">
                        <FaLinkedin size={12} /> LinkedIn
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

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/about#team"
            className="inline-flex items-center gap-2 text-[#4C1D95] font-semibold text-sm"
          >
            Meet the full team <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
