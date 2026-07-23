'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-2 text-[#4C1D95] font-semibold text-sm hover:translate-x-[-4px] transition-transform ${className}`}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
