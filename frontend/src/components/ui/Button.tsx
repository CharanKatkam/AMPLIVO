'use client';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'white' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#4C1D95] text-white hover:bg-[#3b1574] shadow-sm',
  secondary: 'bg-[#7C3AED] text-white hover:bg-[#6d31d4]',
  outline: 'border border-[#4C1D95] text-[#4C1D95] hover:bg-[#4C1D95]/5',
  ghost: 'text-[#4C1D95] hover:bg-[#4C1D95]/8',
  white: 'bg-white text-[#4C1D95] hover:bg-white/90 shadow-lg shadow-black/15',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-[10px]',
  md: 'px-6 py-3 text-sm rounded-[14px]',
  lg: 'px-8 py-4 text-base rounded-[14px]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}
