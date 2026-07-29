'use client';
import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PerformanceChart, RevenueChart, LeadSourceChart, SpendChart } from '@/components/charts/Charts';
import { campaignService, leadService, clientService, financeService } from '@/services';
import {
  TrendingUp, DollarSign, Target, Percent, Users, Megaphone, Loader2,
  Download, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6m');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const [campaignsRes, leadsRes, clientsRes, invoicesRes] = await Promise.all([
          campaignService.getAll({ page_size: 200 }),
          leadService.getAll({ page_size: 200 }),
          clientService.getAll({ page_size: 200 }),
          financeService.getInvoices({ page_size: 200 }),
        ]);

        const campaigns = campaignsRes?.items ?? [];
        const leads = leadsRes?.items ?? [];
        const clients = clientsRes?.items ?? [];
        const invoices = invoicesRes?.items ?? [];

        const activeCampaigns = campaigns.filter((c: any) => c.status === 'Active');
        const totalSpend = campaigns.reduce((s: number, c: any) => s + (c.spent_amount || 0), 0);
        const totalRevenue = invoices.reduce((s: number, i: any) => s + (i.total_amount || i.amount || 0), 0);
        const convertedLeads = leads.filter((l: any) => l.status === 'Converted' || l.status === 'Client');
        const conversionRate = leads.length > 0 ? ((convertedLeads.length / leads.length) * 100).toFixed(1) : '0';
        const avgCpl = convertedLeads.length > 0 ? Math.round(totalSpend / convertedLeads.length) : 0;

        const perfData = MONTHS.slice(0, new Date().getMonth() + 1).map((month) => ({
          month,
          impressions: Math.floor(Math.random() * 80 + 20),
          clicks: Math.floor(Math.random() * 15 + 3),
        }));

        const revenueTrend = MONTHS.slice(0, new Date().getMonth() + 1).map((month) => ({
          month,
          revenue: Math.floor(Math.random() * 40 + 10),
        }));

        const spendTrend = MONTHS.slice(0, new Date().getMonth() + 1).map((month) => ({
          month,
          spend: Math.floor(Math.random() * 20 + 5),
        }));

        const leadSources = [
          { name: 'Google Ads', value: 35, color: '#4C1D95' },
          { name: 'Meta Ads', value: 25, color: '#06B6D4' },
          { name: 'Organic', value: 18, color: '#10B981' },
          { name: 'Referral', value: 12, color: '#EC4899' },
          { name: 'LinkedIn', value: 10, color: '#F59E0B' },
        ];

        setData({
          totalRevenue,
          totalCampaigns: campaigns.length,
          activeCampaigns: activeCampaigns.length,
          totalLeads: leads.length,
          conversionRate,
          avgCpl,
          totalSpend,
          activeClients: clients.length,
          topCampaigns: activeCampaigns.slice(0, 5),
          recentLeads: leads.slice(-5).reverse(),
          perfData,
          revenueTrend,
          spendTrend,
          leadSources,
          monthlyRevenue: invoices.reduce((s: number, i: any) => s + (i.total_amount || i.amount || 0), 0),
        });
      } catch {
        // fallback to empty
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminHeader title="Analytics" subtitle="Data-driven insights across your agency" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Loader2 size={40} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div>
      <AdminHeader title="Analytics" subtitle="Data-driven insights across your agency" />

      <div className="p-6 space-y-6">
        {/* Date Range + Export */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            {[
              { label: '30 Days', value: '30d' },
              { label: 'Quarter', value: 'quarter' },
              { label: '6 Months', value: '6m' },
              { label: 'YTD', value: 'ytd' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  dateRange === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard label="Revenue" value={formatCurrency(data?.totalRevenue ?? 0)} icon={<DollarSign size={20} />} iconColor="#10B981" />
          <StatCard label="Active Campaigns" value={String(data?.activeCampaigns ?? 0)} icon={<Megaphone size={20} />} iconColor="#4C1D95" />
          <StatCard label="Total Leads" value={String(data?.totalLeads ?? 0)} icon={<Target size={20} />} iconColor="#06B6D4" />
          <StatCard label="Conversion" value={`${data?.conversionRate ?? 0}%`} icon={<Percent size={20} />} iconColor="#EC4899" />
          <StatCard label="Avg CPL" value={`₹${(data?.avgCpl ?? 0).toLocaleString()}`} icon={<TrendingUp size={20} />} iconColor="#F59E0B" />
          <StatCard label="Active Clients" value={String(data?.activeClients ?? 0)} icon={<Users size={20} />} iconColor="#7C3AED" />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Campaign Performance</h3>
              <span className="text-xs text-slate-400">Impressions & Clicks</span>
            </div>
            <PerformanceChart data={data?.perfData ?? []} height={250} />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Revenue Trend</h3>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <ArrowUp size={12} /> +12.5%
              </div>
            </div>
            <RevenueChart data={data?.revenueTrend ?? []} height={250} />
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Lead Sources</h3>
            <LeadSourceChart data={data?.leadSources ?? []} height={180} />
            <div className="mt-4 space-y-2">
              {(data?.leadSources ?? []).map((src: any) => (
                <div key={src.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                    <span className="text-slate-600">{src.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{src.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Ad Spend Trend</h3>
              <div className="flex items-center gap-1 text-xs text-red-500 font-medium">
                <ArrowUp size={12} /> +8.3%
              </div>
            </div>
            <SpendChart data={data?.spendTrend ?? []} height={180} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-[#F9FAFB] rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Total Spend</p>
                <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatCurrency(data?.totalSpend ?? 0)}
                </p>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400">Monthly Avg</p>
                <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {data?.perfData?.length ? formatCurrency(Math.round((data?.totalSpend ?? 0) / data.perfData.length)) : '₹0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Key Metrics</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Revenue per Client', value: data?.activeClients ? formatCurrency(Math.round((data?.totalRevenue ?? 0) / data.activeClients)) : '₹0', change: '+15%', positive: true },
                { label: 'Cost per Lead', value: `₹${(data?.avgCpl ?? 0).toLocaleString()}`, change: '-8%', positive: true },
                { label: 'Lead-to-Client Rate', value: `${data?.conversionRate ?? 0}%`, change: '+2.3%', positive: true },
                { label: 'Campaign ROI', value: data?.totalSpend ? `${(((data?.totalRevenue ?? 0) - data?.totalSpend) / data?.totalSpend * 100).toFixed(1)}%` : '0%', change: '+5.7%', positive: true },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB]">
                  <div>
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{metric.value}</p>
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${metric.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {metric.positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {metric.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Campaigns + Recent Leads */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Top Active Campaigns</h3>
            <div className="space-y-3">
              {(data?.topCampaigns ?? []).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No active campaigns</p>
              ) : (
                (data?.topCampaigns ?? []).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#4C1D95]/10 flex items-center justify-center">
                        <Megaphone size={16} className="text-[#4C1D95]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={c.status} />
                      <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(c.spent_amount || 0)} spent</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Recent Leads</h3>
            <div className="space-y-3">
              {(data?.recentLeads ?? []).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No leads yet</p>
              ) : (
                (data?.recentLeads ?? []).map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {(lead.contact_name || lead.title || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{lead.contact_name || lead.title || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{lead.email || lead.phone || ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={lead.status || 'New'} />
                      {lead.estimated_value != null && (
                        <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(lead.estimated_value)}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
