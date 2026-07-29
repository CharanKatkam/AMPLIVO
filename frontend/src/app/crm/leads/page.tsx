'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Filter, ChevronDown, Eye, CheckCircle, XCircle,
  Clock, ArrowUpRight, Users, Building2, Phone, Mail,
  Calendar, IndianRupee, Tag,
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';
import { CrmLead, CrmLeadStatus } from '@/types/crm';

const STATUS_COLORS: Record<string, string> = {
  'Pending Review': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Approved': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Invoice Sent': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Payment Pending': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Payment Verified': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Credentials Sent': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Client Created': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Overdue': 'bg-red-500/20 text-red-300 border-red-500/30',
};

const STATUSES: CrmLeadStatus[] = [
  'Pending Review', 'Approved', 'Rejected',
  'Invoice Sent', 'Credentials Sent', 'Payment Pending', 'Payment Verified', 'Client Created'
];

export default function CrmLeadsPage() {
  const { leads, updateLeadStatus } = useCrmStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'name'>('date');

  const filtered = useMemo(() => {
    return leads
      .filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          l.salesLead.firstName.toLowerCase().includes(q) ||
          l.salesLead.lastName.toLowerCase().includes(q) ||
          l.salesLead.company.toLowerCase().includes(q) ||
          l.salesLead.email.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || l.crmStatus === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'budget') return (b.salesLead.budget ?? 0) - (a.salesLead.budget ?? 0);
        if (sortBy === 'name') return a.salesLead.firstName.localeCompare(b.salesLead.firstName);
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      });
  }, [leads, search, statusFilter, sortBy]);

  const counts = useMemo(() => {
    return STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.crmStatus === s).length }), {} as Record<string, number>);
  }, [leads]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">{leads.length} total leads · {leads.filter(l => l.crmStatus === 'Pending Review').length} pending review</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setStatusFilter('All')}
          className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'All' ? 'bg-violet-600 text-white' : 'bg-[#12141f] text-slate-400 hover:text-white border border-white/5'}`}
        >
          All ({leads.length})
        </button>
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? 'bg-violet-600 text-white' : 'bg-[#12141f] text-slate-400 hover:text-white border border-white/5'}`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#12141f] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="bg-[#12141f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
        >
          <option value="date">Sort: Newest</option>
          <option value="budget">Sort: Budget</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#12141f] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Lead</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Services</th>
                <th className="text-right px-5 py-3 font-medium hidden sm:table-cell">Budget</th>
                <th className="text-center px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No leads found</td></tr>
              )}
              {filtered.map(lead => {
                const sl = lead.salesLead;
                return (
                  <tr key={lead.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-600/20 flex items-center justify-center text-sm font-bold text-violet-400 shrink-0">
                          {sl.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{sl.firstName} {sl.lastName}</p>
                          <p className="text-xs text-slate-500">{sl.company} · {sl.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sl.interestedServices.slice(0, 2).map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-slate-400">{s.split(' ')[0]}</span>
                        ))}
                        {sl.interestedServices.length > 2 && (
                          <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-slate-500">+{sl.interestedServices.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right hidden sm:table-cell">
                      <span className="font-semibold text-white">₹{((sl.budget ?? 0) / 1000).toFixed(0)}K</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[lead.crmStatus] ?? 'bg-white/5 text-slate-400 border-white/10'}`}>
                        {lead.crmStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/crm/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
                      >
                        View <Eye className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-xs text-slate-500">
          Showing {filtered.length} of {leads.length} leads
        </div>
      </div>
    </div>
  );
}
