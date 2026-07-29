'use client';
import { SalesLeadStatus } from '@/types';

const statusConfig: Record<SalesLeadStatus, { bg: string; text: string; border: string; dot: string }> = {
  'New':                { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  'Contacted':          { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400' },
  'Meeting Scheduled':  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500' },
  'Proposal Sent':      { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-500' },
  'Negotiation':        { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  'Won':                { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Lost':               { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     dot: 'bg-red-400' },
  'Ready for CRM':      { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500' },
};

interface LeadStatusBadgeProps {
  status: SalesLeadStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function LeadStatusBadge({ status, size = 'sm', showDot = true }: LeadStatusBadgeProps) {
  const cfg = statusConfig[status] ?? { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' };
  const sizeClass =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' :
    size === 'lg' ? 'px-4 py-1.5 text-sm' :
    'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
      {status}
    </span>
  );
}

export { statusConfig };
