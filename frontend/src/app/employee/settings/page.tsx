'use client';

import { useCrmStore } from '@/store/crmStore';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { Settings, User, Bell, Mail, Monitor, Trash2, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmployeeSettings() {
  const router = useRouter();
  const { activeEmployeeId, setActiveEmployee, employees } = useCrmStore();

  const handleReset = () => {
    // Just a UI demo for resetting store/persisted data
    localStorage.removeItem('amplivo-crm-store');
    window.location.href = '/employee';
  };

  return (
    <div className="flex flex-col min-h-full">
      <EmployeeHeader title="Settings" subtitle="Manage your portal preferences" />
      
      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Demo Switcher */}
        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/50 flex items-center gap-3">
            <User className="text-indigo-600" size={20} />
            <h3 className="font-bold text-indigo-900">Demo Employee Switcher</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-4">
              Select which employee to simulate. This updates the active user across the Employee Portal.
            </p>
            <select
              value={activeEmployeeId || ''}
              onChange={(e) => {
                setActiveEmployee(e.target.value);
                router.refresh();
              }}
              className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Preferences</h3>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-slate-400" size={20} />
                <div>
                  <div className="font-medium text-slate-900 text-sm">Push Notifications</div>
                  <div className="text-xs text-slate-500">Receive alerts for new tasks and feedback.</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="text-slate-400" size={20} />
                <div>
                  <div className="font-medium text-slate-900 text-sm">Email Digest</div>
                  <div className="text-xs text-slate-500">Receive daily summary of tasks and deadlines.</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="text-slate-400" size={20} />
                <div>
                  <div className="font-medium text-slate-900 text-sm">Theme Preference</div>
                  <div className="text-xs text-slate-500">System, Light, or Dark mode.</div>
                </div>
              </div>
              <select className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none">
                <option>System Default</option>
                <option>Light Mode</option>
                <option>Dark Mode</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={18} />
            <h3 className="font-bold text-red-900">Danger Zone</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="font-medium text-red-900 text-sm">Reset Demo Data</div>
              <div className="text-xs text-red-700 mt-1">This will clear localStorage and reload default mock state for CRM and Employee Portals.</div>
            </div>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} /> Reset Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
