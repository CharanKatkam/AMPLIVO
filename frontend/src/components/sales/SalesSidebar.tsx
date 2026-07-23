'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, CalendarDays, BarChart2,
  Settings, LogOut, Zap, Bell, Search, TrendingUp, Receipt, Briefcase,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/sales' },
  { icon: Users, label: 'Leads', href: '/sales/leads', badge: '10' },
  { icon: CalendarDays, label: 'Meetings', href: '/sales/meetings', badge: '3' },
  { icon: CalendarDays, label: 'Calendar', href: '/sales/calendar' },
  { icon: Receipt, label: 'Invoices', href: '/sales/invoices' },
  { icon: BarChart2, label: 'Reports', href: '/sales/reports' },
];

interface SalesHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function SalesHeader({ title, subtitle, badge, actions }: SalesHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h1>
        {badge && (
          <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full font-semibold">
            {badge}
          </span>
        )}
        {subtitle && <span className="text-sm text-slate-400">{subtitle}</span>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search leads..."
            className="pl-10 pr-4 py-2.5 rounded-[10px] bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 w-56"
          />
        </div>
        <button className="relative w-9 h-9 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={17} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EC4899] text-white text-[9px] font-bold flex items-center justify-center">3</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
          SA
        </div>
      </div>
    </header>
  );
}

export function SalesSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#111827] flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#1F2937]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center flex-shrink-0">
          <TrendingUp size={15} className="text-white" />
        </div>
        <div>
          <div className="text-white text-sm font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>Sales Portal</div>
          <div className="text-[#4B5563] text-[10px]">Pipeline · CRM Handoff</div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            SA
          </div>
          <div>
            <div className="text-white text-sm font-medium">Shreya Agarwal</div>
            <div className="text-[#4B5563] text-xs">Sales Admin</div>
          </div>
        </div>
      </div>

      {/* Pipeline Status Strip */}
      <div className="mx-3 mt-3 mb-1 bg-[#1F2937] rounded-xl p-3">
        <div className="text-[#9CA3AF] text-[10px] font-semibold uppercase tracking-wider mb-2">This Month</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-white text-sm font-bold">12</div>
            <div className="text-[#6B7280] text-[9px]">Leads</div>
          </div>
          <div>
            <div className="text-emerald-400 text-sm font-bold">2</div>
            <div className="text-[#6B7280] text-[9px]">Won</div>
          </div>
          <div>
            <div className="text-violet-400 text-sm font-bold">₹4.5L</div>
            <div className="text-[#6B7280] text-[9px]">Pipeline</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <div className="text-[#4B5563] text-[10px] font-semibold uppercase tracking-wider px-3 py-2">Navigation</div>
        {navItems.map((item) => {
          const isActive = item.href === '/sales' ? pathname === '/sales' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all text-sm ${
                isActive
                  ? 'bg-[#4C1D95] text-white shadow-sm'
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

      {/* Switch to Admin + Bottom */}
      <div className="px-3 py-4 border-t border-[#1F2937] space-y-0.5">
        <Link href="/admin" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white text-sm transition-all">
          <Zap size={17} /> <span>Admin ERP</span>
        </Link>
        <Link href="/crm" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white text-sm transition-all">
          <Briefcase size={17} /> <span>CRM Portal</span>
        </Link>
        <Link href="/sales/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white text-sm transition-all">
          <Settings size={17} /> <span>Settings</span>
        </Link>
        <Link href="/login" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-red-400 text-sm transition-all">
          <LogOut size={17} /> <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
