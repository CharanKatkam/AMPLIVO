'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { campaignService, CampaignRead, CampaignCreatePayload } from '@/services';
import { Search, Plus, MoreHorizontal, TrendingUp, DollarSign, X, Trash2, Pencil, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_TABS = ['All', 'Active', 'Paused', 'Draft', 'Completed', 'Archived'];
const TYPE_OPTIONS = ['All', 'PPC', 'Social Media', 'SEO', 'Email', 'Content', 'Display', 'Influencer'];

const EMPTY_FORM: CampaignCreatePayload = {
  name: '',
  client_id: '',
  type: 'PPC',
  status: 'Draft',
  start_date: '',
  end_date: '',
  budget: undefined,
  description: '',
  manager_id: '',
  target_audience: '',
};

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignRead | null>(null);
  const [form, setForm] = useState<CampaignCreatePayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        page_size: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (statusTab !== 'All') params.status = statusTab;
      if (typeFilter !== 'All') params.type = typeFilter;
      const res = await campaignService.getAll(params as any);
      setCampaigns(res.items);
      setTotalPages(res.total_pages);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusTab, typeFilter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    setPage(1);
  }, [search, statusTab, typeFilter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionMenuId && !(e.target as HTMLElement).closest('.action-menu-wrapper')) {
        setActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [actionMenuId]);

  const openCreateModal = () => {
    setEditingCampaign(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (campaign: CampaignRead) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name,
      client_id: campaign.client_id,
      type: campaign.type,
      status: campaign.status,
      start_date: campaign.start_date ?? '',
      end_date: campaign.end_date ?? '',
      budget: campaign.budget ?? undefined,
      description: campaign.description ?? '',
      manager_id: campaign.manager_id ?? '',
      target_audience: campaign.target_audience ?? '',
    });
    setShowModal(true);
    setActionMenuId(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.client_id.trim()) return;
    setSaving(true);
    try {
      if (editingCampaign) {
        await campaignService.update(editingCampaign.id, form);
      } else {
        await campaignService.create(form);
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      console.error('Failed to save campaign', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionMenuId(null);
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await campaignService.delete(id);
      fetchCampaigns();
    } catch (err) {
      console.error('Failed to delete campaign', err);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return '—';
    if (amount >= 10000000) return `\u20B9${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `\u20B9${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `\u20B9${(amount / 1000).toFixed(1)}K`;
    return `\u20B9${amount.toLocaleString()}`;
  };

  const getSpendPercent = (budget: number | null, spent: number) => {
    if (!budget || budget === 0) return null;
    return Math.round((spent / budget) * 100);
  };

  return (
    <div>
      <AdminHeader
        title="Campaigns Management"
        subtitle="Manage client campaigns, budgets, and performance"
        actions={
          <button
            onClick={openCreateModal}
            className="bg-[#4C1D95] text-white px-4 py-2 rounded-[10px] text-sm font-semibold flex items-center gap-2 hover:bg-[#3b1574] transition-colors"
          >
            <Plus size={16} /> New Campaign
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#4C1D95]"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
              ))}
            </select>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
            >
              <Plus size={16} /> New Campaign
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                statusTab === tab
                  ? 'bg-[#4C1D95] text-white border-[#4C1D95]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F9FAFB]">
                  <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Campaign</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Client / Type</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Budget</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Spent</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Dates</th>
                  <th className="py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm">Loading campaigns...</span>
                      </div>
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => {
                    const spendPct = getSpendPercent(campaign.budget, campaign.spent_amount);
                    return (
                      <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-sm">{campaign.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">ID: {campaign.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-700 text-sm">{campaign.client_id}</div>
                          <div className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded inline-block mt-1">
                            {campaign.type}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            campaign.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            campaign.status === 'Paused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            campaign.status === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            campaign.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-medium text-slate-900 text-sm">{formatCurrency(campaign.budget)}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-medium text-slate-700 text-sm">{formatCurrency(campaign.spent_amount)}</div>
                          {spendPct !== null && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{spendPct}% of budget</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-slate-600">
                            {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : '—'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            to {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="relative action-menu-wrapper inline-block">
                            <button
                              onClick={() => setActionMenuId(actionMenuId === campaign.id ? null : campaign.id)}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {actionMenuId === campaign.id && (
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                                <button
                                  onClick={() => openEditModal(campaign)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Pencil size={13} className="text-slate-400" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(campaign.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-[#F9FAFB]">
            <div>Showing {campaigns.length} of {total} campaigns</div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Campaign Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="e.g. Summer Sale 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Client ID *</label>
                <input
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="Client identifier"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select
                    value={form.type ?? 'PPC'}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    {TYPE_OPTIONS.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={form.status ?? 'Draft'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    {STATUS_TABS.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date ?? ''}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.end_date ?? ''}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Budget</label>
                  <input
                    type="number"
                    value={form.budget ?? ''}
                    onChange={(e) => setForm({ ...form, budget: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Manager ID</label>
                  <input
                    value={form.manager_id ?? ''}
                    onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="Manager identifier"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Audience</label>
                <input
                  value={form.target_audience ?? ''}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="e.g. 18-35 age group, urban areas"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Campaign description..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.client_id.trim()}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#4C1D95] rounded-xl hover:bg-[#3b1574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingCampaign ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
