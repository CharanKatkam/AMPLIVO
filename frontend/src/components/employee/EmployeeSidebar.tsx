'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, CheckSquare, UploadCloud, Bell, User, Settings, LogOut, Zap
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { useCrmStore } from '@/store/crmStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee' },
  { icon: FolderKanban, label: 'My Projects', href: '/employee/projects' },
  { icon: CheckSquare, label: 'My Tasks', href: '/employee/tasks' },
  { icon: UploadCloud, label: 'Submit Work', href: '/employee/submit' },
  { icon: Bell, label: 'Notifications', href: '/employee/notifications' },
  { icon: User, label: 'Profile', href: '/employee/profile' },
];

export function EmployeeSidebar() {
  const pathname = usePathname();
  const { activeEmployeeId, getEmployeeById } = useCrmStore();
  const employee = getEmployeeById(activeEmployeeId || '');

  return (
    <aside className="w-64 flex-shrink-0 bg-[#111827] flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#1F2937]">
        <div className="w-8 h-8 rounded-lg bg-[#4C1D95] flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>Amplivo</span>
          <div className="text-[#4B5563] text-[10px]">Employee Portal</div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <Avatar name={employee?.name || 'Employee'} size="sm" />
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{employee?.name || 'Employee'}</div>
            <div className="text-[#4B5563] text-xs truncate">{employee?.role || 'Staff'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/employee');
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
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#1F2937]">
        <div className="flex gap-2">
          <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-red-400 transition-all text-xs flex-1">
            <LogOut size={14} /> Sign Out
          </Link>
          <Link href="/employee/settings" className={`flex items-center justify-center w-9 h-9 rounded-[10px] transition-all ${pathname === '/employee/settings' ? 'bg-[#4C1D95] text-white' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}`}>
            <Settings size={15} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
