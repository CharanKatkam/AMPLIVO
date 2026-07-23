'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { analyticsService } from '@/services/moduleServices';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Plus, Filter, FileText, Download, Share2, Calendar, LayoutTemplate, X, Loader2, AlertTriangle } from 'lucide-react';

interface Report {
  id: string;
  title?: string;
  name?: string;
  client?: string;
  client_name?: string;
  type?: string;
  report_type?: string;
  status?: string;
  date?: string;
  created_at?: string;
  generated_at?: string;
}

interface ReportListResponse {
  items: Report[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const TEMPLATES = ['Monthly Performance', 'SEO Technical Audit', 'Campaign Wrap-up', 'Custom Blank Report'];

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', client: '', type: 'Monthly Review', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page_size: 100 };
      if (search.trim()) params.search = search.trim();
      const data: ReportListResponse = await analyticsService.getReports(params);
      setReports(data.items ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load reports.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await analyticsService.createReport({
        title: form.title.trim(),
        client: form.client || undefined,
        type: form.type,
        status: form.status,
      });
      setShowModal(false);
      setForm({ title: '', client: '', type: 'Monthly Review', status: 'draft' });
      fetchReports();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create report.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const displayTitle = (r: Report) => r.title ?? r.name ?? 'Untitled Report';
  const displayClient = (r: Report) => r.client ?? r.client_name ?? '—';
  const displayType = (r: Report) => r.type ?? r.report_type ?? '—';
  const displayDate = (r: Report) => {
    const raw = r.date ?? r.created_at ?? r.generated_at;
    if (!raw) return '—';
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div>
      <AdminHeader title="Client Reporting" subtitle="Generate and share automated reports with clients." />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowModal(true); setSaveError(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
            >
              <Plus size={16} /> Create Report
            </button>
          </div>
        </div>

        {/* Templates Section */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-900 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Report Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#4C1D95] hover:shadow-sm transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#4C1D95]/10 group-hover:text-[#4C1D95] transition-colors mb-3">
                  <LayoutTemplate size={20} />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 mb-1">{template}</h3>
                <p className="text-xs text-slate-500">Auto-populates with live data</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Recent Reports</h2>
          </div>

          {loading && (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
              <span className="text-sm text-slate-500">Loading reports...</span>
            </div>
          )}

          {!loading && error && (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <AlertTriangle size={32} className="text-red-400" />
              <span className="text-sm text-red-600">{error}</span>
              <button onClick={fetchReports} className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <FileText size={32} className="text-slate-300" />
              <span className="text-sm text-slate-400">No reports found.</span>
            </div>
          )}

          {!loading && !error && reports.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Name</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date generated</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <FileText size={16} />
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{displayTitle(report)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-700">{displayClient(report)}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                          {displayType(report)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={report.status ?? 'draft'} />
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {displayDate(report)}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-[#4C1D95] hover:bg-[#4C1D95]/10 rounded-lg transition-colors" title="Share via Email">
                            <Share2 size={16} />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-[#4C1D95] hover:bg-[#4C1D95]/10 rounded-lg transition-colors" title="Download PDF">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Create Report</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{saveError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="e.g. July 2024 Performance Report"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Client</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  >
                    <option value="Monthly Review">Monthly Review</option>
                    <option value="SEO Audit">SEO Audit</option>
                    <option value="Campaign Report">Campaign Report</option>
                    <option value="Custom">Custom</option>
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
                    <option value="ready_to_send">Ready to Send</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
