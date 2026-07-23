'use client';
import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, CheckCircle2, Clock, AlertCircle, Loader2, Search } from 'lucide-react';
import { financeService } from '@/services/crmService';
import { useToastStore } from '@/store/toastStore';

interface InvoiceItem { id: string; description: string; quantity: number; unit_price: number; tax_rate: number; total: number }
interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_total: number;
  total_amount: number;
  currency: string;
  notes: string | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    setError(false);
    financeService
      .getInvoices({ page_size: 100 })
      .then((res) => setInvoices(res?.items ?? res ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const pendingInvoices = invoices.filter((inv) => ['sent', 'draft', 'overdue', 'Pending', 'Unpaid', 'Overdue'].includes(inv.status));
  const paidInvoices = invoices.filter((inv) => ['paid', 'Paid', 'Completed'].includes(inv.status));
  const amountDue = pendingInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = invoices.filter((inv) => !q || inv.invoice_number.toLowerCase().includes(q) || (inv.notes || '').toLowerCase().includes(q));
    return [...list].sort((a, b) => {
      const aPending = pendingInvoices.includes(a) ? 0 : 1;
      const bPending = pendingInvoices.includes(b) ? 0 : 1;
      if (aPending !== bPending) return aPending - bPending;
      return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, search]);

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      const items: InvoiceItem[] = await financeService.getInvoiceItems(invoice.id);
      const itemRows = items
        .map((it) => `<tr><td>${it.description}</td><td style="text-align:right">${it.quantity}</td><td style="text-align:right">${invoice.currency} ${it.unit_price.toLocaleString()}</td><td style="text-align:right">${it.tax_rate}%</td><td style="text-align:right">${invoice.currency} ${it.total.toLocaleString()}</td></tr>`)
        .join('');
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${invoice.invoice_number}</title>
        <style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b} h1{color:#4C1D95} table{width:100%;border-collapse:collapse;margin-top:20px} th,td{padding:8px;border-bottom:1px solid #e2e8f0;text-align:left} th{background:#f8fafc} .totals{margin-top:20px;text-align:right} .totals p{margin:4px 0}</style>
        </head><body>
        <h1>Invoice ${invoice.invoice_number}</h1>
        <p>Status: <strong>${invoice.status}</strong></p>
        <p>Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()} &nbsp; | &nbsp; Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</p>
        <table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Total</th></tr></thead><tbody>${itemRows || '<tr><td colspan="5">No line items</td></tr>'}</tbody></table>
        <div class="totals">
          <p>Subtotal: ${invoice.currency} ${invoice.subtotal.toLocaleString()}</p>
          <p>Tax: ${invoice.currency} ${invoice.tax_total.toLocaleString()}</p>
          <p><strong>Total: ${invoice.currency} ${invoice.total_amount.toLocaleString()}</strong></p>
        </div>
        ${invoice.notes ? `<p style="margin-top:20px;color:#64748b">${invoice.notes}</p>` : ''}
        </body></html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.html`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Invoice downloaded.', 'success');
    } catch {
      showToast('Failed to download invoice.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Invoices & Billing</h1>
          <p className="text-slate-500 text-sm mt-1">View payment history and download invoices.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 mb-6">
          Couldn&apos;t load invoices. <button onClick={load} className="underline font-medium">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 mb-1">Amount Due</h3>
          <div className="text-3xl font-bold text-slate-900">₹{amountDue.toLocaleString()}</div>
          {pendingInvoices.length > 0 && (
            <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
              <AlertCircle size={14} /> {pendingInvoices.length} pending invoice{pendingInvoices.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Paid</h3>
          <div className="text-3xl font-bold text-slate-900">₹{totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm bg-slate-900 text-white flex flex-col justify-center items-start">
          <h3 className="text-sm font-semibold text-white/70 mb-2">Total Invoices</h3>
          <div className="text-3xl font-bold">{invoices.length}</div>
          <p className="text-xs text-white/50 mt-2">{paidInvoices.length} paid / {pendingInvoices.length} pending</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Billing History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-400">No invoices found</td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <FileText size={14} />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{invoice.invoice_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900">{new Date(invoice.issue_date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">Due: {new Date(invoice.due_date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">₹{(invoice.total_amount || 0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      {['paid', 'Paid', 'Completed'].includes(invoice.status) ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                          <Clock size={12} /> {invoice.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDownload(invoice)}
                        disabled={downloadingId === invoice.id}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-[#4C1D95] hover:bg-[#4C1D95]/10 transition-colors disabled:opacity-50"
                      >
                        {downloadingId === invoice.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
