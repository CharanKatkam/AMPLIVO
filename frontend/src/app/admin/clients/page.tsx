'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { clientService } from '@/services/crmService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Plus, Filter, MoreHorizontal, Mail, ExternalLink, X, Loader2, Trash2, Pencil, AlertTriangle } from 'lucide-react';

interface ClientRead {
  id: string;
  company_name: string;
  display_name?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  client_type?: string;
  status?: string;
  onboarding_date?: string;
  notes?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

interface ClientListResponse {
  items: ClientRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const CLIENT_TYPES = ['all', 'enterprise', 'smb', 'startup', 'individual'] as const;
const STATUSES = ['all', 'active', 'inactive', 'pending', 'suspended', 'archived'] as const;

export default function AdminClients() {
  const [clients, setClients] = useState<ClientRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRead | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    display_name: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    client_type: '',
    status: 'active',
    onboarding_date: '',
    notes: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page, page_size: pageSize };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.client_type = typeFilter;
      const data: ClientListResponse = await clientService.getAll(params);
      setClients(data.items ?? []);
      setTotalPages(data.total_pages ?? 1);
      setTotal(data.total ?? 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load clients.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const openCreateForm = () => {
    setEditingClient(null);
    setFormData({
      company_name: '',
      display_name: '',
      industry: '',
      website: '',
      email: '',
      phone: '',
      client_type: '',
      status: 'active',
      onboarding_date: '',
      notes: '',
      is_active: true,
    });
    setSubmitError(null);
    setShowForm(true);
  };

  const openEditForm = (client: ClientRead) => {
    setEditingClient(client);
    setFormData({
      company_name: client.company_name,
      display_name: client.display_name ?? '',
      industry: client.industry ?? '',
      website: client.website ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      client_type: client.client_type ?? '',
      status: client.status ?? 'active',
      onboarding_date: client.onboarding_date ?? '',
      notes: client.notes ?? '',
      is_active: client.is_active ?? true,
    });
    setSubmitError(null);
    setShowForm(true);
    setOpenActionId(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      setSubmitError('Company name is required.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
      } else {
        await clientService.create(formData);
      }
      setShowForm(false);
      fetchClients();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save client.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await clientService.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      fetchClients();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete client.';
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div>
      <AdminHeader title="Client Management" subtitle="View and manage all agency clients." />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#4C1D95] cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#4C1D95] cursor-pointer"
            >
              {CLIENT_TYPES.map((t) => (
                <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
            >
              <Plus size={16} /> Add Client
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading clients...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <span className="text-sm text-red-600">{error}</span>
            <button onClick={fetchClients} className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-slate-400">No clients found.</td>
                    </tr>
                  )}
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 shadow-sm">
                            {getInitial(client.company_name)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm mb-0.5">{client.company_name}</div>
                            {client.email && (
                              <a href={`mailto:${client.email}`} className="text-xs text-slate-400 hover:text-[#4C1D95] flex items-center gap-1 transition-colors">
                                <Mail size={10} /> {client.email}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">{client.industry ?? '—'}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={client.is_active === false ? 'Inactive' : (client.status ?? 'Active')} />
                      </td>
                      <td className="py-4 px-6">
                        {client.client_type ? (
                          <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {client.client_type.charAt(0).toUpperCase() + client.client_type.slice(1)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">{formatDate(client.created_at)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end">
                          <div className="relative" data-action-menu>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionId(openActionId === client.id ? null : client.id);
                              }}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openActionId === client.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1">
                                <button
                                  onClick={() => openEditForm(client)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                  <Pencil size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenActionId(null);
                                    setDeleteConfirmId(client.id);
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
              <div>Showing {clients.length} of {total} clients</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="px-6 py-5 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="Acme"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Client Type</label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] cursor-pointer"
                  >
                    <option value="">Select type</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="smb">SMB</option>
                    <option value="startup">Startup</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="info@acme.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="https://acme.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Onboarding Date</label>
                  <input
                    type="date"
                    value={formData.onboarding_date}
                    onChange={(e) => setFormData({ ...formData, onboarding_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-[#4C1D95] focus:ring-[#4C1D95]"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700 font-semibold">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Client</h3>
              <p className="text-sm text-slate-500">Are you sure you want to delete this client? This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
