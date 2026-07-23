'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { socialService } from '@/services/moduleServices';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChevronLeft, ChevronRight, Plus, Filter, Users, Check, Clock, X, Loader2, AlertTriangle } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaFacebook } from 'react-icons/fa';

interface SocialProfile {
  id: string;
  name?: string;
  platform?: string;
  handle?: string;
}

interface SocialPost {
  id: string;
  title?: string;
  content?: string;
  platform?: string;
  client?: string;
  status?: string;
  scheduled_date?: string;
  date?: string;
  type?: string;
}

interface ProfileListResponse {
  items: SocialProfile[];
  total: number;
}

const platformIcon = (platform?: string) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return <FaInstagram size={12} className="text-[#E1306C]" />;
    case 'linkedin': return <FaLinkedin size={12} className="text-[#0A66C2]" />;
    case 'facebook': return <FaFacebook size={12} className="text-[#1877F2]" />;
    default: return <FaInstagram size={12} className="text-slate-400" />;
  }
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminSocialCalendar() {
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', platform: 'Instagram', status: 'draft', scheduled_date: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      const data: ProfileListResponse = await socialService.getProfiles({ page_size: 100 });
      const items = data.items ?? [];
      setProfiles(items);
      if (items.length > 0 && !selectedProfileId) {
        setSelectedProfileId(items[0].id);
      }
    } catch (err: unknown) {
      console.error('Failed to load profiles', err);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!selectedProfileId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await socialService.getPosts(selectedProfileId);
      setPosts(Array.isArray(data) ? data : (data.items ?? []));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load posts.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedProfileId]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedProfileId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await socialService.createPost(selectedProfileId, {
        title: form.title.trim(),
        platform: form.platform,
        status: form.status,
        scheduled_date: form.scheduled_date || undefined,
        content: form.content || undefined,
      });
      setShowModal(false);
      setForm({ title: '', platform: 'Instagram', status: 'draft', scheduled_date: '', content: '' });
      fetchPosts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create post.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const getPostDate = (post: SocialPost): string | null => {
    const raw = post.scheduled_date ?? post.date;
    if (!raw) return null;
    return raw.split('T')[0];
  };

  const approvedCount = posts.filter((p) => p.status?.toLowerCase() === 'approved').length;
  const pendingCount = posts.filter((p) => p.status?.toLowerCase() === 'pending_review' || p.status?.toLowerCase() === 'pending').length;

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  return (
    <div>
      <AdminHeader title="Master Social Calendar" subtitle="Manage content schedules across all clients." />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-2 py-1">
            <Users size={16} className="text-slate-400 ml-2" />
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="bg-transparent border-none text-slate-700 py-1.5 pr-8 text-sm font-medium focus:outline-none focus:ring-0 appearance-none cursor-pointer"
            >
              <option value="">All Profiles</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.handle ?? p.platform ?? `Profile ${p.id}`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowModal(true); setSaveError(null); }}
              className="flex items-center gap-2 bg-[#4C1D95] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
            >
              <Plus size={16} /> New Post
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading calendar...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <span className="text-sm text-red-600">{error}</span>
            <button onClick={fetchPosts} className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-slate-900">{MONTH_NAMES[month]} {year}</h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigateMonth(-1)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"><ChevronLeft size={18} /></button>
                  <button onClick={() => navigateMonth(1)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><Check size={12} /> {approvedCount} Approved</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><Clock size={12} /> {pendingCount} Pending</span>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-[140px] bg-slate-100 gap-px">
              {Array.from({ length: 42 }).map((_, i) => {
                const dayNum = i - firstDay + 1;
                const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
                const dateStr = isCurrentMonth ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : '';

                const dayPosts = isCurrentMonth ? posts.filter((p) => getPostDate(p) === dateStr) : [];

                const today = new Date();
                const isToday = isCurrentMonth && dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <div key={i} className={`bg-white p-2 flex flex-col ${!isCurrentMonth ? 'opacity-40 bg-slate-50' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#4C1D95] text-white' : 'text-slate-700'}`}>
                        {isCurrentMonth ? dayNum : ''}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{dayPosts.length}</span>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {dayPosts.map((post) => (
                        <div key={post.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer hover:border-[#4C1D95] hover:shadow-sm transition-all group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              {platformIcon(post.platform)}
                              {post.client && <span className="text-[10px] font-bold text-slate-700 truncate max-w-[60px]">{post.client}</span>}
                            </div>
                            <StatusBadge status={post.status ?? 'draft'} />
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">{post.title ?? 'Untitled Post'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">New Post</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{saveError}</div>
              )}
              {!selectedProfileId && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
                  Please select a profile first to create a post.
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="e.g. Summer Collection Teaser"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={3}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Write your post content..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !selectedProfileId} className="flex items-center gap-2 px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
