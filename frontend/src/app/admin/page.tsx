'use client';
import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PerformanceChart, LeadSourceChart } from '@/components/charts/Charts';
import { campaignService, leadService, taskService, clientService, userManagementService, financeService } from '@/services';
import { consultationService } from '@/services/moduleServices';
import { Users, Target, Megaphone, CheckSquare, DollarSign, Loader2, CalendarCheck } from 'lucide-react';
import Link from 'next/link';

interface ConsultationRequest {
  id: string;
  name: string;
  email: string;
  company?: string;
  service_interest?: string;
  budget_range?: string;
  status: string;
  created_at: string;
}

interface DashboardData {
  totalActiveCampaigns: number;
  totalLeads: number;
  totalRevenue: number;
  totalUsers: number;
  activeClients: number;
  activeCampaigns: Array<{
    id: string;
    name: string;
    client_id: string;
    type: string;
    status: string;
    spent_amount: number;
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    project_id: string | null;
  }>;
  totalAdSpend: number;
  consultationRequests: ConsultationRequest[];
  revenueTrend: { month: string; revenue: number; adSpend: number }[];
  leadDistribution: { name: string; value: number; color: string }[];
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: '#4C1D95',
  contacted: '#06B6D4',
  qualified: '#10B981',
  proposal: '#F59E0B',
  won: '#22C55E',
  lost: '#EF4444',
};
const LEAD_STATUS_FALLBACK_COLOR = '#94A3B8';

