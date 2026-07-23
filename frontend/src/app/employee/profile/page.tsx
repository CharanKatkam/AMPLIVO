'use client';

import { useCrmStore } from '@/store/crmStore';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Mail, Phone, MapPin, Briefcase, Calendar, Award } from 'lucide-react';

export default function EmployeeProfile() {
  const { activeEmployeeId, getEmployeeById, getProjectsByEmployee, getTasksByEmployee } = useCrmStore();
  const employee = getEmployeeById(activeEmployeeId || '');
  const projects = getProjectsByEmployee(activeEmployeeId || '');
  const tasks = getTasksByEmployee(activeEmployeeId || '');
  
  if (!employee) return <div>Please select an employee in Settings.</div>;

  return (
    <div className="flex flex-col min-h-full">
      <EmployeeHeader title="My Profile" subtitle="Manage your personal details" />
      
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
              <Avatar name={employee.name} size="lg" className="w-24 h-24 mb-4 text-3xl" />
              <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
              <p className="text-sm text-indigo-600 font-medium mb-1">{employee.role}</p>
              <p className="text-xs text-slate-500 mb-6">{employee.department}</p>
              
              <div className="w-full pt-6 border-t border-slate-100 space-y-4 text-sm text-left">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Joined {employee.joinDate}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-slate-400" /> Workload & Status
              </h3>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Current Workload</span>
                  <span className="font-medium text-slate-900">{employee.workloadPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    employee.workloadPercent > 80 ? 'bg-red-500' :
                    employee.workloadPercent > 50 ? 'bg-amber-500' : 'bg-green-500'
                  }`} style={{ width: `${employee.workloadPercent}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="font-medium px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">{employee.availability}</span>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">Skills & Expertise</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Current Responsibilities</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <div className="text-3xl font-bold text-slate-900 mb-1">{projects.length}</div>
                    <div className="text-sm text-slate-500 font-medium">Active Projects</div>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <div className="text-3xl font-bold text-slate-900 mb-1">{tasks.filter(t => t.status !== 'DONE').length}</div>
                    <div className="text-sm text-slate-500 font-medium">Active Tasks</div>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <div className="text-3xl font-bold text-slate-900 mb-1">{tasks.filter(t => t.status === 'DONE').length}</div>
                    <div className="text-sm text-slate-500 font-medium">Completed Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
