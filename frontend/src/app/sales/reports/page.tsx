'use client';
import { useEffect, useMemo } from 'react';
import { SalesHeader } from '@/components/sales/SalesSidebar';
import { useSalesStore } from '@/store/salesStore';
import { TrendingUp, Trophy, Target, Users, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie,
} from 'recharts';

const PIPELINE_COLORS: Record<string, string> = {
  'New': '#93C5FD',
  'Contacted': '#94A3B8',
  'Meeting Scheduled': '#A78BFA',
  'Proposal Sent': '#67E8F9',
  'Negotiation': '#FCD34D',
  'Won': '#34D399',
  'Lost': '#FCA5A5',
  'Ready for CRM': '#C4B5FD',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReportsPage() {
  const { leads, isLoading, fetchLeads } = useSalesStore();

  useEffect(() => {
    if (leads.length === 0) fetchLeads();
  }, [leads.length, fetchLeads]);

  const byStatus = useMemo(() =>
    Object.entries(
      leads.reduce<Record<string, number>>((acc, l) => {
        acc[l.status] = (acc[l.status] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value, color: PIPELINE_COLORS[name] ?? '#94A3B8' })),
    [leads]
  );

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { newLeads: number; won: number; lost: number; revenue: number }> = {};
    leads.forEach((l) => {
      const d = new Date(l.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      if (!grouped[key]) grouped[key] = { newLeads: 0, won: 0, lost: 0, revenue: 0 };
      grouped[key].newLeads += 1;
      if (l.status === 'Won' || l.status === 'Ready for CRM') {
        grouped[key].won += 1;
        grouped[key].revenue += l.budget * 3;
      }
      if (l.status === 'Lost') grouped[key].lost += 1;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => ({
        month: Object.keys(grouped).find((k) => grouped[k] === v)?.split('-').map((p, i) => i === 1 ? MONTH_NAMES[Number(p)] : p).join(' ') || '',
        ...v,
      }));
  }, [leads]);

  const revenueData = useMemo(() =>
    monthlyData.map((m) => ({ month: m.month, revenue: +(m.revenue / 100000).toFixed(1) })),
    [monthlyData]
  );

  const teamPerformance = useMemo(() => {
    const grouped: Record<string, { name: string; leads: number; won: number; budget: number }> = {};
    leads.forEach((l) => {
      const rep = l.assignedTo || 'Unassigned';
      if (!grouped[rep]) grouped[rep] = { name: rep, leads: 0, won: 0, budget: 0 };
      grouped[rep].leads += 1;
      grouped[rep].budget += l.budget;
      if (l.status === 'Won' || l.status === 'Ready for CRM') grouped[rep].won += 1;
    });
    return Object.values(grouped);
  }, [leads]);

  const wonLeads = leads.filter((l) => l.status === 'Won' || l.status === 'Ready for CRM');
  const activeLeads = leads.filter((l) => l.status !== 'Lost');
  const totalRevenue = wonLeads.reduce((sum, l) => sum + l.budget * 3, 0);
  const conversionRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;
  const avgDealSize = wonLeads.length > 0 ? Math.round(wonLeads.reduce((sum, l) => sum + l.budget, 0) / wonLeads.length) : 0;

  const kpis = [
    { label: 'Total Pipeline', value: `₹${(activeLeads.reduce((s, l) => s + l.budget, 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: '#4C1D95' },
    { label: 'Won Revenue (Q)', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: Trophy, color: '#10B981' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: '#06B6D4' },
    { label: 'Avg. Deal Size', value: `₹${(avgDealSize / 1000).toFixed(0)}K`, icon: Users, color: '#7C3AED' },
  ];

  if (isLoading) {
    return (
      <div>
        <SalesHeader title="Reports" subtitle="Sales performance analytics" />
        <div className="p-6 flex items-center justify-center h-96">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SalesHeader title="Reports" subtitle="Sales performance analytics" />

      <div className="p-6 space-y-6 max-w-[1400px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-4" style={{ backgroundColor: `${item.color}18` }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</div>
              <div className="text-sm text-slate-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-5">Monthly Lead Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="newLeads" name="New Leads" fill="#DDD6FE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="won" name="Won" fill="#4C1D95" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" name="Lost" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-5">Pipeline Breakdown</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {byStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {byStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-5">Revenue Trend (L)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} formatter={(v) => [`₹${v}L`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#4C1D95" strokeWidth={2.5} dot={{ fill: '#4C1D95', r: 4 }} name="Revenue (L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-5">Sales Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Sales Rep', 'Leads', 'Won', 'Total Budget'].map((h) => (
                    <th key={h} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamPerformance.map((member) => (
                  <tr key={member.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4C1D95] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 text-sm">{member.leads}</td>
                    <td className="py-4 px-4 font-bold text-emerald-600 text-sm">{member.won}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">₹{(member.budget / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
                {teamPerformance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-400">No team data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
