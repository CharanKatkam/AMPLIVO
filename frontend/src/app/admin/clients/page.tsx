'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { clientService } from '@/services/crmService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useToastStore } from '@/store/toastStore';
import {
  Search, Plus, Filter, MoreHorizontal, Mail, ExternalLink, X, Loader2, Trash2, Pencil, AlertTriangle, AlertCircle
} from 'lucide-react';

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

const EMPTY_FORM = {
  company_name: '',
  display_name: '',
  industry: '',
  website: '',
  email: '',
  phone: '',
  client_type: 'smb',
  status: 'active',
  onboarding_date: '',
  notes: '',
};

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
  const pageSize = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRead | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [initialFormData, setInitialFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const showToast = useToastStore((s) => s.showToast);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page, page_size: pageSize };
      if (search.trim()) params.search = search.trim();
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

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const openCreateForm = () => {
    setEditingClient(null);
    setFormData(EMPTY_FORM);
    setInitialFormData(EMPTY_FORM);
    setValidationErrors({});
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (client: ClientRead) => {
    setEditingClient(client);
    const loaded = {
      company_name: client.company_name,
      display_name: client.display_name ?? '',
      industry: client.industry ?? '',
      website: client.website ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      client_type: client.client_type ?? 'smb',
      status: client.status ?? 'active',
      onboarding_date: client.onboarding_date ? client.onboarding_date.slice(0, 10) : '',
      notes: client.notes ?? '',
    };
    setFormData(loaded);
    setInitialFormData(loaded);
    setValidationErrors({});
    setFormError(null);
    setShowForm(true);
    setOpenActionId(null);
  };

  const attemptCloseModal = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      setShowForm(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.company_name.trim()) errors.company_name = 'Company name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Invalid email address format.';
    }
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone number is required.';
    }
    if (formData.website?.trim() && !/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/.*)?$/i.test(formData.website.trim())) {
      errors.website = 'Invalid website URL format.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      // AMP-012: Sanitize empty optional fields to avoid backend 422 errors
      const sanitized: Record<string, unknown> = { company_name: formData.company_name.trim() };
      if (formData.display_name?.trim()) sanitized.display_name = formData.display_name.trim();
      if (formData.industry?.trim()) sanitized.industry = formData.industry.trim();
      if (formData.website?.trim()) sanitized.website = formData.website.trim();
      if (formData.email?.trim()) sanitized.email = formData.email.trim();
      if (formData.phone?.trim()) sanitized.phone = formData.phone.trim();
      if (formData.client_type) sanitized.client_type = formData.client_type;
      if (formData.status) sanitized.status = formData.status;
      if (formData.onboarding_date?.trim()) sanitized.onboarding_date = formData.onboarding_date;
      if (formData.notes?.trim()) sanitized.notes = formData.notes.trim();
      sanitized.is_active = formData.status !== 'inactive' && formData.status !== 'suspended' && formData.status !== 'archived';

      if (editingClient) {
        await clientService.update(editingClient.id, sanitized);
        showToast(`Client "${formData.company_name}" updated successfully!`, 'success');
      } else {
        await clientService.create(sanitized as Parameters<typeof clientService.create>[0]);
        showToast(`Client "${formData.company_name}" created successfully!`, 'success');
      }
      setShowForm(false);
      fetchClients();
    } catch (err: any) {
      // AMP-012: Parse 422 validation errors from backend
      if (err?.response?.status === 422) {
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          const fieldErrors: Record<string, string> = {};
          detail.forEach((d: { loc?: string[]; msg?: string }) => {
            const field = d.loc?.[d.loc.length - 1];
            if (field) fieldErrors[field] = d.msg ?? 'Invalid value.';
          });
          if (Object.keys(fieldErrors).length > 0) {
            setValidationErrors((prev) => ({ ...prev, ...fieldErrors }));
          }
          setFormError('Please fix the highlighted fields and try again.');
        } else {
          setFormError(typeof detail === 'string' ? detail : 'Validation error. Please check the form fields.');
        }
      } else {
        const message = err instanceof Error ? err.message : 'Failed to save client.';
        setFormError(message);
        showToast(message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await clientService.delete(deleteConfirmId);
      showToast('Client deleted successfully.', 'success');
      setDeleteConfirmId(null);
      fetchClients();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete client.';
      showToast(message, 'error');
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

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#4C1D95] cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#4C1D95] cursor-pointer"
            >
              {CLIENT_TYPES.map((t) => (
                <option key={t} value={t}>{t === 'all' ? 'All Types' : t.toUpperCase()}</option>
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

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading clients...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <span className="text-sm text-red-600">{error}</span>
            <button onClick={fetchClients} className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company / Display</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry & Type</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Onboarding</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                        No clients found.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#4C1D95]/10 text-[#4C1D95] font-bold text-sm flex items-center justify-center border border-[#4C1D95]/20">
                              {getInitial(client.company_name)}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm mb-0.5">{client.company_name}</div>
                              {client.display_name && <div className="text-xs text-slate-500">{client.display_name}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 text-xs">
                            {client.email && (
                              <a href={`mailto:${client.email}`} className="text-slate-600 flex items-center gap-1.5 hover:text-[#4C1D95]">
                                <Mail size={12} className="text-slate-400" /> {client.email}
                              </a>
                            )}
                            {client.phone && (
                              <div className="text-slate-600 flex items-center gap-1.5">
                                <span className="font-mono text-slate-500">{client.phone}</span>
                              </div>
                            )}
                            {client.website && (
                              <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noreferrer" className="text-[#4C1D95] flex items-center gap-1 hover:underline">
                                {client.website} <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-slate-700">{client.industry || 'General'}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-fit">
                              {client.client_type || 'SMB'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={client.status || 'active'} />
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {client.onboarding_date ? formatDate(client.onboarding_date) : '—'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="relative inline-block" data-action-menu>
                            <button
                              onClick={() => setOpenActionId(openActionId === client.id ? null : client.id)}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openActionId === client.id && (
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                                <button
                                  onClick={() => openEditForm(client)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Pencil size={13} className="text-slate-400" /> Edit
                                </button>
                                <button
                                  onClick={() => { setOpenActionId(null); setDeleteConfirmId(client.id); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
              <div>Showing {clients.length} of {total} clients</div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Client Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <button onClick={attemptCloseModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* AMP-012: Global form error banner */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 font-medium flex items-start gap-2">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Company Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#4C1D95] ${
                    validationErrors.company_name ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                  }`}
                  placeholder="Acme Corp"
                />
                {validationErrors.company_name && <p className="text-red-500 text-[11px] mt-1">{validationErrors.company_name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="Acme"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Client Type</label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] bg-white cursor-pointer"
                  >
                    {CLIENT_TYPES.filter((t) => t !== 'all').map((t) => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] bg-white cursor-pointer"
                  >
                    {STATUSES.filter((s) => s !== 'all').map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#4C1D95] ${
                      validationErrors.email ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                    }`}
                    placeholder="info@acme.com"
                  />
                  {validationErrors.email && <p className="text-red-500 text-[11px] mt-1">{validationErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone <span className="text-red-500">*</span></label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(val) => setFormData({ ...formData, phone: val || '' })}
                    placeholder="+91 9876543210"
                  />
                  {validationErrors.phone && <p className="text-red-500 text-[11px] mt-1">{validationErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:border-[#4C1D95] ${
                    validationErrors.website ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                  }`}
                  placeholder="https://acme.com"
                />
                {validationErrors.website && <p className="text-red-500 text-[11px] mt-1">{validationErrors.website}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Onboarding Date</label>
                <input
                  type="date"
                  value={formData.onboarding_date}
                  onChange={(e) => setFormData({ ...formData, onboarding_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={attemptCloseModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isDirty}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#4C1D95] rounded-xl hover:bg-[#3b1574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unsaved Changes Guard Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle size={24} />
              <h3 className="font-bold text-slate-900 text-base">Discard Unsaved Changes</h3>
            </div>
            <p className="text-xs text-slate-600">You have modified client details. Are you sure you want to discard unsaved client details?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Keep Editing
              </button>
              <button
                onClick={() => { setShowDiscardConfirm(false); setShowForm(false); }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Delete Client</h3>
            <p className="text-xs text-slate-600">Are you sure you want to delete this client? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 flex items-center gap-2"
              >
                {deleting && <Loader2 size={12} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
