'use client';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  iconColor: string;
  trend?: boolean | null;
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, sub, icon, iconColor, trend, trendValue, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        {trend !== null && trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trend ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue ?? (trend ? '+12.4%' : '-2.1%')}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}
