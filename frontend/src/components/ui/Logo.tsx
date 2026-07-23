'use client';
import { Zap } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light' | 'white';
  href?: string;
}

const sizeMap = {
  sm: { icon: 28, font: 'text-lg', iconSize: 14 },
  md: { icon: 34, font: 'text-xl', iconSize: 17 },
  lg: { icon: 44, font: 'text-2xl', iconSize: 22 },
};

const variantMap = {
  dark: 'text-slate-900',
  light: 'text-slate-900',
  white: 'text-white',
};

export function Logo({ size = 'md', variant = 'dark', href = '/' }: LogoProps) {
  const { icon, font, iconSize } = sizeMap[size];
  const textColor = variantMap[variant];

  const content = (
    <div className="flex items-center gap-2.5 cursor-pointer">
      <div
        className="rounded-xl bg-[#4C1D95] flex items-center justify-center flex-shrink-0"
        style={{ width: icon, height: icon }}
      >
        <Zap size={iconSize} className="text-white" />
      </div>
      <span
        className={`font-bold ${font} ${textColor}`}
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        Amplivo
      </span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
