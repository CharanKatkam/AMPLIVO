import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = 'Back', className = '' }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-[#4C1D95] font-semibold text-sm hover:translate-x-[-4px] transition-transform ${className}`}
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
