'use client';
import { useState } from 'react';
import { SalesHeader } from '@/components/sales/SalesSidebar';
import { LeadStatusBadge } from '@/components/sales/LeadStatusBadge';
import { useSalesStore } from '@/store/salesStore';
import { SalesLeadStatus } from '@/types';
import {
  Search, Plus, Filter, Download, ArrowUpDown, Mail, Phone, ExternalLink,
  TrendingUp, Star, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_TABS: (SalesLeadStatus | 'All')[] = [
  'All', 'New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Ready for CRM',
];

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'text-red-500',
  High: 'text-orange-500',
  Medium: 'text-amber-500',
  Low: 'text-slate-400',
};

export default function SalesLeadsPage() {
  const { leads } = useSalesStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<SalesLeadStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'budget' | 'date' | 'name'>('date');

  const filtered = leads
    .filter((l) => activeTab === 'All' || l.status === activeTab)
    .filter((l) => {
      const q = search.toLowerCase();
      return (
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'budget') return b.budget - a.budget;
      if (sortBy === 'name') return a.firstName.localeCompare(b.firstName);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === 'All' ? leads.length : leads.filter((l) => l.status === tab).length;
    return acc;
  }, {});

  return (
    <div>
      <SalesHeader
        title="Leads"
        badge={`${leads.length} Total`}
        subtitle="Manage your sales pipeline"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors">
            <Plus size={15} /> Add Lead
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                activeTab === tab
                  ? 'bg-[#4C1D95] text-white border-[#4C1D95]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#4C1D95]/30 hover:text-[#4C1D95]'
              }`}
            >
              {tab}
              {counts[tab] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, email..."
              className="w-full pl-9 pr-4 py-2.5 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'budget' | 'date' | 'name')}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20"
            >
              <option value="date">Sort: Latest</option>
              <option value="budget">Sort: Budget</option>
              <option value="name">Sort: Name</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">Lead <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">
                      No leads found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </div>
                          <div>
                            <Link
                              href={`/sales/leads/${lead.id}`}
                              className="font-semibold text-slate-900 text-sm hover:text-[#4C1D95] transition-colors"
                            >
                              {lead.firstName} {lead.lastName}
                            </Link>
                            <div className="text-xs text-slate-400">{lead.company}</div>
                            <div className="text-[10px] text-slate-300 mt-0.5">{lead.industry}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#4C1D95] transition-colors">
                            <Mail size={11} className="text-slate-300" />{lead.email}
                          </a>
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#4C1D95] transition-colors">
                            <Phone size={11} className="text-slate-300" />{lead.phone}
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <LeadStatusBadge status={lead.status} />
                        {lead.invoiceGenerated && (
                          <div className="text-[10px] text-purple-600 font-semibold mt-1">Invoice Generated</div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className={`flex items-center gap-1 text-xs font-semibold ${PRIORITY_COLOR[lead.priority]}`}>
                          {lead.priority === 'Critical' ? <AlertCircle size={12} /> :
                           lead.priority === 'High' ? <TrendingUp size={12} /> :
                           <Star size={12} />}
                          {lead.priority}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">₹{(lead.budget / 1000).toFixed(0)}K</div>
                        <div className="text-[10px] text-slate-400">/ month</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-[9px] font-bold">
                            {lead.assignedTo.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-xs text-slate-600 font-medium">{lead.assignedTo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
                          {lead.source}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/sales/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4C1D95] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
            <span>Showing {filtered.length} of {leads.length} leads</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-400 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs hover:bg-slate-50 text-slate-700">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
