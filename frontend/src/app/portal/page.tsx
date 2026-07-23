'use client';
import { useEffect, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { campaignService, CampaignRead } from '@/services/campaignService';
import { leadService, LeadRead } from '@/services/leadService';
import { notificationService, userManagementService } from '@/services/crmService';
import { companyService } from '@/services/portalServices';
import { Megaphone, DollarSign, CheckCircle, Users, Bell, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [campaignRes, leadRes, notifRes] = await Promise.all([
          campaignService.getAll({ page_size: 100 }),
          leadService.getAll({ page_size: 100 }),
          notificationService.getAll({ page_size: 10 }),
        ]);
        setCampaigns(campaignRes?.items ?? []);
        setLeads(leadRes?.items ?? []);
        setNotifications(notifRes?.items ?? []);
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Campaigns" value={String(activeCampaigns.length)} icon={<Megaphone size={20} />} iconColor="#4C1D95" trend={activeCampaigns.length > 0} trendValue={`+${activeCampaigns.length}`} />
          <StatCard label="Total Leads" value={String(leads.length)} icon={<Users size={20} />} iconColor="#06B6D4" trend={leads.length > 0} trendValue={`+${leads.length}`} />
          <StatCard label="Ad Spend" value={`₹${(totalSpend / 1000).toFixed(1)}K`} icon={<DollarSign size={20} />} iconColor="#EC4899" trend={null} />
          <StatCard label="Hot Leads" value={String(hotLeads.length)} icon={<CheckCircle size={20} />} iconColor="#F59E0B" trend={hotLeads.length > 0} trendValue={`${hotLeads.length}`} />
        </div>

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
