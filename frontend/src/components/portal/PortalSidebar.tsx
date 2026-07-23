'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Megaphone, TrendingUp, BarChart2, Image as ImageIcon,
  Files, Calendar, MessageSquare, FileText, LifeBuoy, Settings, LogOut, Zap, Bell,
  FolderKanban, Receipt, Folder,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { campaignService } from '@/services/campaignService';
import { creativeService, companyService, messagingService } from '@/services';
import { userManagementService } from '@/services/crmService';

interface AccountManager {
  name: string;
  email: string;
}

function useSidebarData() {
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [pendingCreatives, setPendingCreatives] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [accountManager, setAccountManager] = useState<AccountManager | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const campaignsRes = await campaignService.getAll({ page_size: 100 });
        const items = campaignsRes?.items ?? [];
        if (!cancelled) setActiveCampaigns(items.filter((c: { status?: string }) => c.status === 'Active').length);
      } catch {
        // leave at 0
      }

      try {
        const projectsRes = await creativeService.getProjects({ page_size: 20 });
        const projects = projectsRes?.items ?? projectsRes ?? [];
        let pending = 0;
        for (const p of projects.slice(0, 5)) {
          try {
            const assets = await creativeService.getAssets(p.id);
            pending += (assets ?? []).filter((a: { status?: string }) => (a.status ?? '').toLowerCase() === 'pending').length;
          } catch {
            // skip project on error
          }
        }
        if (!cancelled) setPendingCreatives(pending);
      } catch {
        // leave at 0
      }

      try {
        const convRes = await messagingService.getConversations({ page_size: 5 });
        const conversations = convRes?.items ?? [];
        let unread = 0;
        for (const c of conversations) {
          try {
            const messages = await messagingService.getMessages(c.id);
            unread += messages.filter((m) => !m.is_read && m.sender_id !== user?.id).length;
          } catch {
            // skip conversation on error
          }
        }
        if (!cancelled) setUnreadMessages(unread);
      } catch {
        // leave at 0
      }

      try {
        const company = await companyService.getMine();
        if (company.assigned_to) {
          const manager = await userManagementService.getUser(company.assigned_to);
          if (!cancelled) setAccountManager({ name: manager.full_name ?? manager.name ?? 'Account Manager', email: manager.email ?? '' });
        }
      } catch {
        // no account manager assigned / not a client-portal user
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeCampaigns, pendingCreatives, unreadMessages, accountManager };
}

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();
  const { activeCampaigns, pendingCreatives, unreadMessages, accountManager } = useSidebarData();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/portal' },
    { icon: Megaphone, label: 'Campaigns', href: '/portal/campaigns', badge: activeCampaigns > 0 ? String(activeCampaigns) : undefined },
    { icon: ImageIcon, label: 'Creative Approval', href: '/portal/creatives', badge: pendingCreatives > 0 ? String(pendingCreatives) : undefined },
    { icon: TrendingUp, label: 'Leads', href: '/portal/leads' },
    { icon: FolderKanban, label: 'Projects & Tasks', href: '/portal/projects' },
    { icon: Calendar, label: 'Content Calendar', href: '/portal/calendar' },
    { icon: BarChart2, label: 'SEO Reports', href: '/portal/seo' },
    { icon: Files, label: 'Analytics', href: '/portal/analytics' },
    { icon: FileText, label: 'Invoices', href: '/portal/invoices' },
    { icon: Receipt, label: 'Payments', href: '/portal/payments' },
    { icon: Folder, label: 'Documents', href: '/portal/documents' },
    { icon: MessageSquare, label: 'Messages', href: '/portal/messages', badge: unreadMessages > 0 ? String(unreadMessages) : undefined },
    { icon: LifeBuoy, label: 'Support Tickets', href: '/portal/support' },
  ];

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // ignore
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-[#111827] flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#1F2937]">
        <div className="w-8 h-8 rounded-lg bg-[#4C1D95] flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>Amplivo</span>
          <div className="text-[#4B5563] text-[10px]">Client Portal</div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name ?? 'Client'} image={user?.image} size="sm" />
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name ?? 'Client'}</div>
            <div className="text-[#4B5563] text-xs truncate">{user?.company ?? user?.email ?? ''}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all text-sm ${
                isActive
                  ? 'bg-[#4C1D95] text-white'
                  : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'
              }`}
            >
              <item.icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-[#7C3AED] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account Manager Card */}
      <div className="px-4 py-4 border-t border-[#1F2937]">
        {accountManager && (
          <div className="bg-[#1F2937] rounded-xl p-3 mb-3">
            <div className="text-[#9CA3AF] text-[10px] uppercase tracking-wider mb-2">Account Manager</div>
            <div className="flex items-center gap-2">
              <Avatar name={accountManager.name} size="xs" />
              <div>
                <div className="text-white text-xs font-medium">{accountManager.name}</div>
                <div className="text-[#4B5563] text-[10px]">{accountManager.email}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-red-400 transition-all text-xs flex-1">
            <LogOut size={14} /> Sign Out
          </button>
          <Link href="/portal/settings" className="flex items-center justify-center w-9 h-9 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white transition-all">
            <Settings size={15} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

// Portal Top Header — shared across all portal pages, shows real user + real notifications
interface PortalHeaderProps {
  title: string;
  subtitle?: string;
}
export function PortalHeader({ title, subtitle }: PortalHeaderProps) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title?: string; message: string; is_read: boolean; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import('@/services/crmService').then(({ notificationService }) => {
      notificationService
        .getAll({ page_size: 10 })
        .then((res) => {
          if (!cancelled) setNotifications(res?.items ?? []);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    const { notificationService } = await import('@/services/crmService');
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative w-9 h-9 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EC4899] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <Link href="/portal/notifications" className="text-xs text-[#4C1D95] hover:underline" onClick={() => setOpen(false)}>
                  View all
                </Link>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <p className="text-xs text-slate-400 text-center py-6">Loading...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 flex gap-2"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-slate-300' : 'bg-amber-500'}`} />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-700 line-clamp-2">{n.title ? `${n.title}: ` : ''}{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <Avatar name={user?.name ?? 'Client'} image={user?.image} size="sm" />
      </div>
    </header>
  );
}
