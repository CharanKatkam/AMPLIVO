'use client';
import { useEffect, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { campaignService, CampaignRead } from '@/services/campaignService';
import { leadService, LeadRead } from '@/services/leadService';
import { notificationService, taskService, financeService, userManagementService } from '@/services/crmService';
import { companyService } from '@/services/portalServices';
import { contentCalendarService, creativeService, seoService } from '@/services/moduleServices';
import { Megaphone, DollarSign, CheckCircle, Users, Bell, CalendarDays, FileText, Image, Search, ClipboardList, Receipt, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export default function PortalDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignRead[]>([]);
  const [leads, setLeads] = useState<LeadRead[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [accountManager, setAccountManager] = useState<{ name: string; title: string } | null>(null);

  const [calendarPosts, setCalendarPosts] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [approvedCreatives, setApprovedCreatives] = useState<any[]>([]);
  const [seoProjects, setSeoProjects] = useState<any[]>([]);
  const [websiteTasks, setWebsiteTasks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignRes, leadRes, notifRes, calendarRes, creativeRes, seoRes, taskRes, invoiceRes] = await Promise.allSettled([
          campaignService.getAll({ page_size: 100 }),
          leadService.getAll({ page_size: 100 }),
          notificationService.getAll({ page_size: 10 }),
          contentCalendarService.getAll({ page_size: 10 }),
          creativeService.getProjects({ page_size: 20 }),
          seoService.getProjects({ page_size: 10 }),
          taskService.getAll({ page_size: 20 }),
          financeService.getInvoices({ page_size: 20 }),
        ]);

        if (campaignRes.status === 'fulfilled') setCampaigns(campaignRes.value?.items ?? []);
        if (leadRes.status === 'fulfilled') setLeads(leadRes.value?.items ?? []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value?.items ?? []);
        if (calendarRes.status === 'fulfilled') setCalendarPosts(calendarRes.value?.items ?? []);
        if (creativeRes.status === 'fulfilled') {
          const all = creativeRes.value?.items ?? creativeRes.value ?? [];
          setPendingApprovals(all.filter((p: any) => p.status === 'pending_review' || p.status === 'Pending Review'));
          setApprovedCreatives(all.filter((p: any) => p.status === 'approved' || p.status === 'Approved'));
        }
        if (seoRes.status === 'fulfilled') setSeoProjects(seoRes.value?.items ?? seoRes.value ?? []);
        if (taskRes.status === 'fulfilled') setWebsiteTasks(taskRes.value?.items ?? []);
        if (invoiceRes.status === 'fulfilled') setInvoices(invoiceRes.value?.items ?? []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }

      try {
        const company = await companyService.getMine();
        if (company.assigned_to) {
          const manager = await userManagementService.getUser(company.assigned_to);
          setAccountManager({ name: manager.full_name ?? manager.name ?? 'Account Manager', title: 'Account Manager' });
        }
      } catch {
        // no account manager assigned
      }
    }
    fetchData();
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === 'Active');
  const hotLeads = leads.filter((l) => l.status === 'Hot' || l.priority === 'High');
  const totalSpend = campaigns.reduce((sum, c) => sum + (c.spent_amount || 0), 0);

  const totalOutstanding = invoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'pending')
    .reduce((sum, inv) => sum + (inv.total_amount || inv.amount || 0), 0);

  if (loading) {
    return (
      <div>
        <PortalHeader title="Dashboard" subtitle="Welcome back" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Dashboard" subtitle="Welcome back" />

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            Some dashboard data couldn&apos;t be loaded. <button onClick={() => window.location.reload()} className="underline font-medium">Retry</button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Campaigns" value={String(activeCampaigns.length)} icon={<Megaphone size={20} />} iconColor="#4C1D95" trend={activeCampaigns.length > 0} trendValue={`+${activeCampaigns.length}`} />
          <StatCard label="Total Leads" value={String(leads.length)} icon={<Users size={20} />} iconColor="#06B6D4" trend={leads.length > 0} trendValue={`+${leads.length}`} />
          <StatCard label="Ad Spend" value={`₹${(totalSpend / 1000).toFixed(1)}K`} icon={<DollarSign size={20} />} iconColor="#EC4899" trend={null} />
          <StatCard label="Hot Leads" value={String(hotLeads.length)} icon={<CheckCircle size={20} />} iconColor="#F59E0B" trend={hotLeads.length > 0} trendValue={`${hotLeads.length}`} />
        </div>

        {/* Campaigns + Account Manager Row */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Campaign Performance</h3>
              <span className="text-xs text-slate-400">All Campaigns</span>
            </div>
            <div className="space-y-3">
              {activeCampaigns.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No active campaigns</p>
              ) : (
                activeCampaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#F9FAFB] border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 text-sm truncate">{campaign.name}</span>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>{campaign.type}</span>
                        <span>Budget: ₹{(campaign.budget || 0).toLocaleString()}</span>
                        <span>Spent: ₹{(campaign.spent_amount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            {accountManager && (
              <div className="bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] rounded-2xl p-5 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-3">Account Manager</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">{accountManager.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold">{accountManager.name}</div>
                    <div className="text-white/70 text-xs">{accountManager.title}</div>
                  </div>
                </div>
                <Link href="/portal/messages" className="w-full text-center block bg-white/15 hover:bg-white/25 transition-colors border border-white/20 text-white text-sm font-medium py-2.5 rounded-xl">
                  Send Message
                </Link>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={15} className="text-slate-700" />
                <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                {notifications.length > 0 && (
                  <span className="ml-auto text-xs bg-[#EC4899] text-white px-1.5 py-0.5 rounded-full">{notifications.length}</span>
                )}
              </div>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map((n, i) => (
                    <div key={n.id || i} className="flex gap-3 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-slate-700">{n.message || n.title || 'Notification'}</p>
                        <p className="text-slate-400 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6 New Widgets — Row 1 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Widget 1 — Content Calendar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[#4C1D95]" />
                <span className="font-semibold text-slate-900 text-sm">Content Calendar</span>
              </div>
              <Link href="/portal/calendar" className="text-xs text-[#4C1D95] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {calendarPosts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No upcoming posts</p>
              ) : (
                calendarPosts.slice(0, 4).map((post: any, i: number) => (
                  <div key={post.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9FAFB]">
                    <div className="w-8 h-8 rounded-lg bg-[#4C1D95]/10 flex items-center justify-center flex-shrink-0">
                      <CalendarDays size={14} className="text-[#4C1D95]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{post.title || post.caption || 'Untitled'}</p>
                      <p className="text-[10px] text-slate-400">
                        {post.scheduled_date ? new Date(post.scheduled_date).toLocaleDateString() : ''}
                        {post.platform ? ` · ${post.platform}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={post.status || 'Draft'} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 2 — Pending Approvals */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#EC4899]" />
                <span className="font-semibold text-slate-900 text-sm">Pending Approvals</span>
                {pendingApprovals.length > 0 && (
                  <span className="text-[10px] bg-[#EC4899] text-white px-1.5 py-0.5 rounded-full font-medium">{pendingApprovals.length}</span>
                )}
              </div>
              <Link href="/portal/creatives" className="text-xs text-[#4C1D95] hover:underline">Review</Link>
            </div>
            <div className="space-y-2">
              {pendingApprovals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No pending approvals</p>
              ) : (
                pendingApprovals.slice(0, 4).map((project: any, i: number) => (
                  <div key={project.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9FAFB]">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{project.name || 'Untitled'}</p>
                      <p className="text-[10px] text-slate-400">{project.campaign_name || project.description?.slice(0, 40) || ''}</p>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">Pending</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 3 — Creative Files */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image size={16} className="text-[#06B6D4]" />
                <span className="font-semibold text-slate-900 text-sm">Creative Files</span>
              </div>
              <Link href="/portal/creatives" className="text-xs text-[#4C1D95] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {approvedCreatives.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No approved creatives</p>
              ) : (
                approvedCreatives.slice(0, 4).map((project: any, i: number) => (
                  <div key={project.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9FAFB]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Image size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{project.name || 'Untitled'}</p>
                      <p className="text-[10px] text-slate-400">{project.campaign_name || project.description?.slice(0, 40) || ''}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">Approved</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 6 New Widgets — Row 2 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Widget 4 — SEO Reports */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-[#10B981]" />
                <span className="font-semibold text-slate-900 text-sm">SEO Reports</span>
              </div>
              <Link href="/portal/seo" className="text-xs text-[#4C1D95] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {seoProjects.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No SEO projects</p>
              ) : (
                seoProjects.slice(0, 4).map((project: any, i: number) => (
                  <div key={project.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9FAFB]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Search size={14} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{project.name || project.title || 'SEO Project'}</p>
                      <p className="text-[10px] text-slate-400">
                        {project.health_score != null ? `Health: ${project.health_score}%` : project.status || ''}
                      </p>
                    </div>
                    <StatusBadge status={project.status || 'Active'} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 5 — Website Tasks */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-[#F59E0B]" />
                <span className="font-semibold text-slate-900 text-sm">Website Tasks</span>
                {websiteTasks.length > 0 && (
                  <span className="text-[10px] bg-[#F59E0B] text-white px-1.5 py-0.5 rounded-full font-medium">{websiteTasks.length}</span>
                )}
              </div>
              <Link href="/portal/projects" className="text-xs text-[#4C1D95] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {websiteTasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No tasks assigned</p>
              ) : (
                websiteTasks.slice(0, 4).map((task: any, i: number) => (
                  <div key={task.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F9FAFB]">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{task.title || task.name || 'Task'}</p>
                      <p className="text-[10px] text-slate-400">
                        {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : ''}
                        {task.project_name ? ` · ${task.project_name}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={task.status || 'Todo'} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Widget 6 — Invoice Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-[#4C1D95]" />
                <span className="font-semibold text-slate-900 text-sm">Invoices</span>
              </div>
              <Link href="/portal/invoices" className="text-xs text-[#4C1D95] hover:underline">View all</Link>
            </div>
            {invoices.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No invoices</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F9FAFB] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>₹{(totalOutstanding / 1000).toFixed(1)}K</p>
                    <p className="text-[10px] text-slate-400">Outstanding</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{invoices.filter((inv: any) => inv.status === 'paid').length}</p>
                    <p className="text-[10px] text-slate-400">Paid</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {invoices.slice(0, 3).map((inv: any, i: number) => (
                    <div key={inv.id || i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate">{inv.invoice_number || `INV-${String(i + 1).padStart(3, '0')}`}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          ₹{(inv.total_amount || inv.amount || 0).toLocaleString()}
                        </span>
                        <StatusBadge status={inv.status || 'pending'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hot Leads Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900">Hot Leads</h3>
            <Link href="/portal/leads" className="text-xs text-[#4C1D95] hover:underline">View all leads</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-400">No hot leads found</td>
                  </tr>
                ) : (
                  hotLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{lead.contact_name || lead.title}</div>
                        <div className="text-xs text-slate-400">{lead.email}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{lead.phone || '-'}</td>
                      <td className="py-3 px-3 text-slate-500">{lead.source_id || '-'}</td>
                      <td className="py-3 px-3"><StatusBadge status={lead.status} /></td>
                      <td className="py-3 px-3 font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {lead.estimated_value != null ? `₹${lead.estimated_value.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
