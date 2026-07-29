'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminSidebar';
import { notificationService } from '@/services/crmService';
import { Bell, CheckCircle2, Clock, Info, ShieldAlert, Loader2, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type?: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ page_size: 100 });
      setNotifications(res?.items ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.is_read).map((n) => notificationService.markRead(n.id))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const handleMarkSingle = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // ignore
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.is_read : true));
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <AdminHeader title="Notifications Center" subtitle="Review system updates, audit logs, and task notifications." />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                filter === 'all' ? 'bg-[#4C1D95] text-white border-[#4C1D95]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                filter === 'unread' ? 'bg-[#4C1D95] text-white border-[#4C1D95]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-xs font-semibold text-[#4C1D95] hover:underline"
            >
              <Check size={14} /> Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading notifications...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <Bell size={32} className="mx-auto mb-2 text-slate-300" />
              No notifications to display.
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkSingle(n.id)}
                className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                  n.is_read ? 'bg-white hover:bg-slate-50/50' : 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 flex-shrink-0 mt-0.5">
                  <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{n.title || 'System Notification'}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
