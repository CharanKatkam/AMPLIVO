'use client';
import { useEffect, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { campaignService, CampaignRead } from '@/services/campaignService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Filter, MoreHorizontal, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUSES = ['', 'Active', 'Draft', 'Completed', 'Paused'];
const PAGE_SIZE = 12;

export default function PortalCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [detail, setDetail] = useState<CampaignRead | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    campaignService
      .getAll({ page, page_size: PAGE_SIZE, search: search || undefined, status: statusFilter || undefined })
      .then((res) => {
        setCampaigns(res?.items ?? []);
        setTotal(res?.total ?? 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading && campaigns.length === 0) {
    return (
      <div>
        <PortalHeader title="Active Campaigns" subtitle="Monitor your ongoing marketing campaigns." />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Active Campaigns" subtitle="Monitor your ongoing marketing campaigns." />

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">
            Couldn&apos;t load campaigns. <button onClick={load} className="underline font-medium">Retry</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu((o) => !o)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm transition-colors ${statusFilter ? 'border-[#4C1D95] text-[#4C1D95] bg-[#4C1D95]/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter size={16} /> {statusFilter || 'Filter'}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-slate-200 shadow-lg z-10 py-1">
                {STATUSES.map((s) => (
                  <button
                    key={s || 'all'}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${statusFilter === s ? 'text-[#4C1D95] font-semibold' : 'text-slate-600'}`}
                  >
                    {s || 'All statuses'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-400">No campaigns found</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{campaign.name}</h3>
                    <p className="text-xs text-slate-500">{campaign.type}</p>
                  </div>
                  <StatusBadge status={campaign.status} />
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Budget</span>
                    <span className="font-medium text-slate-900">₹{(campaign.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Spent</span>
                    <span className="font-medium text-slate-900">₹{(campaign.spent_amount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {campaign.start_date ? `Started: ${new Date(campaign.start_date).toLocaleDateString()}` : ''}
                  </div>
                  <button onClick={() => setDetail(campaign)} className="p-1.5 text-slate-400 hover:text-[#4C1D95] transition-colors rounded-lg hover:bg-[#4C1D95]/10">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {detail && <CampaignDetailModal campaign={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function CampaignDetailModal({ campaign, onClose }: { campaign: CampaignRead; onClose: () => void }) {
  const [platforms, setPlatforms] = useState<Array<{ id: string; platform_name: string; status: string; budget_allocation: number | null }>>([]);
  const [metrics, setMetrics] = useState<Array<{ id: string; date: string; impressions: number; clicks: number; conversions: number; spend: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      campaignService.getPlatforms(campaign.id).catch(() => []),
      campaignService.getMetrics(campaign.id).catch(() => []),
    ]).then(([p, m]) => {
      setPlatforms(p ?? []);
      setMetrics(m ?? []);
      setLoading(false);
    });
  }, [campaign.id]);

  const totals = metrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + (m.impressions || 0),
      clicks: acc.clicks + (m.clicks || 0),
      conversions: acc.conversions + (m.conversions || 0),
    }),
    { impressions: 0, clicks: 0, conversions: 0 }
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900 text-lg">{campaign.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <StatusBadge status={campaign.status} />
          <span className="text-xs text-slate-400">{campaign.type}</span>
        </div>

        {campaign.description && <p className="text-sm text-slate-600 mb-5">{campaign.description}</p>}

        {loading ? (
          <Loader2 size={20} className="animate-spin text-[#4C1D95] mx-auto my-8" />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{totals.impressions.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Impressions</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{totals.clicks.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Clicks</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-slate-900">{totals.conversions.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Conversions</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-slate-900 mb-2">Platforms</h4>
            {platforms.length === 0 ? (
              <p className="text-xs text-slate-400 mb-4">No platforms configured yet</p>
            ) : (
              <div className="space-y-2 mb-4">
                {platforms.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                    <span className="capitalize text-slate-700">{p.platform_name}</span>
                    <span className="text-xs text-slate-500">{p.status}{p.budget_allocation ? ` · ₹${p.budget_allocation.toLocaleString()}` : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
