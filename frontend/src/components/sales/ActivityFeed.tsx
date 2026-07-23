'use client';
import { TimelineEvent } from '@/types';
import {
  UserPlus, RefreshCw, CalendarDays, CheckCircle2, StickyNote,
  FileText, DollarSign, Package,
} from 'lucide-react';

const eventConfig: Record<TimelineEvent['type'], { icon: React.ElementType; color: string; bg: string }> = {
  lead_created:        { icon: UserPlus,      color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  status_changed:      { icon: RefreshCw,     color: 'text-violet-600',  bg: 'bg-violet-50 border-violet-200' },
  meeting_scheduled:   { icon: CalendarDays,  color: 'text-cyan-600',    bg: 'bg-cyan-50 border-cyan-200' },
  meeting_completed:   { icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  note_added:          { icon: StickyNote,    color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  invoice_generated:   { icon: FileText,      color: 'text-purple-600',  bg: 'bg-purple-50 border-purple-200' },
  budget_updated:      { icon: DollarSign,    color: 'text-green-600',   bg: 'bg-green-50 border-green-200' },
  services_updated:    { icon: Package,       color: 'text-pink-600',    bg: 'bg-pink-50 border-pink-200' },
};

interface ActivityFeedProps {
  events: TimelineEvent[];
  maxItems?: number;
}

export function ActivityFeed({ events, maxItems }: ActivityFeedProps) {
  const sorted = [...events].sort((a, b) => {
    const da = new Date(`${a.date}T${a.time}`);
    const db = new Date(`${b.date}T${b.time}`);
    return db.getTime() - da.getTime();
  });
  const displayed = maxItems ? sorted.slice(0, maxItems) : sorted;

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-100" />
      <div className="space-y-4">
        {displayed.map((event, idx) => {
          const cfg = eventConfig[event.type];
          const Icon = cfg.icon;
          return (
            <div key={`${event.id}-${idx}`} className="flex gap-4 items-start relative">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 z-10 ${cfg.bg}`}>
                <Icon size={16} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-slate-800 font-medium leading-snug">{event.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{event.date}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-xs text-slate-400">{event.time}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-xs text-[#4C1D95] font-medium">{event.actor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
