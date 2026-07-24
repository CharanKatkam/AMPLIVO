'use client';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light' | 'white';
  href?: string;
}

const sizeMap = {
  sm: { width: 200, height: 60 },
  md: { width: 300, height: 90 },
  lg: { width: 380, height: 110 },
};
export function Logo({ size = 'md', variant = 'dark', href = '/' }: LogoProps) {
  const { height, width } = sizeMap[size];

  const content = (
    <div className="flex items-center cursor-pointer">
      <Image
        src="/images/Logo.png"
        alt="Amplivo Digital Growth"
        width={width}
        height={height}
        priority
        className="object-contain"
        style={{ height: `${height}px`, width: 'auto' }}
      />
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
