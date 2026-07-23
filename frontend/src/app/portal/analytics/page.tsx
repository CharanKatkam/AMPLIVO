'use client';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Users, MousePointerClick, Calendar, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { campaignService, CampaignRead } from '@/services/campaignService';
import { leadService, LeadRead } from '@/services/leadService';
import { useToastStore } from '@/store/toastStore';

const RANGES = {
  '30d': { label: 'Last 30 Days', days: 30 },
  'quarter': { label: 'Last Quarter', days: 90 },
  'ytd': { label: 'Year to Date', days: null },
} as const;
type RangeKey = keyof typeof RANGES;

function withinRange(dateStr: string | null | undefined, range: RangeKey): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  if (range === 'ytd') return date.getFullYear() === now.getFullYear();
  const days = RANGES[range].days as number;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff && date <= now;
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRead[]>([]);
  const [leads, setLeads] = useState<LeadRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState<RangeKey>('30d');
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      campaignService.getAll({ page_size: 100 }),
      leadService.getAll({ page_size: 100 }),
    ])
      .then(([cRes, lRes]) => {
        setCampaigns(cRes?.items ?? []);
        setLeads(lRes?.items ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filteredCampaigns = useMemo(() => campaigns.filter((c) => withinRange(c.start_date ?? c.created_at, range)), [campaigns, range]);
  const filteredLeads = useMemo(() => leads.filter((l) => withinRange(l.created_at, range)), [leads, range]);

  const totalSpend = filteredCampaigns.reduce((sum, c) => sum + (c.spent_amount || 0), 0);
  const totalLeads = filteredLeads.length;
  const cpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

  const performanceData = [
    { name: 'New', leads: filteredLeads.filter((l) => l.status === 'new' || l.status === 'New').length },
    { name: 'Hot', leads: filteredLeads.filter((l) => l.status === 'Hot' || l.priority === 'High').length },
    { name: 'Converted', leads: filteredLeads.filter((l) => l.status === 'converted' || !!l.converted_client_id).length },
    { name: 'Lost', leads: filteredLeads.filter((l) => l.status === 'Lost' || l.status === 'Closed').length },
  ];

  const statusBreakdown = filteredCampaigns.reduce((acc: Record<string, number>, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const handleExport = () => {
    const header = ['Campaign Name', 'Type', 'Budget', 'Spent', 'Status', 'Start Date'];
    const rows = filteredCampaigns.map((c) => [c.name, c.type, c.budget ?? '', c.spent_amount ?? '', c.status, c.start_date ?? '']);
    const csv = [header, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Analytics exported.', 'success');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Performance Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Comprehensive overview of all your active marketing campaigns.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as RangeKey)}
              className="bg-white border border-slate-200 text-slate-700 pl-9 pr-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-[#4C1D95] appearance-none cursor-pointer"
            >
              {Object.entries(RANGES).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 bg-[#4C1D95] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3b1574] transition-colors">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">
          Couldn&apos;t load analytics data. <button onClick={load} className="underline font-medium">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Ad Spend', value: `₹${totalSpend.toLocaleString()}`, icon: BarChart3, color: '#4C1D95' },
          { label: 'Total Leads', value: String(totalLeads), icon: Users, color: '#10B981' },
          { label: 'Cost Per Lead (CPL)', value: `₹${cpl.toLocaleString()}`, icon: TrendingUp, color: '#06B6D4' },
          { label: 'Total Campaigns', value: String(filteredCampaigns.length), icon: MousePointerClick, color: '#EC4899' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500">{kpi.label}</h3>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                <kpi.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{kpi.value}</div>
            <p className="text-xs text-slate-400">{RANGES[range].label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Lead Generation Breakdown</h3>
          <div className="h-[300px] w-full">
            {totalLeads === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No leads in this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="leads" fill="#4C1D95" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Campaigns by Status</h3>
          <div className="h-[300px] w-full">
            {filteredCampaigns.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No campaigns in this period</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={Object.entries(statusBreakdown).map(([name, value]) => ({ name, value }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Campaign Breakdown</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Budget</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Spent</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">No campaigns in this period</td>
                </tr>
              ) : (
                filteredCampaigns.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6 font-medium text-slate-900 text-sm">{row.name}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">{row.type}</td>
                    <td className="py-4 px-6 text-right text-sm text-slate-600">₹{(row.budget || 0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-right text-sm text-slate-600">₹{(row.spent_amount || 0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                        row.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                        row.status === 'Paused' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {row.start_date ? new Date(row.start_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
