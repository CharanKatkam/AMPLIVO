'use client';
import { Bell, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useCrmStore } from '@/store/crmStore';
import { useUiStore } from '@/store/uiStore';
import Link from 'next/link';

interface EmployeeHeaderProps {
  title: string;
  subtitle?: string;
}

export function EmployeeHeader({ title, subtitle }: EmployeeHeaderProps) {
  const { activeEmployeeId, getEmployeeById, getUnreadCount } = useCrmStore();
  const employee = getEmployeeById(activeEmployeeId || '');
  const unreadCount = getUnreadCount();
  const { toggleSidebar } = useUiStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 flex-shrink-0 sticky top-0 z-10 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-900 focus:outline-none shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-slate-900 truncate" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Link href="/employee/notifications" className="relative w-9 h-9 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EC4899] text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/employee/profile">
          <Avatar name={employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'} size="sm" />
        </Link>
      </div>
    </header>
  );
}
