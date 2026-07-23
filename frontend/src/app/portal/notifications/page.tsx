'use client';
import { useEffect, useState } from 'react';
import { PortalHeader } from '@/components/portal/PortalSidebar';
import { notificationService } from '@/services/crmService';
import { useToastStore } from '@/store/toastStore';
import { Bell, CheckCheck, Loader2, Trash2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  channel?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const showToast = useToastStore((s) => s.showToast);

  const load = () => {
    setLoading(true);
    setError(false);
    notificationService
      .getAll({ page_size: 100 })
      .then((res) => setNotifications(res?.items ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      showToast('Failed to mark notification as read.', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast('All notifications marked as read.', 'success');
    } catch {
      showToast('Failed to mark all as read.', 'error');
    }
  };

  const remove = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('Notification deleted.', 'success');
    } catch {
      showToast('Failed to delete notification.', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <PortalHeader title="Notifications" subtitle="Stay up to date" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 size={32} className="animate-spin text-[#4C1D95]" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PortalHeader title="Notifications" subtitle="Stay up to date" />
      <div className="p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
            Couldn&apos;t load notifications. <button onClick={load} className="underline font-medium">Retry</button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#4C1D95] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-[#4C1D95] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 text-sm font-medium text-[#4C1D95] hover:underline disabled:text-slate-300 disabled:no-underline"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Bell size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.is_read ? 'bg-[#4C1D95]/[0.03]' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  {n.title && <p className="text-sm font-semibold text-slate-900">{n.title}</p>}
                  <p className="text-sm text-slate-600">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-[#4C1D95] hover:underline px-2 py-1">
                      Mark read
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
