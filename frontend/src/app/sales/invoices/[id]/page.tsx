'use client';
import { use } from 'react';
import { SalesHeader } from '@/components/sales/SalesSidebar';
import { useSalesStore } from '@/store/salesStore';
import { Printer, ArrowLeft, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePreviewPage({ params }: PageProps) {
  const { id } = use(params);
  const { invoices } = useSalesStore();
  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-4">
        <AlertCircle className="text-red-400" size={40} />
        <p className="text-slate-500">Invoice not found</p>
        <Link href="/sales/invoices" className="text-[#4C1D95] font-semibold text-sm hover:underline">← Back to Invoices</Link>
      </div>
    );
  }

  const handlePrint = () => window.print();

  return (
    <div>
      <SalesHeader
        title={invoice.invoiceNumber}
        subtitle={invoice.company}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/sales/invoices"
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors print:hidden"
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors print:hidden"
            >
              <Printer size={15} /> Print Invoice
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Invoice Document */}
        <div id="invoice-print" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Gradient Header */}
          <div className="bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#06B6D4] p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>Amplivo Digital Growth</div>
                    <div className="text-white/60 text-xs">Private Limited</div>
                  </div>
                </div>
                <div className="text-white/70 text-xs space-y-0.5">
                  <div>📍 Plot 42, Jubilee Hills, Hyderabad – 500033, Telangana</div>
                  <div>📧 billing@amplivo.in · 📞 +91 40 4567 8901</div>
                  <div>🏛️ GSTIN: 36AABCA1234B1ZX</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Invoice</div>
                <div className="text-white text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{invoice.invoiceNumber}</div>
                <div className="mt-3 space-y-1">
                  <div className="text-white/70 text-xs">Issue Date: <span className="text-white font-semibold">{invoice.issueDate}</span></div>
                  <div className="text-white/70 text-xs">Due Date: <span className="text-white font-semibold">{invoice.dueDate}</span></div>
                </div>
                <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  invoice.status === 'Advance Paid' ? 'bg-emerald-400 text-emerald-900' :
                  invoice.status === 'Fully Paid' ? 'bg-emerald-300 text-emerald-900' :
                  invoice.status === 'Sent' ? 'bg-blue-300 text-blue-900' :
                  'bg-white/20 text-white'
                }`}>
                  {invoice.status}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Bill To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</div>
                <div className="font-bold text-slate-900 text-base">{invoice.clientName}</div>
                <div className="text-slate-600 text-sm">{invoice.company}</div>
                <div className="mt-2 space-y-1">
                  <div className="text-slate-500 text-sm">{invoice.clientEmail}</div>
                  <div className="text-slate-500 text-sm">{invoice.clientPhone}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Terms</div>
                <div className="text-slate-700 text-sm font-semibold">25% Advance + 75% on Completion</div>
                <div className="text-slate-400 text-xs mt-1">Standard quarterly retainer terms</div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Services</div>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Months</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Unit Price</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800 text-sm">{item.serviceName}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-slate-600">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-sm text-slate-700">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 text-right font-semibold text-slate-900 text-sm">₹{item.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">GST ({invoice.taxRate}%)</span>
                  <span className="font-semibold text-slate-800">₹{invoice.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-base">
                    <span className="font-bold text-slate-900">Grand Total</span>
                    <span className="font-bold text-slate-900">₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 25% Advance Highlight */}
            <div className="bg-gradient-to-r from-[#4C1D95]/8 to-[#7C3AED]/8 border-2 border-[#4C1D95]/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={18} className="text-[#4C1D95]" />
                    <span className="font-bold text-[#4C1D95] text-base" style={{ fontFamily: "'Sora', sans-serif" }}>
                      25% Advance Due Now
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 ml-6">Payment required before project kickoff</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#4C1D95]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    ₹{invoice.advanceDue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Due by {invoice.dueDate}</div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 rounded-xl p-5 mb-6">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bank Details</div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div><span className="text-slate-400">Bank:</span> <span className="font-semibold">HDFC Bank Ltd</span></div>
                  <div><span className="text-slate-400">A/C No:</span> <span className="font-semibold">1234 5678 9012</span></div>
                  <div><span className="text-slate-400">IFSC:</span> <span className="font-semibold">HDFC0001234</span></div>
                  <div><span className="text-slate-400">Branch:</span> <span className="font-semibold">Jubilee Hills, Hyderabad</span></div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</div>
                <p className="text-xs text-slate-600 leading-relaxed">{invoice.notes}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-5">
              <p>This is a computer-generated invoice. No signature required.</p>
              <p className="mt-1">Amplivo Digital Growth Private Limited · GSTIN: 36AABCA1234B1ZX · amplivo.in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
