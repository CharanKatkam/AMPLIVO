'use client';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
  children?: ReactNode;
}

export function SectionHeader({ eyebrow, title, subtitle, align = 'center', light = false, children }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  const titleColor = light ? 'text-white' : 'text-slate-900';
  const subtitleColor = light ? 'text-white/70' : 'text-slate-500';

  return (
    <div className={`flex flex-col ${alignClass} ${align === 'center' ? 'mx-auto max-w-2xl' : ''} mb-14`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 bg-[#4C1D95]/10 text-[#4C1D95] text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl lg:text-4xl font-bold ${titleColor} leading-tight mb-4`}
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-base lg:text-lg ${subtitleColor} leading-relaxed`}>{subtitle}</p>
      )}
      {children}
    </div>
  );
}
