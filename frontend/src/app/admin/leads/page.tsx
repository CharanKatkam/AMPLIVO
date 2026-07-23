'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { leadService, LeadRead, LeadCreatePayload } from '@/services/leadService';
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, X, Trash2, Pencil, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const STATUS_TABS = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Urgent'];
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'estimated_value', label: 'Value' },
  { value: 'title', label: 'Title' },
];

function statusColor(status: string) {
  switch (status) {
    case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Contacted': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Qualified': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Proposal': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Negotiation': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Converted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Lost': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case 'Low': return 'text-slate-500';
    case 'Medium': return 'text-amber-600';
    case 'High': return 'text-orange-600';
    case 'Urgent': return 'text-rose-600';
    default: return 'text-slate-500';
  }
}

const EMPTY_FORM: LeadCreatePayload = {
  title: '',
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  status: 'New',
  priority: 'Medium',
  estimated_value: undefined,
  assigned_to: '',
  notes: '',
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<LeadRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadRead | null>(null);
  const [form, setForm] = useState<LeadCreatePayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (statusTab !== 'All') params.status = statusTab;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      const res = await leadService.getAll(params as any);
      setLeads(res.items);
      setTotalPages(res.total_pages);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusTab, priorityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [search, statusTab, priorityFilter]);

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
    setEditingLead(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (lead: LeadRead) => {
    setEditingLead(lead);
    setForm({
      title: lead.title,
      company_name: lead.company_name ?? '',
      contact_name: lead.contact_name ?? '',
      email: lead.email ?? '',
      phone: lead.phone ?? '',
      status: lead.status,
      priority: lead.priority,
      estimated_value: lead.estimated_value ?? undefined,
      assigned_to: lead.assigned_to ?? '',
      notes: lead.notes ?? '',
    });
    setShowModal(true);
    setActionMenuId(null);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingLead) {
        await leadService.update(editingLead.id, form);
      } else {
        await leadService.create(form);
      }
      setShowModal(false);
      fetchLeads();
    } catch (err) {
      console.error('Failed to save lead', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionMenuId(null);
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadService.delete(id);
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead', err);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div>
      <AdminHeader title="Lead Management" subtitle="Track and convert inbound leads across all client campaigns." />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, email..."
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#4C1D95]"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#4C1D95]"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              onClick={toggleSortOrder}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
            >
              <Plus size={16} /> Add Lead
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

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Info</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Priority</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm">Loading leads...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-sm mb-0.5">{lead.title}</div>
                        <div className="text-xs text-slate-500">{lead.company_name || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          {lead.contact_name && (
                            <span className="text-xs text-slate-700 font-medium">{lead.contact_name}</span>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="text-xs text-slate-600 flex items-center gap-1.5 hover:text-[#4C1D95] transition-colors">
                              <Mail size={12} className="text-slate-400" /> {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="text-xs text-slate-600 flex items-center gap-1.5 hover:text-[#4C1D95] transition-colors">
                              <Phone size={12} className="text-slate-400" /> {lead.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border w-fit ${statusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${priorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900 text-sm">
                        {lead.estimated_value != null ? `$${lead.estimated_value.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {lead.assigned_to ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-white shadow-sm">
                                {lead.assigned_to.charAt(0)}
                              </div>
                              <span className="text-xs font-medium text-slate-700">{lead.assigned_to}</span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="relative action-menu-wrapper inline-block">
                          <button
                            onClick={() => setActionMenuId(actionMenuId === lead.id ? null : lead.id)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {actionMenuId === lead.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                              <button
                                onClick={() => openEditModal(lead)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Pencil size={13} className="text-slate-400" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(lead.id)}
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

          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <div>Showing {leads.length} of {total} leads</div>
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
              <h2 className="text-lg font-bold text-slate-900">{editingLead ? 'Edit Lead' : 'Add Lead'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="e.g. Website Redesign Inquiry"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Name</label>
                  <input
                    value={form.contact_name ?? ''}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                  <input
                    value={form.company_name ?? ''}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email ?? ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone ?? ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={form.status ?? 'New'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    {STATUS_TABS.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                  <select
                    value={form.priority ?? 'Medium'}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    {PRIORITY_OPTIONS.filter((p) => p !== 'All').map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={form.estimated_value ?? ''}
                    onChange={(e) => setForm({ ...form, estimated_value: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned To</label>
                  <input
                    value={form.assigned_to ?? ''}
                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="Team member"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Additional notes..."
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
                disabled={saving || !form.title.trim()}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#4C1D95] rounded-xl hover:bg-[#3b1574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingLead ? 'Save Changes' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
