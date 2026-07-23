'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { seoService } from '@/services/moduleServices';
import { Search, Plus, Globe, CheckCircle2, AlertCircle, X, Loader2, AlertTriangle } from 'lucide-react';

interface SeoProject {
  id: string;
  name?: string;
  client_name?: string;
  domain?: string;
  status?: string;
  health_score?: number;
  keywords_count?: number;
  traffic_change?: string;
  created_at: string;
}

interface ProjectListResponse {
  items: SeoProject[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const STATUSES = ['all', 'active', 'on_track', 'needs_attention', 'at_risk', 'completed'] as const;

function statusIcon(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'on_track':
    case 'completed':
      return <CheckCircle2 size={18} className="text-emerald-500" />;
    case 'needs_attention':
      return <AlertCircle size={18} className="text-amber-500" />;
    case 'at_risk':
      return <AlertCircle size={18} className="text-rose-500" />;
    default:
      return <CheckCircle2 size={18} className="text-slate-400" />;
  }
}

function statusBadge(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'on_track':
      return 'bg-emerald-50 text-emerald-700';
    case 'needs_attention':
      return 'bg-amber-50 text-amber-700';
    case 'at_risk':
      return 'bg-rose-50 text-rose-700';
    case 'completed':
      return 'bg-blue-50 text-blue-700';
    default:
      return 'bg-slate-50 text-slate-600';
  }
}

export default function AdminSEOProjects() {
  const [projects, setProjects] = useState<SeoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', client_name: '', domain: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page_size: 100 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const data: ProjectListResponse = await seoService.getProjects(params);
      setProjects(data.items ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load SEO projects.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    setSearch('');
    setStatusFilter('all');
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.domain.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await seoService.createProject({
        name: form.name.trim(),
        target_url: form.domain.trim(),
        status: form.status,
      });
      setShowCreateModal(false);
      setForm({ name: '', client_name: '', domain: '', status: 'active' });
      fetchProjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const displayStatus = (s?: string) => {
    if (!s) return '—';
    return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div>
      <AdminHeader title="SEO Projects Overview" subtitle="Monitor technical health, rankings, and traffic for all active SEO clients." />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search domains, clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:border-[#4C1D95] cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'all' ? 'All Status' : displayStatus(s)}</option>
              ))}
            </select>
            <button
              onClick={() => { setShowCreateModal(true); setSaveError(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
            >
              <Plus size={16} /> Add Project
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading SEO projects...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <span className="text-sm text-red-600">{error}</span>
            <button onClick={fetchProjects} className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Globe size={32} className="text-slate-300" />
            <span className="text-sm text-slate-400">No SEO projects found.</span>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-[#4C1D95] hover:shadow-md transition-all flex flex-col cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
                      <Globe size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm truncate max-w-[140px]">{project.name ?? project.client_name ?? 'Unnamed'}</h3>
                      <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{project.domain ?? '—'}</p>
                    </div>
                  </div>
                  {statusIcon(project.status)}
                </div>

                <div className="mb-5 flex-1">
                  {project.health_score != null && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Site Health</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900">{project.health_score}</span>
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full ${project.health_score >= 90 ? 'bg-emerald-500' : project.health_score >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(project.health_score, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {project.health_score == null && (
                    <div className="text-xs text-slate-400">Health data not available</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusBadge(project.status)}`}>
                    {displayStatus(project.status)}
                  </span>
                  {project.client_name && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200" title={project.client_name}>
                      {project.client_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Add SEO Project</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{saveError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="SEO Project Alpha"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Domain</label>
                <input
                  type="text"
                  required
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="acmecorp.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="on_track">On Track</option>
                  <option value="needs_attention">Needs Attention</option>
                  <option value="at_risk">At Risk</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
