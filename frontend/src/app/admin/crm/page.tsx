'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { clientService } from '@/services/crmService';
import { leadService, LeadRead } from '@/services/leadService';
import { Users, Target, TrendingUp, Building2, MoreHorizontal, Loader2, AlertTriangle } from 'lucide-react';

interface ClientRead {
  id: string;
  company_name: string;
  status?: string;
  is_active?: boolean;
  created_at: string;
}

interface ClientListResponse {
  items: ClientRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface LeadListResponse {
  items: LeadRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

const PIPELINE_STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'];

function statusColor(status: string) {
  switch (status) {
    case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Contacted': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Qualified': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Proposal': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Negotiation': return 'bg-orange-50 text-orange-700 border-orange-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function getStageLeads(leads: LeadRead[], stage: string) {
  return leads.filter((l) => {
    const s = l.status?.toLowerCase() ?? '';
    switch (stage) {
      case 'New': return s === 'new' || s === 'cold';
      case 'Contacted': return s === 'contacted';
      case 'Qualified': return s === 'qualified';
      case 'Proposal': return s === 'proposal';
      case 'Negotiation': return s === 'negotiation' || s === 'hot';
      default: return s === stage.toLowerCase();
    }
  });
}

export default function AdminCRM() {
  const [clients, setClients] = useState<ClientRead[]>([]);
  const [leads, setLeads] = useState<LeadRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientData, leadData]: [ClientListResponse, LeadListResponse] = await Promise.all([
        clientService.getAll({ page_size: 100 }),
        leadService.getAll({ page_size: 100 }),
      ]);
      setClients(clientData.items ?? []);
      setLeads(leadData.items ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load CRM data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeClients = clients.filter((c) => c.is_active !== false && (c.status?.toLowerCase() === 'active' || !c.status)).length;
  const pipelineValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  return (
    <div>
      <AdminHeader title="CRM Overview" subtitle="Manage clients, leads, and sales pipeline." />

      <div className="p-6 max-w-7xl mx-auto">
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading CRM data...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <AlertTriangle size={32} className="text-red-400" />
            <span className="text-sm text-red-600">{error}</span>
            <button onClick={fetchData} className="mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Active Clients</h3>
                  <div className="w-8 h-8 rounded-full bg-[#4C1D95]/10 flex items-center justify-center text-[#4C1D95]">
                    <Building2 size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{activeClients}</div>
                <div className="text-sm text-slate-500 font-medium">Across all services</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Total Leads (Pipeline)</h3>
                  <div className="w-8 h-8 rounded-full bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
                    <Users size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{leads.length}</div>
                <div className="text-sm text-slate-500 font-medium">Active in pipeline</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Pipeline Value</h3>
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(pipelineValue)}
                </div>
                <div className="text-sm text-[#10B981] font-medium">estimated pipeline</div>
              </div>
            </div>

            {/* Pipeline Board */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Sales Pipeline</h2>
              <Target size={18} className="text-[#4C1D95]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map((stage) => {
                const stageLeads = getStageLeads(leads, stage);

                return (
                  <div key={stage} className="bg-slate-50 rounded-2xl p-4 min-w-[240px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-700">{stage}</h3>
                      <span className="bg-white border border-slate-200 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageLeads.map((lead) => (
                        <div key={lead.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-[#4C1D95] transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
                          </div>
                          <h4 className="font-semibold text-slate-900 text-sm mb-1">{lead.title}</h4>
                          <p className="text-xs text-slate-500 mb-3">{lead.company_name ?? lead.contact_name ?? '—'}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-700">
                              {lead.estimated_value != null
                                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(lead.estimated_value)
                                : '—'}
                            </span>
                            {lead.assigned_to && (
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200" title={lead.assigned_to}>
                                {lead.assigned_to.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {stageLeads.length === 0 && (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                          <p className="text-xs text-slate-400">No leads in this stage.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
