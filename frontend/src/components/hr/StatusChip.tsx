'use client';

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  let bg = 'bg-slate-100';
  let text = 'text-slate-700';

  switch (status) {
    case 'Published':
    case 'Hired':
    case 'Accepted':
    case 'Completed':
      bg = 'bg-emerald-100';
      text = 'text-emerald-700';
      break;
    case 'Draft':
    case 'New':
    case 'Generated':
      bg = 'bg-blue-100';
      text = 'text-blue-700';
      break;
    case 'Closed':
    case 'Rejected':
    case 'Declined':
    case 'Cancelled':
      bg = 'bg-rose-100';
      text = 'text-rose-700';
      break;
    case 'Shortlisted':
    case 'Interviewing':
    case 'Scheduled':
    case 'Sent':
    case 'Offered':
      bg = 'bg-purple-100';
      text = 'text-purple-700';
      break;
    case 'Screening':
    case 'Rescheduled':
      bg = 'bg-amber-100';
      text = 'text-amber-700';
      break;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {status}
    </span>
  );
}
