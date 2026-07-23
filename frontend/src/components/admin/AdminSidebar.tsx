'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Target, UserCheck, Megaphone, FolderKanban,
  CheckSquare, DollarSign, BarChart2, Shield, Settings, LogOut, Zap,
  Calendar, Search, Image as ImageIcon, Star, Bell, Search as SearchIcon,
  TrendingUp, Briefcase
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'CRM', href: '/admin/crm' },
  { icon: Target, label: 'Leads', href: '/admin/leads', badge: '47' },
  { icon: UserCheck, label: 'Clients', href: '/admin/clients' },
  { icon: Megaphone, label: 'Campaigns', href: '/admin/campaigns' },
  { icon: FolderKanban, label: 'Projects', href: '/admin/projects' },
  { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks', badge: '23' },
  { icon: Calendar, label: 'Social Calendar', href: '/admin/social-calendar' },
  { icon: Search, label: 'SEO Projects', href: '/admin/seo-projects' },
  { icon: ImageIcon, label: 'Creative Approval', href: '/admin/creatives', badge: '8' },
  { icon: Star, label: 'Influencers', href: '/admin/influencers' },
  { icon: Users, label: 'Team', href: '/admin/team' },
  { icon: DollarSign, label: 'Finance', href: '/admin/finance' },
  { icon: BarChart2, label: 'Reports', href: '/admin/reports' },
  { icon: TrendingUp, label: 'Analytics', href: '/admin/analytics' },
  { icon: Shield, label: 'Roles & Perms', href: '/admin/roles' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, refreshToken } = useAuthStore();

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
          <div className="text-white text-sm font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>Amplivo Admin</div>
          <div className="text-[#4B5563] text-[10px]">ERP · CRM Platform</div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {useAuthStore.getState().user?.name?.charAt(0) ?? 'A'}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{useAuthStore.getState().user?.name ?? 'Admin'}</div>
            <div className="text-[#4B5563] text-xs">{useAuthStore.getState().user?.email ?? ''}</div>
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
                <span className="bg-[#EC4899] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#1F2937] space-y-0.5">
        <Link href="/sales" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white text-sm">
          <TrendingUp size={17} /> <span>Sales Portal</span>
        </Link>
        <Link href="/crm" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white text-sm">
          <Briefcase size={17} /> <span>CRM Portal</span>
        </Link>
        <Link href="/admin/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white text-sm">
          <Settings size={17} /> <span>Settings</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-red-400 text-sm">
          <LogOut size={17} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// Admin Top Header
interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}
export function AdminHeader({ title, subtitle, badge, actions }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h1>
        {badge && (
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
            {badge}
          </span>
        )}
        {subtitle && <span className="text-sm text-slate-400">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="relative">
          <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search..."
            className="pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 w-64"
          />
        </div>
        <button className="relative w-9 h-9 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
          <Bell size={17} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EC4899] text-white text-[9px] font-bold flex items-center justify-center">7</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
          SA
        </div>
      </div>
    </header>
  );
}
