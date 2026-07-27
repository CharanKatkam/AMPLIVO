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
  const showWhite = variant === 'white' || variant === 'light';

  const content = (
    <div className="flex items-center cursor-pointer">
      <div className="relative">
        <Image
          src="/images/Logo.png"
          alt="Amplivo Digital Growth"
          width={width}
          height={height}
          priority
          className={`object-contain transition-opacity duration-200 ease-in-out ${
            showWhite ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ height: `${height}px`, width: 'auto' }}
        />
        <Image
          src="/images/logo-dark.png"
          alt="Amplivo Digital Growth"
          width={width}
          height={height}
          priority
          className={`absolute inset-0 object-contain transition-opacity duration-200 ease-in-out ${
            showWhite ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ height: `${height}px`, width: 'auto' }}
        />
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
