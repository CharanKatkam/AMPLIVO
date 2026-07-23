'use client';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

export function Toaster() {
  const { toasts, dismissToast } = useToastStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 rounded-xl border p-3 shadow-lg bg-white animate-in fade-in slide-in-from-top-2 ${
            t.type === 'success' ? 'border-green-200' : t.type === 'error' ? 'border-red-200' : 'border-slate-200'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />}
          {t.type === 'error' && <XCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info size={18} className="text-slate-500 flex-shrink-0 mt-0.5" />}
          <p className="text-sm text-slate-700 flex-1">{t.message}</p>
          <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
