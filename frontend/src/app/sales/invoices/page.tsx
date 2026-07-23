'use client';
import { SalesHeader } from '@/components/sales/SalesSidebar';
import { useSalesStore } from '@/store/salesStore';
import { FileText, ExternalLink, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

const statusStyle: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-500 border-slate-200',
  Sent: 'bg-blue-50 text-blue-700 border-blue-200',
  'Advance Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fully Paid': 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function InvoicesPage() {
  const { invoices } = useSalesStore();

  const totalAdvance = invoices.reduce((sum, inv) => sum + inv.advanceDue, 0);
  const totalGrand = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <div>
      <SalesHeader
        title="Invoices"
        badge={`${invoices.length} Total`}
        subtitle="25% advance invoices"
      />

      <div className="p-6 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invoices', value: invoices.length, color: '#4C1D95' },
            { label: 'Total Grand Total', value: `₹${(totalGrand / 100000).toFixed(1)}L`, color: '#7C3AED' },
            { label: 'Total Advance Due', value: `₹${(totalAdvance / 100000).toFixed(1)}L`, color: '#06B6D4' },
            { label: 'Fully Paid', value: invoices.filter((i) => i.status === 'Fully Paid').length, color: '#10B981' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: item.color }}>
                {item.value}
              </div>
              <div className="text-sm text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Invoice Table */}
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <FileText size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No invoices generated yet</p>
            <p className="text-sm text-slate-400 mt-1">Generate an invoice from a Lead Detail page</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    {['Invoice #', 'Client', 'Grand Total', '25% Advance', 'Issue Date', 'Due Date', 'Status', ''].map((h) => (
                      <th key={h} className="py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                            <FileText size={14} className="text-[#4C1D95]" />
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800 text-sm">{inv.clientName}</div>
                        <div className="text-xs text-slate-400">{inv.company}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">₹{inv.grandTotal.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400">incl. {inv.taxRate}% GST</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#4C1D95] text-sm">₹{inv.advanceDue.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400">25% advance</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar size={12} className="text-slate-300" />{inv.issueDate}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock size={12} className="text-slate-300" />{inv.dueDate}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle[inv.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/sales/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4C1D95] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
