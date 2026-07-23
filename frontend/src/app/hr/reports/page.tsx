'use client';
import { AnalyticsCard } from '@/components/hr/AnalyticsCard';
import { useHrStore, useHrStats } from '@/store/hrStore';
import { BarChart2, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';

export default function ReportsPage() {
  const stats = useHrStats();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Recruitment Reports</h1>
        <p className="text-slate-500">Analytics and insights into the hiring process.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Offer Acceptance Rate"
          value="85%"
          icon={<PieChartIcon size={20} />}
          trend="5% vs last month"
          trendUp={true}
        />
        <AnalyticsCard
          title="Time to Hire"
          value="18 Days"
          icon={<TrendingUp size={20} />}
          trend="2 days faster"
          trendUp={true}
        />
        <AnalyticsCard
          title="Interview Success"
          value="42%"
          icon={<BarChart2 size={20} />}
          trend="Stable"
          trendUp={true}
        />
        <AnalyticsCard
          title="Source: LinkedIn"
          value="45%"
          icon={<Users size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <BarChart2 size={48} className="text-slate-200 mb-4" />
          <h3 className="text-slate-500 font-medium">Hiring Funnel Chart Placeholder</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <PieChartIcon size={48} className="text-slate-200 mb-4" />
          <h3 className="text-slate-500 font-medium">Applications by Department Placeholder</h3>
        </div>
      </div>
    </div>
  );
}