function buildMonthlyTrend(
  invoices: { issue_date?: string; total_amount?: number }[],
  campaigns: { start_date?: string; spent_amount?: number }[]
): { month: string; revenue: number; adSpend: number }[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  const revenueByMonth = new Map<string, number>();
  for (const inv of invoices) {
    if (!inv.issue_date) continue;
    const d = new Date(inv.issue_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + (inv.total_amount ?? 0));
  }
  const spendByMonth = new Map<string, number>();
  for (const c of campaigns) {
    if (!c.start_date) continue;
    const d = new Date(c.start_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    spendByMonth.set(key, (spendByMonth.get(key) ?? 0) + (c.spent_amount ?? 0));
  }
  return months.map(({ key, label }) => ({
    month: label,
    revenue: Math.round(revenueByMonth.get(key) ?? 0),
    adSpend: Math.round(spendByMonth.get(key) ?? 0),
  }));
}

function buildLeadDistribution(leads: { status?: string }[]): { name: string; value: number; color: string }[] {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const status = (lead.status || 'unknown').toLowerCase();
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value,
    color: LEAD_STATUS_COLORS[status] ?? LEAD_STATUS_FALLBACK_COLOR,
  }));
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [campaignsRes, leadsRes, tasksRes, clientsRes, usersRes, invoicesRes, consultationsRes] = await Promise.all([
          campaignService.getAll({ page_size: 100 }),
          leadService.getAll({ page_size: 100 }),
          taskService.getAll({ page_size: 100 }),
          clientService.getAll({ page_size: 100 }),
          userManagementService.getUsers({ page_size: 100 }),
          financeService.getInvoices({ page_size: 100 }),
          consultationService.getAll({ limit: 20 }),
        ]);

        const campaigns = campaignsRes?.items ?? [];
        const leads = leadsRes?.items ?? [];
        const tasks = tasksRes?.items ?? [];
        const clients = clientsRes?.items ?? [];
        const users = usersRes?.items ?? [];
        const invoices = invoicesRes?.items ?? [];
        const consultations: ConsultationRequest[] = Array.isArray(consultationsRes) ? consultationsRes : [];

        const activeCampaigns = campaigns.filter(
          (c: { status: string }) => c.status?.toLowerCase() === 'active'
        );

        const pendingTasks = tasks.filter(
          (t: { status: string }) =>
            t.status?.toLowerCase() === 'in progress' ||
            t.status?.toLowerCase() === 'review' ||
            t.status?.toLowerCase() === 'pending'
        );

        const totalRevenue = invoices.reduce(
          (sum: number, inv: { amount?: number; total?: number; total_amount?: number }) =>
            sum + (inv.total_amount ?? inv.total ?? inv.amount ?? 0),
          0
        );

        const totalAdSpend = activeCampaigns.reduce(
          (sum: number, c: { spent_amount?: number }) => sum + (c.spent_amount ?? 0),
          0
        );

        setData({
          totalActiveCampaigns: activeCampaigns.length,
          totalLeads: leads.length,
          totalRevenue,
          totalUsers: users.length,
          activeClients: clients.length,
          activeCampaigns: activeCampaigns.slice(0, 4),
          pendingTasks: pendingTasks.slice(0, 4),
          totalAdSpend,
          consultationRequests: consultations.slice(0, 5),
          revenueTrend: buildMonthlyTrend(invoices, campaigns),
          leadDistribution: buildLeadDistribution(leads),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminHeader title="Overview" subtitle="Agency Command Center" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-[#4C1D95]" />
            <p className="text-slate-500 text-sm">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminHeader title="Overview" subtitle="Agency Command Center" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <DollarSign size={32} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Something went wrong</h3>
              <p className="text-slate-500 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#4C1D95] text-white rounded-lg text-sm font-semibold hover:bg-[#3B1578] transition-colors"
            >
              Retry
            </button>
          </div>
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
      <AdminHeader title="Overview" subtitle="Agency Command Center" />
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Clients" value={String(data?.activeClients ?? 0)} icon={<Users size={20} />} iconColor="#4C1D95" />
          <StatCard label="Active Campaigns" value={String(data?.totalActiveCampaigns ?? 0)} icon={<Megaphone size={20} />} iconColor="#06B6D4" />
          <StatCard label="Total Leads" value={String(data?.totalLeads ?? 0)} icon={<Target size={20} />} iconColor="#EC4899" />
          <StatCard label="Total Revenue" value={formatCurrency(data?.totalRevenue ?? 0)} icon={<DollarSign size={20} />} iconColor="#10B981" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Revenue & Ad Spend Trend</h3>
              <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none">
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <PerformanceChart data={data?.revenueTrend ?? []} height={250} />
            {(!data || data.revenueTrend.every((m) => m.revenue === 0 && m.adSpend === 0)) && (
              <div className="flex items-center justify-center h-[250px] -mt-[250px]">
                <p className="text-slate-400 text-sm">No campaign data available</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Lead Distribution</h3>
            <LeadSourceChart data={data?.leadDistribution ?? []} height={180} />
            {(!data || data.totalLeads === 0) && (
              <div className="flex items-center justify-center h-[180px] -mt-[180px]">
                <p className="text-slate-400 text-sm">No lead data available</p>
              </div>
            )}
            <div className="mt-6 space-y-3">
              {(data?.leadDistribution ?? []).map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Top Active Campaigns</h3>
              <Link href="/admin/campaigns" className="text-xs font-semibold text-[#4C1D95] hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {(data?.activeCampaigns ?? []).length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No active campaigns yet</p>
                </div>
              ) : (
                (data?.activeCampaigns ?? []).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <Megaphone size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{campaign.name}</h4>
                        <p className="text-xs text-slate-500">{campaign.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={campaign.status} />
                      <div className="text-xs text-slate-500 mt-1">{formatCurrency(campaign.spent_amount)} spent</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">My Priority Tasks</h3>
              <Link href="/admin/tasks" className="text-xs font-semibold text-[#4C1D95] hover:underline">Go to Planner</Link>
            </div>
            <div className="space-y-3">
              {(data?.pendingTasks ?? []).length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No pending tasks</p>
                </div>
              ) : (
                (data?.pendingTasks ?? []).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-[#F9FAFB]">
                    <CheckSquare size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 text-sm truncate">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">{task.priority}</span>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Consultation Requests */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900">Recent Growth Audit Requests</h3>
            <CalendarCheck size={18} className="text-[#4C1D95]" />
          </div>
          <div className="space-y-3">
            {(data?.consultationRequests ?? []).length === 0 ? (
              <div className="text-center py-8">
                <CalendarCheck size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No audit requests yet</p>
              </div>
            ) : (
              (data?.consultationRequests ?? []).map((req) => (
                <div key={req.id} className="flex items-start justify-between p-3 rounded-xl border border-slate-100 bg-[#F9FAFB]">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 text-sm">{req.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{req.email}</p>
                    {req.company && <p className="text-xs text-slate-400">{req.company}</p>}
                    {req.service_interest && <p className="text-xs text-[#4C1D95] font-medium mt-0.5">{req.service_interest}</p>}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      req.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      req.status === 'contacted' ? 'bg-blue-50 text-blue-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>{req.status}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
