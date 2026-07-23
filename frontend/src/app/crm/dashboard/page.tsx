'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Users, Building2, FolderKanban, FileText, CreditCard,
  Bell, TrendingUp, Clock, CheckCircle, AlertCircle,
  ArrowUpRight, UserCheck, Activity,
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(0)}K`
    : `₹${n}`;

const StatCard = ({
  label, value, sub, icon: Icon, color, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; href?: string;
}) => {
  const inner = (
    <div className={`bg-[#12141f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {href && <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
};

export default function CrmDashboardPage() {
  const { leads, clients, projects, employees, invoices, payments, notifications, getUnreadCount } = useCrmStore();
  const unread = getUnreadCount();

  const stats = useMemo(() => {
    const readyLeads = leads.filter(l => l.crmStatus === 'Pending Review');
    const activeClients = clients.filter(c => c.status === 'Active' || c.status === 'Onboarding');
    const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Assigned');
    const pendingInvoices = invoices.filter(i => i.crmStatus === 'Sent' || i.crmStatus === 'Payment Pending' || i.crmStatus === 'Overdue');
    const overdueInvoices = invoices.filter(i => i.crmStatus === 'Overdue');
    const verifiedPayments = payments.filter(p => p.status === 'Paid');
    const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
    const unassignedProjects = projects.filter(p => p.status === 'Waiting Assignment');
    const availableEmployees = employees.filter(e => e.availability === 'Available');
    const avgProgress = activeProjects.length
      ? Math.round(activeProjects.reduce((s, p) => s + p.progress, 0) / activeProjects.length)
      : 0;

    return {
      readyLeads: readyLeads.length,
      activeClients: activeClients.length,
      activeProjects: activeProjects.length,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      totalRevenue,
      unassignedProjects: unassignedProjects.length,
      availableEmployees: availableEmployees.length,
      avgProgress,
      totalClients: clients.length,
      totalProjects: projects.length,
    };
  }, [leads, clients, projects, employees, invoices, payments]);

  // Recent activity — last 5 notifications
  const recentActivity = notifications.slice(0, 6);

  // Top 5 active projects by progress
  const topProjects = projects
    .filter(p => p.status === 'In Progress')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  // Employees with high workload
  const busyEmployees = employees
    .sort((a, b) => b.workloadPercent - a.workloadPercent)
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back — here&apos;s your overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {(stats.overdueInvoices > 0 || stats.unassignedProjects > 0 || unread > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-4 text-sm">
            {stats.overdueInvoices > 0 && (
              <Link href="/crm/invoices" className="text-amber-300 hover:underline">
                {stats.overdueInvoices} overdue invoice{stats.overdueInvoices > 1 ? 's' : ''} →
              </Link>
            )}
            {stats.unassignedProjects > 0 && (
              <Link href="/crm/projects" className="text-amber-300 hover:underline">
                {stats.unassignedProjects} project{stats.unassignedProjects > 1 ? 's' : ''} need assignment →
              </Link>
            )}
            {unread > 0 && (
              <Link href="/crm/notifications" className="text-amber-300 hover:underline">
                {unread} unread notification{unread > 1 ? 's' : ''} →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Leads Pending" value={stats.readyLeads} sub="Pending Review" icon={Users} color="bg-violet-600" href="/crm/leads" />
        <StatCard label="Active Clients" value={`${stats.activeClients}/${stats.totalClients}`} sub="Active + Onboarding" icon={Building2} color="bg-emerald-600" href="/crm/clients" />
        <StatCard label="Active Projects" value={`${stats.activeProjects}/${stats.totalProjects}`} sub={`Avg ${stats.avgProgress}% progress`} icon={FolderKanban} color="bg-blue-600" href="/crm/projects" />
        <StatCard label="Total Revenue" value={fmt(stats.totalRevenue)} sub="Verified payments" icon={TrendingUp} color="bg-rose-600" href="/crm/payments" />
        <StatCard label="Pending Invoices" value={stats.pendingInvoices} sub={stats.overdueInvoices > 0 ? `${stats.overdueInvoices} overdue` : 'All on track'} icon={FileText} color="bg-amber-600" href="/crm/invoices" />
        <StatCard label="Unread Notifications" value={unread} sub="Action required" icon={Bell} color="bg-purple-600" href="/crm/notifications" />
        <StatCard label="Available Employees" value={stats.availableEmployees} sub={`of ${employees.length} total`} icon={UserCheck} color="bg-cyan-600" href="/crm/employees" />
        <StatCard label="Needs Assignment" value={stats.unassignedProjects} sub="Projects waiting" icon={Clock} color="bg-orange-600" href="/crm/projects" />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-[#12141f] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Top Active Projects</h2>
            <Link href="/crm/projects" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topProjects.map(p => (
              <Link key={p.id} href={`/crm/projects/${p.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.company}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 hidden sm:block">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-violet-400 w-8 text-right">{p.progress}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Employee Workload */}
        <div className="bg-[#12141f] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Employee Workload</h2>
            <Link href="/crm/employees" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {busyEmployees.map(emp => (
              <div key={emp.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{emp.name}</p>
                  <div className="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        emp.workloadPercent >= 80 ? 'bg-red-500' : emp.workloadPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${emp.workloadPercent}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 w-9 text-right shrink-0">{emp.workloadPercent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#12141f] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            Recent Activity
          </h2>
          <Link href="/crm/notifications" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {recentActivity.map(n => (
            <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${n.read ? 'opacity-60' : 'bg-violet-500/5 border border-violet-500/10'}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-600' : 'bg-violet-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-600">{n.date}</p>
                <p className="text-[10px] text-slate-600">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Invoice Sent', color: 'bg-blue-500', count: invoices.filter(i => i.crmStatus === 'Sent').length },
          { label: 'Payment Pending', color: 'bg-amber-500', count: invoices.filter(i => i.crmStatus === 'Payment Pending').length },
          { label: 'Advance Paid', color: 'bg-emerald-500', count: invoices.filter(i => i.crmStatus === 'Advance Paid').length },
          { label: 'Fully Paid', color: 'bg-violet-500', count: invoices.filter(i => i.crmStatus === 'Fully Paid').length },
        ].map(({ label, color, count }) => (
          <div key={label} className="bg-[#12141f] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
            <div>
              <p className="text-xl font-bold text-white">{count}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
