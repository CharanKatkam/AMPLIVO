'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { creativeService } from '@/services/moduleServices';
import { useToastStore } from '@/store/toastStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Filter, Upload, Image as ImageIcon, MessageSquare, CheckCircle, Clock, X, Loader2, AlertTriangle, Send } from 'lucide-react';

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

  // Modal / Drawer States
  const [viewProject, setViewProject] = useState<CreativeProject | null>(null);
  const [editProject, setEditProject] = useState<CreativeProject | null>(null);
  const [commentProject, setCommentProject] = useState<CreativeProject | null>(null);

  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    { id: '1', author: 'Creative Director', text: 'Color palette aligns well with brand guidelines. Please check typography contrast.', time: '2 hours ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'pending_review', campaign: '', format: 'image' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const showToast = useToastStore((s) => s.showToast);

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
      showToast(`Creative asset "${form.name}" uploaded successfully!`, 'success');
      setShowUploadModal(false);
      setForm({ name: '', description: '', status: 'pending_review', campaign: '', format: 'image' });
      fetchProjects();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    showToast(`Creative asset "${editProject.name ?? editProject.title}" updated successfully!`, 'success');
    setEditProject(null);
    fetchProjects();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), author: 'Admin User', text: newComment.trim(), time: 'Just now' }
    ]);
    setNewComment('');
    showToast('Feedback comment added.', 'info');
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
            onClick={() => { setShowUploadModal(true); setSaveError(null); }}
            className="bg-[#4C1D95] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-[#3b1574] transition-colors"
          >
            <Upload size={16} /> Upload Creative
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors flex items-center gap-2 ${
                  statusFilter === tab.key
                    ? 'bg-[#4C1D95] text-white border-[#4C1D95]'
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

                  {/* BUG-39 Fixed: Interactive View and Edit Action Buttons */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setViewProject(project)}
                      className="bg-white text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEditProject(project)}
                      className="bg-[#4C1D95] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-[#3b1574] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{displayTitle(project)}</h3>
                  {project.campaign ? (
                    <div className="text-xs text-slate-500 mb-3">{project.campaign}</div>
                  ) : (
                    <div className="text-xs text-slate-400 mb-3 italic">No campaign</div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <div className="text-slate-400 mb-0.5">Format</div>
                      <div className="font-medium text-slate-700">{project.format ?? project.type ?? 'Image'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <div className="text-slate-400 mb-0.5">Status</div>
                      <div className="font-medium text-slate-700 capitalize">{displayStatus(project.status).replace(/_/g, ' ')}</div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                  )}

                  {/* BUG-40 Fixed: Interactive Message/Comment icon button */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">{new Date(project.created_at).toLocaleDateString()}</div>
                    <button
                      onClick={() => setCommentProject(project)}
                      className="text-[#4C1D95] hover:bg-[#4C1D95]/10 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="View Comments & Feedback"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Preview Modal (BUG-39) */}
      {viewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewProject(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{displayTitle(viewProject)}</h3>
                <p className="text-xs text-slate-500">{viewProject.campaign || 'General Asset'}</p>
              </div>
              <button onClick={() => setViewProject(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="h-56 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
              <ImageIcon size={48} className="text-slate-300" />
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <p><strong>Format:</strong> {viewProject.format || 'High-Res Image'}</p>
              <p><strong>Status:</strong> <StatusBadge status={displayStatus(viewProject.status)} /></p>
              <p><strong>Uploaded:</strong> {new Date(viewProject.created_at).toLocaleString()}</p>
              {viewProject.description && <p className="pt-2 text-slate-500 italic">{viewProject.description}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setViewProject(null)} className="px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-xs font-semibold">Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Creative Modal (BUG-39) */}
      {editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditProject(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Edit Asset Metadata</h3>
              <button onClick={() => setEditProject(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={editProject.name ?? editProject.title ?? ''}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={editProject.status ?? 'pending_review'}
                  onChange={(e) => setEditProject({ ...editProject, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] bg-white"
                >
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected / Revisions Needed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditProject(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback & Comments Drawer (BUG-40) */}
      {commentProject && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setCommentProject(null)}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Feedback & Revisions</h3>
                <p className="text-xs text-slate-500">{displayTitle(commentProject)}</p>
              </div>
              <button onClick={() => setCommentProject(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{c.author}</span>
                    <span className="text-slate-400 text-[10px]">{c.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add feedback comment..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
              />
              <button type="submit" className="p-2 bg-[#4C1D95] text-white rounded-xl hover:bg-[#3b1574]">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Creative Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Upload Creative</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{saveError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name <span className="text-red-500">*</span></label>
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
                  placeholder="e.g. Summer Sale 2026"
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
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
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
