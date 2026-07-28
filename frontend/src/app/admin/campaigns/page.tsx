'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { campaignService, CampaignRead, CampaignCreatePayload } from '@/services';
import { clientService, userManagementService } from '@/services/crmService';
import { useToastStore } from '@/store/toastStore';
import { Search, Plus, MoreHorizontal, TrendingUp, DollarSign, X, Trash2, Pencil, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface ClientOption { id: string; company_name: string; }
interface UserOption { id: string; full_name?: string; name?: string; email?: string; }

const STATUS_TABS = ['All', 'Active', 'Paused', 'Draft', 'Completed', 'Archived'];
const TYPE_OPTIONS = ['PPC', 'Social Media', 'SEO', 'Email', 'Content', 'Display', 'Influencer'];

const EMPTY_FORM: CampaignCreatePayload = {
  name: '',
  client_id: '',
  type: '',
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
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [managers, setManagers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignRead | null>(null);
  const [form, setForm] = useState<CampaignCreatePayload>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<CampaignCreatePayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const showToast = useToastStore((s) => s.showToast);

  const clientMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => map.set(c.id, c.company_name));
    return map;
  }, [clients]);

  const fetchDependencies = useCallback(async () => {
    try {
      const [cRes, uRes]: any[] = await Promise.all([
        clientService.getAll({ page_size: 100 }).catch(() => ({ items: [] })),
        userManagementService.getUsers({ page_size: 100 }).catch(() => ({ items: [] })),
      ]);
      setClients(cRes?.items ?? []);
      setManagers(uRes?.items ?? uRes ?? []);
    } catch {
      // ignore
    }
  }, []);

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
      setCampaigns(res.items ?? []);
      setTotalCount(res.total ?? (res.items ?? []).length);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
      setCampaigns([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusTab, typeFilter]);

  useEffect(() => {
    fetchDependencies();
    fetchCampaigns();
  }, [fetchDependencies, fetchCampaigns]);

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

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const openCreateModal = () => {
    setEditingCampaign(null);
    setForm(EMPTY_FORM);
    setInitialForm(EMPTY_FORM);
    setValidationErrors({});
    setShowModal(true);
  };

  const openEditModal = (campaign: CampaignRead) => {
    setEditingCampaign(campaign);
    const loaded: CampaignCreatePayload = {
      name: campaign.name,
      client_id: campaign.client_id,
      type: campaign.type,
      status: campaign.status,
      start_date: campaign.start_date ? campaign.start_date.slice(0, 10) : '',
      end_date: campaign.end_date ? campaign.end_date.slice(0, 10) : '',
      budget: campaign.budget ?? undefined,
      description: campaign.description ?? '',
      manager_id: campaign.manager_id ?? '',
      target_audience: campaign.target_audience ?? '',
    };
    setForm(loaded);
    setInitialForm(loaded);
    setValidationErrors({});
    setShowModal(true);
    setActionMenuId(null);
  };

  const attemptCloseModal = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      setShowModal(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Campaign name is required.';
    if (!form.client_id.trim()) errors.client_id = 'Client selection is required.';
    if (!form.type) errors.type = 'Campaign type is required.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingCampaign) {
        await campaignService.update(editingCampaign.id, form);
        showToast(`Campaign "${form.name}" updated successfully!`, 'success');
      } else {
        await campaignService.create(form);
        showToast(`Campaign "${form.name}" created successfully!`, 'success');
      }
      setShowModal(false);
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save campaign.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setActionMenuId(null);
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;
    try {
      await campaignService.delete(id);
      showToast(`Campaign "${name}" deleted successfully.`, 'success');
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete campaign.';
      showToast(msg, 'error');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return '—';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString()}`;
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
            className="bg-[#4C1D95] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#3b1574] transition-colors"
          >
            <Plus size={16} /> New Campaign
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Filter Toolbar (BUG-25: Duplicate button removed from toolbar) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#4C1D95]"
            >
              <option value="All">All Types</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
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
                    const clientName = clientMap.get(campaign.client_id) || campaign.client_id;

                    return (
                      <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 text-sm truncate">{campaign.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5 font-mono">ID: {campaign.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          {/* BUG-26 & BUG-27: Truncate Client Name and show human readable string */}
                          <div className="font-medium text-slate-700 text-sm truncate" title={clientName}>
                            {clientName}
                          </div>
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
                                  onClick={() => handleDelete(campaign.id, campaign.name)}
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

          {/* Pagination (BUG-30 fixed) */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-[#F9FAFB]">
            <div>Showing {campaigns.length} of {totalCount} campaigns</div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={attemptCloseModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Campaign Name <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#4C1D95] ${
                    validationErrors.name ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                  }`}
                  placeholder="e.g. Summer Sale 2026"
                />
                {validationErrors.name && <p className="text-red-500 text-[11px] mt-1">{validationErrors.name}</p>}
              </div>

              {/* BUG-29: Replace text input with searchable Client Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Client <span className="text-red-500">*</span></label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#4C1D95] bg-white ${
                    validationErrors.client_id ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                  }`}
                >
                  <option value="">Select Client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
                {validationErrors.client_id && <p className="text-red-500 text-[11px] mt-1">{validationErrors.client_id}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* BUG-28: Type field defaults to prompt state requiring selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#4C1D95] bg-white ${
                      validationErrors.type ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                    }`}
                  >
                    <option value="">Select Campaign Type...</option>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {validationErrors.type && <p className="text-red-500 text-[11px] mt-1">{validationErrors.type}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={form.status ?? 'Draft'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] bg-white"
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={form.budget ?? ''}
                    onChange={(e) => setForm({ ...form, budget: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="0"
                  />
                </div>
                {/* BUG-29: Replace Manager ID text input with Manager Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Manager</label>
                  <select
                    value={form.manager_id ?? ''}
                    onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] bg-white"
                  >
                    <option value="">Select Manager...</option>
                    {managers.map((m) => {
                      const name = m.full_name || m.name || m.email || m.id;
                      return <option key={m.id} value={m.id}>{name}</option>;
                    })}
                  </select>
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

            {/* BUG-31: Disabled Save Changes when form is pristine */}
            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-slate-200">
              <button
                onClick={attemptCloseModal}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#4C1D95] rounded-xl hover:bg-[#3b1574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingCampaign ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Changes Guard Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle size={24} />
              <h3 className="font-bold text-slate-900 text-base">Unsaved Changes</h3>
            </div>
            <p className="text-xs text-slate-600">You have unsaved modifications to this campaign. Are you sure you want to discard them?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Keep Editing
              </button>
              <button
                onClick={() => { setShowDiscardConfirm(false); setShowModal(false); }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
