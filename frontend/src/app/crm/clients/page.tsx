'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Building2, Eye, Mail, Phone, IndianRupee,
  Calendar, Briefcase, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

export default function CrmClientsPage() {
  const { clients, projects } = useCrmStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return clients
      .filter(c => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          c.company.toLowerCase().includes(q) ||
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.clientId.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [clients, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === 'Active').length,
      onboarding: clients.filter(c => c.status === 'Onboarding').length,
      churned: clients.filter(c => c.status === 'Churned').length,
    };
  }, [clients]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your active client portfolio</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500">Active Retainer</p>
            <p className="text-lg font-bold text-emerald-400">
              ₹{clients.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.monthlyRetainer, 0).toLocaleString('en-IN')}/mo
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 bg-[#12141f] p-1 rounded-lg border border-white/5">
          {['All', 'Active', 'Onboarding', 'Churned'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status} ({status === 'All' ? stats.total : stats[status.toLowerCase() as keyof typeof stats]})
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#12141f] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-[#12141f] rounded-xl border border-white/5">
            No clients found.
          </div>
        )}
        {filtered.map(client => {
          const clientProjects = projects.filter(p => p.clientId === client.id);
          const activeProjects = clientProjects.filter(p => p.status === 'In Progress' || p.status === 'Assigned');
          
          return (
            <div key={client.id} className="bg-[#12141f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400 font-bold shrink-0">
                    {client.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-violet-400 transition-colors">{client.company}</h3>
                    <p className="text-xs text-slate-500">{client.clientId}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  client.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  client.status === 'Onboarding' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4" /> POC</span>
                  <span className="text-white">{client.firstName} {client.lastName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Retainer</span>
                  <span className="text-emerald-400 font-medium">₹{client.monthlyRetainer.toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Since</span>
                  <span className="text-white">{client.startDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="text-white font-medium">{activeProjects.length}</span> Active Projects
                </div>
                <Link
                  href={`/crm/clients/${client.id}`}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  View Profile <Eye className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
