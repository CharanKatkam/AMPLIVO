'use client';
import { useEffect, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { supportTicketService, SupportTicketRead, SupportTicketCommentRead } from '@/services/portalServices';
import { useToastStore } from '@/store/toastStore';
import { LifeBuoy, Loader2, Plus, Send, X } from 'lucide-react';

const CATEGORIES = ['general', 'billing', 'technical', 'campaign', 'creative'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<SupportTicketRead | null>(null);
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    setError(false);
    supportTicketService
      .getAll({ page_size: 100 })
      .then((res) => setTickets(res?.items ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) {
    return (
      <div>
        <PortalHeader title="Support Tickets" subtitle="Raise and track requests to Amplivo" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Support Tickets" subtitle="Raise and track requests to Amplivo" />
      <div className="p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            Couldn&apos;t load support tickets. <button onClick={load} className="underline font-medium">Retry</button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#4C1D95] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#3b1675] transition-colors"
          >
            <Plus size={16} /> New Ticket
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {tickets.length === 0 ? (
            <div className="text-center py-16">
              <LifeBuoy size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">No support tickets yet</p>
            </div>
          ) : (
            tickets.map((t) => (
              <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-sm truncate">{t.subject}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{t.description}</p>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span className="capitalize">{t.category}</span>
                    <span className="capitalize">Priority: {t.priority}</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={(t) => { setTickets((p) => [t, ...p]); showToast('Support ticket created.', 'success'); }} />}
      {selected && <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CreateTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: SupportTicketRead) => void }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const showToast = useToastStore((s) => s.showToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setErrorMsg('Subject and description are required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const ticket = await supportTicketService.create({ subject: subject.trim(), description: description.trim(), category, priority });
      onCreated(ticket);
      onClose();
    } catch {
      setErrorMsg('Failed to create ticket. Please try again.');
      showToast('Failed to create ticket.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">New Support Ticket</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{errorMsg}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/30" placeholder="Brief summary of your request" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/30" placeholder="Describe your issue or request in detail" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm capitalize">
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm capitalize">
                {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-[#4C1D95] text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose }: { ticket: SupportTicketRead; onClose: () => void }) {
  const [comments, setComments] = useState<SupportTicketCommentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    supportTicketService.getComments(ticket.id).then(setComments).catch(() => setComments([])).finally(() => setLoading(false));
  }, [ticket.id]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const c = await supportTicketService.addComment(ticket.id, reply.trim());
      setComments((prev) => [...prev, c]);
      setReply('');
    } catch {
      showToast('Failed to send reply.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900">{ticket.subject}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={ticket.status} />
          <span className="text-xs text-slate-400 capitalize">{ticket.category} · {ticket.priority} priority</span>
        </div>
        <p className="text-sm text-slate-600 mb-4">{ticket.description}</p>

        <div className="flex-1 overflow-y-auto border-t border-slate-100 pt-3 space-y-3">
          {loading ? (
            <Loader2 size={20} className="animate-spin text-[#4C1D95] mx-auto" />
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No replies yet</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-slate-50 rounded-xl p-3">
                <p className="text-sm text-slate-700">{c.content}</p>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(c.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-slate-100 mt-3">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            placeholder="Write a reply..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/30"
          />
          <button onClick={handleReply} disabled={sending || !reply.trim()} className="bg-[#4C1D95] text-white rounded-lg px-4 disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
