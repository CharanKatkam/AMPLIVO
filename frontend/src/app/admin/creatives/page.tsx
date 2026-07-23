'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { creativeService } from '@/services/moduleServices';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Filter, Upload, Image as ImageIcon, MessageSquare, CheckCircle, Clock, X, Loader2, AlertTriangle } from 'lucide-react';

interface CreativeProject {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  campaign?: string;
  type?: string;
  format?: string;
  created_at: string;
}

interface ProjectListResponse {
  items: CreativeProject[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const STATUS_TABS = [
  { key: 'all', label: 'All Assets', icon: null },
  { key: 'pending_review', label: 'Pending Review', icon: <Clock size={14} className="text-amber-500" /> },
  { key: 'approved', label: 'Approved', icon: <CheckCircle size={14} className="text-emerald-500" /> },
] as const;

export default function AdminCreatives() {
  const [projects, setProjects] = useState<CreativeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'pending_review', campaign: '', format: 'image' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page_size: 100 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const data: ProjectListResponse = await creativeService.getProjects(params);
      setProjects(data.items ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load creatives.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await creativeService.createProject({
        name: form.name.trim(),
        description: form.description || undefined,
        status: form.status,
        campaign: form.campaign || undefined,
        format: form.format,
      });
      setShowModal(false);
      setForm({ name: '', description: '', status: 'pending_review', campaign: '', format: 'image' });
      fetchProjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const displayTitle = (p: CreativeProject) => p.name ?? p.title ?? 'Untitled';
  const displayStatus = (s?: string) => s ?? 'draft';

  return (
    <div>
      <AdminHeader
        title="Creative Approvals"
        subtitle="Manage creative assets and client approvals"
        actions={
          <button
            onClick={() => { setShowModal(true); setSaveError(null); }}
            className="bg-[#4C1D95] text-white px-4 py-2 rounded-[10px] text-sm font-semibold flex items-center gap-2 hover:bg-[#3b1574] transition-colors"
          >
            <Upload size={16} /> Upload Creative
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center gap-2 ${
                  statusFilter === tab.key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search creatives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading creatives...</span>
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
            <ImageIcon size={32} className="text-slate-300" />
            <span className="text-sm text-slate-400">No creative projects found.</span>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-md transition-shadow group flex flex-col">
                <div className="h-40 bg-slate-100 flex items-center justify-center relative border-b border-slate-100">
                  <ImageIcon size={32} className="text-slate-300" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={displayStatus(project.status)} />
                  </div>
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="bg-white text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50">View</button>
                    <button className="bg-[#4C1D95] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#3b1574]">Edit</button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{displayTitle(project)}</h3>
                  {project.campaign && <div className="text-xs text-slate-500 mb-3">{project.campaign}</div>}
                  {!project.campaign && <div className="text-xs text-slate-400 mb-3 italic">No campaign</div>}

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-slate-50 rounded p-2 border border-slate-100">
                      <div className="text-slate-400 mb-0.5">Format</div>
                      <div className="font-medium text-slate-700">{project.format ?? project.type ?? '—'}</div>
                    </div>
                    <div className="bg-slate-50 rounded p-2 border border-slate-100">
                      <div className="text-slate-400 mb-0.5">Status</div>
                      <div className="font-medium text-slate-700 capitalize">{displayStatus(project.status).replace(/_/g, ' ')}</div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                  )}

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">{new Date(project.created_at).toLocaleDateString()}</div>
                    <button className="text-[#4C1D95] hover:bg-[#4C1D95]/10 p-1.5 rounded-lg transition-colors" title="View Comments">
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Upload Creative</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
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
                  placeholder="e.g. Summer Campaign Banner"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Campaign</label>
                <input
                  type="text"
                  value={form.campaign}
                  onChange={(e) => setForm({ ...form, campaign: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="e.g. Summer Sale 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Describe the creative asset..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="carousel">Carousel</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    <option value="pending_review">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Upload Creative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
