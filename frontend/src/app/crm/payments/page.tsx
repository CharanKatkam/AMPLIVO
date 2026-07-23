'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, CreditCard, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

export default function CrmPaymentsPage() {
  const { payments, verifyPayment } = useCrmStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return payments
      .filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.clientName.toLowerCase().includes(q) || p.company.toLowerCase().includes(q) || (p.transactionId?.toLowerCase().includes(q) ?? false);
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, search, statusFilter]);

  const stats = {
    total: payments.reduce((s, p) => s + p.amount, 0),
    paid: payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0),
    pending: payments.filter(p => p.status === 'Pending' || p.status === 'Processing').reduce((s, p) => s + p.amount, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Verify and track incoming payments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#12141f] p-5 rounded-xl border border-white/5">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <CreditCard className="w-4 h-4" />
            <h3 className="text-sm font-medium">Total Volume</h3>
          </div>
          <p className="text-2xl font-bold text-white">₹{stats.total.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#12141f] p-5 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-2 text-emerald-500/80">
            <CheckCircle className="w-4 h-4" />
            <h3 className="text-sm font-medium">Verified Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-400">₹{stats.paid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#12141f] p-5 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-3 mb-2 text-amber-500/80">
            <Clock className="w-4 h-4" />
            <h3 className="text-sm font-medium">Pending Verification</h3>
          </div>
          <p className="text-2xl font-bold text-amber-400">₹{stats.pending.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2 bg-[#12141f] p-1 rounded-lg border border-white/5 overflow-x-auto scrollbar-hide">
          {['All', 'Paid', 'Pending', 'Processing', 'Failed'].map(status => (
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
            placeholder="Search payments or transaction ID..."
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
                <th className="text-left px-5 py-3 font-medium">Client / Invoice</th>
                <th className="text-right px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Method & Txn ID</th>
                <th className="text-center px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No payments found</td></tr>
              )}
              {filtered.map(payment => (
                <tr key={payment.id} className="hover:bg-white/3 transition-colors group">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{payment.company}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{payment.invoiceNumber}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-white">₹{payment.amount.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-300">{payment.method}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{payment.transactionId || '—'}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${
                      payment.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      payment.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      payment.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {payment.status === 'Paid' ? (
                      <div className="text-xs">
                        <p className="text-emerald-400 flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3" /> Verified</p>
                        <p className="text-slate-500 mt-0.5">{payment.verifiedAt}</p>
                      </div>
                    ) : payment.status === 'Failed' ? (
                      <span className="text-xs text-red-400 flex items-center justify-end gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>
                    ) : (
                      <button 
                        onClick={() => verifyPayment(payment.id, 'Admin')}
                        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        Verify Payment <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-xs text-slate-500">
          Showing {filtered.length} of {payments.length} payments
        </div>
      </div>
    </div>
  );
}
