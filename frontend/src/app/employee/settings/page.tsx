'use client';

import { useState, useEffect } from 'react';
import { useCrmStore } from '@/store/crmStore';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { Settings, User, Bell, Mail, Monitor, Trash2, ShieldAlert, Save } from 'lucide-react';

export default function EmployeeSettings() {
  const { activeEmployeeId, employees, updateEmployee, theme, setTheme } = useCrmStore();
  const activeEmployee = employees.find(e => e.id === activeEmployeeId);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    skills: '',
  });
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (activeEmployee) {
      setFormData({
        firstName: activeEmployee.firstName,
        lastName: activeEmployee.lastName,
        email: activeEmployee.email,
        skills: activeEmployee.skills.join(', '),
      });
    }
  }, [activeEmployee]);

  const handleSaveProfile = () => {
    if (activeEmployeeId) {
      updateEmployee(activeEmployeeId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleReset = () => {
    // Just a UI demo for resetting store/persisted data
    localStorage.removeItem('amplivo-crm-store');
    window.location.href = '/employee';
  };

  return (
    <div className="flex flex-col min-h-full">
      <EmployeeHeader title="Settings" subtitle="Manage your portal preferences" />
      
      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Edit Profile Form */}
        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/50 flex items-center gap-3">
            <User className="text-indigo-600" size={20} />
            <h3 className="font-bold text-indigo-900">Edit Profile</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                  placeholder="React, Node.js, Design"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleSaveProfile}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                  isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Save size={16} /> {isSaved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
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
