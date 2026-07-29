'use client';
import { statusColors } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normalized = (status || '').trim();
  const matchedKey = Object.keys(statusColors).find((k) => k.toLowerCase() === normalized.toLowerCase()) || normalized;
  const colorClass = statusColors[matchedKey] ?? statusColors[normalized] ?? 'bg-blue-50 text-blue-700 border-blue-200';
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const displayStatus = normalized.replace('_', ' ').toUpperCase();
  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${sizeClass} ${colorClass}`}>
      {displayStatus}
    </span>
  );
}
