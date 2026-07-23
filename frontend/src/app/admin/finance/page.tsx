'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { financeService } from '@/services/crmService';
import { Search, Plus, IndianRupee, FileText, TrendingDown, TrendingUp, X, Loader2, AlertTriangle } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number?: string;
  client_id?: string;
  client_name?: string;
  amount: number;
  status: string;
  issue_date?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
}

interface Expense {
  id: string;
  description?: string;
  amount: number;
  category?: string;
  date?: string;
  created_at: string;
}

interface InvoiceListResponse {
  items: Invoice[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ExpenseListResponse {
  items: Expense[];
  total: number;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr ?? '—';
  }
}

export default function AdminFinance() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ client_name: '', amount: '', status: 'Pending', issue_date: '', due_date: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const invParams: Record<string, unknown> = { page_size: 100 };
      if (search.trim()) invParams.search = search.trim();
      const [invData, expData]: [InvoiceListResponse, ExpenseListResponse] = await Promise.all([
        financeService.getInvoices(invParams),
        financeService.getExpenses({ page_size: 100 }),
      ]);
      setInvoices(invData.items ?? []);
      setExpenses(expData.items ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load finance data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const outstanding = invoices.filter((inv) => inv.status !== 'Paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await financeService.createInvoice({
        client_name: form.client_name || undefined,
        amount: Number(form.amount),
        status: form.status,
        issue_date: form.issue_date || undefined,
        due_date: form.due_date || undefined,
        notes: form.notes || undefined,
      });
      setShowCreateModal(false);
      setForm({ client_name: '', amount: '', status: 'Pending', issue_date: '', due_date: '', notes: '' });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create invoice.';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  function invoiceStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-700';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'overdue': return 'bg-rose-50 text-rose-700';
      default: return 'bg-slate-50 text-slate-600';
    }
  }

  return (
    <div>
      <AdminHeader title="Finance & Billing" subtitle="Track agency revenue, invoices, and expenses." />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices, clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
            />
          </div>
          <button
            onClick={() => { setShowCreateModal(true); setSaveError(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
          >
            <Plus size={16} /> Create Invoice
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
            <span className="text-sm text-slate-500">Loading finance data...</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Total Revenue</h3>
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                    <IndianRupee size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(totalRevenue)}</div>
                <div className="text-sm text-slate-500 font-medium">{invoices.length} invoices</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Outstanding</h3>
                  <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                    <FileText size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(outstanding)}</div>
                <div className="text-sm text-amber-600 font-medium">unpaid invoices</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Total Expenses</h3>
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <TrendingDown size={16} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{formatCurrency(totalExpenses)}</div>
                <div className="text-sm text-slate-500 font-medium">{expenses.length} recorded</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500">Profit</h3>
                  <div className="w-8 h-8 rounded-full bg-[#4C1D95]/10 flex items-center justify-center text-[#4C1D95]">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-bold mb-2 ${profit >= 0 ? 'text-[#10B981]' : 'text-rose-600'}`}>{formatCurrency(profit)}</div>
                <div className="text-sm text-slate-500 font-medium">revenue - expenses</div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Invoices</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Date</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-slate-400">No invoices found.</td>
                      </tr>
                    )}
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 text-sm">{inv.invoice_number ?? inv.id.slice(0, 8)}</td>
                        <td className="py-4 px-6 text-sm text-slate-700">{inv.client_name ?? '—'}</td>
                        <td className="py-4 px-6 font-bold text-slate-900 text-sm">{formatCurrency(inv.amount)}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{inv.issue_date ? formatDate(inv.issue_date) : '—'}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${invoiceStatusColor(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Create Invoice</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="px-6 py-5 space-y-4">
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{saveError}</div>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#4C1D95] resize-none"
                  placeholder="Invoice notes..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
