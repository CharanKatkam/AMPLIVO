'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { clientService } from '@/services/crmService';
import { leadService, LeadRead } from '@/services/leadService';
import { useToastStore } from '@/store/toastStore';
import {
  Users, Target, TrendingUp, Building2, MoreHorizontal, Loader2, AlertTriangle,
  X, Mail, Phone, Pencil, Trash2, ArrowRight, UserCheck
} from 'lucide-react';

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
}

interface LeadListResponse {
  items: LeadRead[];
  total: number;
}

const PIPELINE_STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

function statusColor(status: string) {
  const normalized = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';
  switch (normalized) {
    case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Contacted': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Qualified': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Proposal': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Negotiation': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Won':
    case 'Closed Won': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Lost':
    case 'Closed Lost': return 'bg-rose-50 text-rose-700 border-rose-200';
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
      case 'Won': return s === 'won' || s === 'closed won';
      case 'Lost': return s === 'lost' || s === 'closed lost';
      default: return s === stage.toLowerCase();
    }
  });
}

function formatCurrency(val: number | null | undefined) {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

export default function AdminCRM() {
  const [clients, setClients] = useState<ClientRead[]>([]);
  const [leads, setLeads] = useState<LeadRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('All');
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Lead details drawer state
  const [selectedLead, setSelectedLead] = useState<LeadRead | null>(null);

  // Context menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [moveStageLead, setMoveStageLead] = useState<LeadRead | null>(null);

  const showToast = useToastStore((s) => s.showToast);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (activeMenuId && !(e.target as HTMLElement).closest('.card-action-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenuId]);

  const handleStageChange = async (lead: LeadRead, newStage: string) => {
    try {
      await leadService.update(lead.id, { status: newStage });
      showToast(`Moved "${lead.title}" to ${newStage}`, 'success');
      fetchData();
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...selectedLead, status: newStage });
      }
    } catch {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadService.delete(leadId);
      showToast('Lead deleted successfully', 'success');
      if (selectedLead?.id === leadId) setSelectedLead(null);
      fetchData();
    } catch {
      showToast('Failed to delete lead', 'error');
    }
  };

  const activeClients = clients.filter((c) => c.is_active !== false && (c.status?.toLowerCase() === 'active' || !c.status)).length;
  const pipelineValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  const filteredStages = selectedStageFilter === 'All'
    ? PIPELINE_STAGES
    : [selectedStageFilter];

  const currentDisplayLeads = selectedStageFilter === 'All'
    ? leads
    : getStageLeads(leads, selectedStageFilter);

  const currentDisplayValue = currentDisplayLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  return (
    <div>
      <AdminHeader title="CRM Overview" subtitle="Manage clients, leads, and sales pipeline." />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(pipelineValue)}</div>
                <div className="text-sm text-[#10B981] font-medium">estimated pipeline</div>
              </div>
            </div>

            {/* Pipeline Header & Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Sales Pipeline</h2>
                    <button
                      onClick={() => setShowGoalModal(true)}
                      title="Set Pipeline Goals & Target Metrics"
                      className="p-1.5 rounded-lg text-[#4C1D95] hover:bg-[#4C1D95]/10 transition-colors"
                    >
                      <Target size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Showing {currentDisplayLeads.length} leads | Total Stage Value: <span className="font-semibold text-slate-900">{formatCurrency(currentDisplayValue)}</span>
                  </p>
                </div>

                {/* Stage Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-500">Stage Filter:</label>
                  <select
                    value={selectedStageFilter}
                    onChange={(e) => setSelectedStageFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl focus:outline-none focus:border-[#4C1D95] cursor-pointer"
                  >
                    <option value="All">All Stages ({leads.length})</option>
                    {PIPELINE_STAGES.map((s) => {
                      const count = getStageLeads(leads, s).length;
                      return <option key={s} value={s}>{s} ({count})</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Stage Pills Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
                <button
                  onClick={() => setSelectedStageFilter('All')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                    selectedStageFilter === 'All'
                      ? 'bg-[#4C1D95] text-white border-[#4C1D95]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Stages ({leads.length})
                </button>
                {PIPELINE_STAGES.map((stage) => {
                  const count = getStageLeads(leads, stage).length;
                  return (
                    <button
                      key={stage}
                      onClick={() => setSelectedStageFilter(stage)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                        selectedStageFilter === stage
                          ? 'bg-[#4C1D95] text-white border-[#4C1D95]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {stage} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pipeline Board */}
            <div className={`grid gap-4 overflow-x-auto pb-4 ${
              filteredStages.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-4 lg:grid-cols-7'
            }`}>
              {filteredStages.map((stage) => {
                const stageLeads = getStageLeads(leads, stage);
                const totalVal = stageLeads.reduce((s, l) => s + (l.estimated_value || 0), 0);

                return (
                  <div key={stage} className="bg-slate-50 rounded-2xl p-4 min-w-[240px] flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-slate-700">{stage}</h3>
                      <span className="bg-white border border-slate-200 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400 mb-4">{formatCurrency(totalVal)}</div>

                    <div className="space-y-3 flex-1">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#4C1D95] hover:shadow-md transition-all relative group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            <div className="relative card-action-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setActiveMenuId(activeMenuId === lead.id ? null : lead.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                              {activeMenuId === lead.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-xs">
                                  <button
                                    onClick={() => { setActiveMenuId(null); setSelectedLead(lead); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                                  >
                                    <Pencil size={13} className="text-slate-400" /> View / Edit Details
                                  </button>
                                  <button
                                    onClick={() => { setActiveMenuId(null); setMoveStageLead(lead); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                                  >
                                    <ArrowRight size={13} className="text-slate-400" /> Change Stage
                                  </button>
                                  <button
                                    onClick={() => { setActiveMenuId(null); handleDeleteLead(lead.id); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                                  >
                                    <Trash2 size={13} /> Delete Lead
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">{lead.title}</h4>
                          <p className="text-xs text-slate-500 mb-3 truncate">{lead.company_name ?? lead.contact_name ?? '—'}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                            <span className="font-bold text-slate-900">
                              {formatCurrency(lead.estimated_value)}
                            </span>
                            {lead.assigned_to && (
                              <div className="w-6 h-6 rounded-full bg-[#4C1D95]/10 text-[#4C1D95] flex items-center justify-center text-[10px] font-bold border border-[#4C1D95]/20" title={`Assigned to ${lead.assigned_to}`}>
                                {lead.assigned_to.charAt(0).toUpperCase()}
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

      {/* Lead Detail Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelectedLead(null)}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor(selectedLead.status)} mb-2`}>
                  {selectedLead.status}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{selectedLead.title}</h2>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs font-medium">Estimated Deal Value</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedLead.estimated_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs font-medium">Priority</span>
                  <span className="font-semibold text-slate-700">{selectedLead.priority || 'Medium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs font-medium">Assigned To</span>
                  <span className="font-semibold text-[#4C1D95]">{selectedLead.assigned_to || 'Unassigned'}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Contact Details</h3>
                <div className="space-y-2 text-slate-700 bg-white border border-slate-200 rounded-xl p-4">
                  {selectedLead.contact_name && (
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-slate-400" />
                      <span className="font-medium">{selectedLead.contact_name}</span>
                    </div>
                  )}
                  {selectedLead.company_name && (
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span>{selectedLead.company_name}</span>
                    </div>
                  )}
                  {selectedLead.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <a href={`mailto:${selectedLead.email}`} className="text-[#4C1D95] hover:underline">{selectedLead.email}</a>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <a href={`tel:${selectedLead.phone}`} className="text-[#4C1D95] hover:underline">{selectedLead.phone}</a>
                    </div>
                  )}
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Notes & Activity</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 whitespace-pre-line">
                    {selectedLead.notes}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => handleStageChange(selectedLead, 'Won')}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Mark as Won
                </button>
                <button
                  onClick={() => handleStageChange(selectedLead, 'Lost')}
                  className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
                >
                  Mark as Lost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowGoalModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Pipeline Target Goals</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500">Target deal volume and conversion metrics configured for Q3 sales cycle.</p>
            <div className="bg-purple-50 p-4 rounded-xl text-xs space-y-2 border border-purple-100">
              <div className="flex justify-between"><span className="text-slate-600">Target Revenue:</span> <span className="font-bold text-[#4C1D95]">₹25,00,000</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Target Closed Won:</span> <span className="font-bold text-emerald-600">12 Deals</span></div>
            </div>
            <button onClick={() => setShowGoalModal(false)} className="w-full py-2 bg-[#4C1D95] text-white rounded-xl text-xs font-semibold">Close</button>
          </div>
        </div>
      )}

      {/* Change Stage Dialog */}
      {moveStageLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setMoveStageLead(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Change Stage for "{moveStageLead.title}"</h3>
              <button onClick={() => setMoveStageLead(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {PIPELINE_STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    handleStageChange(moveStageLead, s);
                    setMoveStageLead(null);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex justify-between items-center ${
                    moveStageLead.status === s ? 'bg-[#4C1D95] text-white border-[#4C1D95]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{s}</span>
                  {moveStageLead.status === s && <UserCheck size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
