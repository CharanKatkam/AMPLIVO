'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, FileText, IndianRupee, Clock, CheckCircle, 
  AlertCircle, Send, Plus
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

const STATUS_COLORS: Record<string, string> = {
  'Draft': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Sent': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Payment Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Advance Paid': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Fully Paid': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Overdue': 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function CrmInvoicesPage() {
  const { invoices, sendInvoiceReminder } = useCrmStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return invoices
      .filter(i => {
        const q = search.toLowerCase();
        const matchSearch = !q || i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || i.crmStatus === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [invoices, search, statusFilter]);

  const stats = {
    total: invoices.reduce((s, i) => s + i.grandTotal, 0),
    paid: invoices.filter(i => i.crmStatus === 'Advance Paid' || i.crmStatus === 'Fully Paid').reduce((s, i) => s + i.grandTotal, 0),
    pending: invoices.filter(i => i.crmStatus === 'Sent' || i.crmStatus === 'Payment Pending').reduce((s, i) => s + i.grandTotal, 0),
    overdue: invoices.filter(i => i.crmStatus === 'Overdue').reduce((s, i) => s + i.grandTotal, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage client invoices</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#12141f] p-4 rounded-xl border border-white/5">
          <p className="text-slate-500 text-xs mb-1">Total Invoiced</p>
          <p className="text-xl font-bold text-white">₹{stats.total.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#12141f] p-4 rounded-xl border border-emerald-500/20">
          <p className="text-emerald-500/80 text-xs mb-1">Paid</p>
          <p className="text-xl font-bold text-emerald-400">₹{stats.paid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#12141f] p-4 rounded-xl border border-amber-500/20">
          <p className="text-amber-500/80 text-xs mb-1">Pending</p>
          <p className="text-xl font-bold text-amber-400">₹{stats.pending.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#12141f] p-4 rounded-xl border border-red-500/20">
          <p className="text-red-500/80 text-xs mb-1">Overdue</p>
          <p className="text-xl font-bold text-red-400">₹{stats.overdue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2 bg-[#12141f] p-1 rounded-lg border border-white/5 overflow-x-auto scrollbar-hide">
          {['All', 'Sent', 'Payment Pending', 'Advance Paid', 'Fully Paid', 'Overdue'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#12141f] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#12141f] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Invoice No</th>
                <th className="text-left px-5 py-3 font-medium">Client</th>
                <th className="text-right px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-center px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No invoices found</td></tr>
              )}
              {filtered.map(invoice => (
                <tr key={invoice.id} className="hover:bg-white/3 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="font-medium text-white">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{invoice.clientName}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-emerald-400">₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">
                    {invoice.issueDate}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[invoice.crmStatus] || 'bg-white/5 text-slate-400 border-white/10'}`}>
                      {invoice.crmStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {invoice.crmStatus === 'Overdue' || invoice.crmStatus === 'Payment Pending' ? (
                      <button 
                        onClick={() => sendInvoiceReminder(invoice.id)}
                        disabled={invoice.reminderSent}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                          invoice.reminderSent 
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                            : 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                        }`}
                      >
                        {invoice.reminderSent ? 'Reminder Sent' : 'Send Reminder'} <Send className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-xs text-slate-500">
          Showing {filtered.length} of {invoices.length} invoices
        </div>
      </div>
    </div>
  );
}
