'use client';
import { useEffect, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { financeService } from '@/services/crmService';
import { CheckCircle2, CreditCard, Loader2, Wallet } from 'lucide-react';

interface InvoiceItem { id: string; invoice_number: string; status: string; total_amount: number; currency: string }
interface PaymentItem { id: string; invoice_id: string; amount: number; payment_date: string; payment_method: string; reference_number: string | null; status: string }

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    financeService
      .getInvoices({ page_size: 100 })
      .then(async (res) => {
        const items: InvoiceItem[] = res?.items ?? [];
        setInvoices(items);
        const allPayments = await Promise.all(
          items.map(async (inv) => {
            try {
              return await financeService.getPayments(inv.id);
            } catch {
              return [];
            }
          })
        );
        setPayments(allPayments.flat());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const totalPaid = payments.filter((p) => p.status !== 'failed').reduce((sum, p) => sum + p.amount, 0);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const outstanding = Math.max(totalInvoiced - totalPaid, 0);

  const invoiceLookup = Object.fromEntries(invoices.map((i) => [i.id, i]));
  const sortedPayments = [...payments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

  if (loading) {
    return (
      <div>
        <PortalHeader title="Payments" subtitle="Your payment history" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Payments" subtitle="Your payment history" />
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            Couldn&apos;t load payments. <button onClick={load} className="underline font-medium">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={<CheckCircle2 size={20} />} iconColor="#10B981" trend={null} />
          <StatCard label="Outstanding Balance" value={`₹${outstanding.toLocaleString()}`} icon={<Wallet size={20} />} iconColor="#F59E0B" trend={null} />
          <StatCard label="Payments Recorded" value={String(payments.length)} icon={<CreditCard size={20} />} iconColor="#4C1D95" trend={null} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-bold text-slate-900">Payment History</h2>
            <p className="text-xs text-slate-400 mt-0.5">A record of payments received against your invoices.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Method</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Reference</th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-center py-3 px-5 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedPayments.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No payments recorded yet</td></tr>
                ) : (
                  sortedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-5 font-medium text-slate-900">{invoiceLookup[p.invoice_id]?.invoice_number ?? '-'}</td>
                      <td className="py-3 px-5 text-slate-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td className="py-3 px-5 text-slate-600 capitalize">{p.payment_method}</td>
                      <td className="py-3 px-5 text-slate-500">{p.reference_number || '-'}</td>
                      <td className="py-3 px-5 text-right font-semibold text-slate-900">₹{p.amount.toLocaleString()}</td>
                      <td className="py-3 px-5 text-center">
                        <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${p.status === 'completed' || p.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
