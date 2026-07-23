// Utility helpers for Amplivo frontend

/**
 * Combine class names (tiny clsx alternative)
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format Indian currency
 */
export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Get initials from a name (e.g. "Rajesh Kumar" → "RK")
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Status badge color mapping
 */
export const statusColors: Record<string, string> = {
  // Campaign statuses
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paused: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Draft: 'bg-slate-100 text-slate-500 border-slate-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  // Lead statuses
  Hot: 'bg-red-50 text-red-600 border-red-200',
  Warm: 'bg-orange-50 text-orange-600 border-orange-200',
  Cold: 'bg-sky-50 text-sky-600 border-sky-200',
  Converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Lost: 'bg-slate-100 text-slate-500 border-slate-200',
  // Creative statuses
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-red-50 text-red-600 border-red-200',
  Revision: 'bg-purple-50 text-purple-700 border-purple-200',
  // Invoice statuses
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Overdue: 'bg-red-50 text-red-600 border-red-200',
  // Influencer statuses
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Campaign': 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  // Task priorities
  Critical: 'bg-red-50 text-red-600 border-red-200',
  High: 'bg-orange-50 text-orange-600 border-orange-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Low: 'bg-slate-100 text-slate-500 border-slate-200',
  // Task statuses
  Todo: 'bg-slate-100 text-slate-600 border-slate-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Review: 'bg-purple-50 text-purple-700 border-purple-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  // Staff statuses
  'On Leave': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  // Sales Pipeline statuses
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contacted': 'bg-slate-50 text-slate-600 border-slate-200',
  'Meeting Scheduled': 'bg-violet-50 text-violet-700 border-violet-200',
  'Proposal Sent': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Negotiation': 'bg-amber-50 text-amber-700 border-amber-200',
  'Won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Ready for CRM': 'bg-purple-50 text-purple-700 border-purple-200',
};
