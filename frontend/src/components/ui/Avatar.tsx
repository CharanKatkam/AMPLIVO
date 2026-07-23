'use client';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  image?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
};

export function Avatar({ name, image, size = 'sm', className = '' }: AvatarProps) {
  const sizeClass = sizeMap[size];

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#4C1D95] flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className="text-white font-bold">{getInitials(name)}</span>
    </div>
  );
}
