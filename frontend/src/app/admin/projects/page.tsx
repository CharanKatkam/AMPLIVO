'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { projectService, clientService, userManagementService } from '@/services/crmService';
import { Search, Plus, LayoutTemplate, Clock, X, Loader2, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  client_name?: string;
  manager_id: string;
  manager_name?: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  progress: number;
  created_at: string;
}

interface Client { id: string; company_name: string; }
interface User { id: string; full_name: string; username: string; }

interface PaginatedResponse {
  items: Project[];
  total: number;
  page: number;
  page_size: number;
}

// API list endpoints paginate as { items: [...] }, not { results: [...] }.
// Normalizes defensively against any shape (array already, { items },
// { results }, { data }, or null/undefined) so a mismatch never leaves a
// non-array in state, which crashes every .map() call on that state.
function toArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

const STATUS_FILTERS = ['All', 'Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled'];
const PAGE_SIZE = 9;

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    client_id: '',
    manager_id: '',
    status: 'Planning',
    start_date: '',
    end_date: '',
    budget: '',
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      const data: PaginatedResponse = await projectService.getAll(params);
      setProjects(toArray<Project>(data));
      setTotalCount(data?.total ?? 0);
    } catch {
      setProjects([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  useEffect(() => {
    if (showModal) {
      Promise.all([
        clientService.getAll({ page_size: 100 }).catch(() => ({ items: [] })),
        userManagementService.getUsers({ page_size: 100 }).catch(() => ({ items: [] })),
      ]).then(([c, u]: any[]) => {
        setClients(toArray<Client>(c));
        setManagers(toArray<User>(u));
      });
    }
  }, [showModal]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const openCreateModal = () => {
    setEditingProject(null);
    setForm({ name: '', description: '', client_id: '', manager_id: '', status: 'Planning', start_date: '', end_date: '', budget: '' });
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      client_id: project.client_id || '',
      manager_id: project.manager_id || '',
      status: project.status,
      start_date: project.start_date ? project.start_date.slice(0, 10) : '',
      end_date: project.end_date ? project.end_date.slice(0, 10) : '',
      budget: project.budget ? String(project.budget) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        status: form.status,
      };
      if (form.client_id) payload.client_id = form.client_id;
      if (form.manager_id) payload.manager_id = form.manager_id;
      if (form.start_date) payload.start_date = form.start_date;
      if (form.end_date) payload.end_date = form.end_date;
      if (form.budget) payload.budget = parseFloat(form.budget);

      if (editingProject) {
        await projectService.update(editingProject.id, payload);
      } else {
        await projectService.create(payload);
      }
      setShowModal(false);
      fetchProjects();
    } catch {
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectService.delete(id);
      setDeleteConfirm(null);
      fetchProjects();
    } catch {
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <AdminHeader title="Project Management" subtitle="Track delivery of website and branding projects." />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#4C1D95]"
            >
              {STATUS_FILTERS.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors">
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">No projects found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4C1D95]/10 flex items-center justify-center text-[#4C1D95]">
                      <LayoutTemplate size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{project.name}</h3>
                      <p className="text-xs text-slate-500">{project.client_name || 'No client'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(project)} className="p-1 text-slate-400 hover:text-[#4C1D95] hover:bg-[#4C1D95]/10 rounded transition-colors" title="Edit">
                      <Pencil size={14} />
                    </button>
                    {deleteConfirm === project.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(project.id)} className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 px-1.5 py-0.5 rounded bg-rose-50">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 px-1.5 py-0.5 rounded bg-slate-100">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(project.id)} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-5 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">Progress</span>
                      <span className="font-bold text-slate-900">{project.progress ?? 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#4C1D95] h-2 rounded-full transition-all" style={{ width: `${project.progress ?? 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock size={14} /> {formatDate(project.end_date)}
                  </div>
                  {project.budget ? (
                    <span className="text-xs font-semibold text-slate-700">₹{project.budget.toLocaleString()}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-slate-500">{totalCount} projects total</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-700">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Project Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Client</label>
                  <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]">
                    <option value="">Select client</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Manager</label>
                  <select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]">
                    <option value="">Select manager</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.full_name || m.username}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]">
                    {['Planning', 'In Progress', 'Review', 'Completed', 'On Hold', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Budget (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 text-sm font-semibold text-white bg-[#4C1D95] rounded-xl hover:bg-[#3b1574] disabled:opacity-50 flex items-center gap-2">
                  {formLoading && <Loader2 size={14} className="animate-spin" />}
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
