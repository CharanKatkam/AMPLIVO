'use client';
import { statusColors } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colorClass = statusColors[status] ?? 'bg-slate-100 text-slate-500 border-slate-200';
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${sizeClass} ${colorClass}`}>
      {status}
    </span>
  );
}
