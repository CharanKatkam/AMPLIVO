import { ReactNode } from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function AnalyticsCard({ title, value, icon, trend, trendUp }: AnalyticsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#4C1D95]">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
          {value}
        </div>
        {trend && (
          <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  );
}
