'use client';
import { Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useCrmStore } from '@/store/crmStore';
import Link from 'next/link';

interface EmployeeHeaderProps {
  title: string;
  subtitle?: string;
}

export function EmployeeHeader({ title, subtitle }: EmployeeHeaderProps) {
  const { activeEmployeeId, getEmployeeById, getUnreadCount } = useCrmStore();
  const employee = getEmployeeById(activeEmployeeId || '');
  const unreadCount = getUnreadCount();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/employee/notifications" className="relative w-9 h-9 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EC4899] text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/employee/profile">
          <Avatar name={employee?.name || 'Employee'} size="sm" />
        </Link>
      </div>
    </header>
  );
}
