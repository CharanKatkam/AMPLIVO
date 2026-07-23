'use client';

import { useCrmStore } from '@/store/crmStore';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { 
  FolderKanban, CheckSquare, Clock, AlertTriangle, AlertCircle, FileText, ArrowRight, UploadCloud
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const { 
    activeEmployeeId, getEmployeeById, getProjectsByEmployee, getTasksByEmployee,
    submissions, notifications, activityLogs
  } = useCrmStore();

  const employee = getEmployeeById(activeEmployeeId || '');
  const projects = getProjectsByEmployee(activeEmployeeId || '');
  const tasks = getTasksByEmployee(activeEmployeeId || '');
  const activeTasks = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'TODO');
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');
  const mySubmissions = submissions.filter(s => s.employeeId === activeEmployeeId);
  const pendingReview = mySubmissions.filter(s => s.currentStatus === 'PENDING_CRM_REVIEW');
  const revisionRequests = mySubmissions.filter(s => s.currentStatus === 'CRM_CHANGES_REQUESTED');
  
  const myNotifications = notifications.filter(n => !n.read).slice(0, 5);
  const myActivity = activityLogs.filter(a => a.employeeId === activeEmployeeId).slice(0, 5);

  if (!employee) return <div>No employee active. Please select one in Settings.</div>;

  return (
    <div className="flex flex-col min-h-full">
      <EmployeeHeader title="Dashboard" subtitle={`Welcome back, ${employee.name}`} />
      
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-500 text-xs font-medium">Assigned Projects</div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-500 text-xs font-medium">Active Tasks</div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckSquare size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeTasks.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-500 text-xs font-medium">Pending Review</div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{pendingReview.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-slate-500 text-xs font-medium">Revisions Needed</div>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{revisionRequests.length}</div>
          </div>
        </div>

        {/* Quick Actions & Revisions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            
            {revisionRequests.length > 0 && (
              <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                <h3 className="text-red-800 font-bold mb-3 flex items-center gap-2">
                  <AlertCircle size={18} /> Revision Requests from CRM
                </h3>
                <div className="space-y-3">
                  {revisionRequests.map(sub => (
                    <div key={sub.id} className="bg-white p-4 rounded-lg border border-red-200 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{sub.title}</div>
                        <div className="text-xs text-slate-500">{projects.find(p => p.id === sub.projectId)?.name}</div>
                      </div>
                      <Link href={`/employee/submit?id=${sub.id}`} className="px-4 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 font-medium">
                        View Feedback & Resubmit
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Active Tasks</h2>
                <Link href="/employee/tasks" className="text-indigo-600 text-xs font-medium hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {activeTasks.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No active tasks.</div>
                ) : (
                  activeTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{task.title}</div>
                        <div className="text-xs text-slate-500">{task.projectName}</div>
                      </div>
                      <Link href="/employee/tasks" className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="font-bold text-slate-900">Quick Actions</h2>
              </div>
              <div className="p-5 space-y-3">
                <Link href="/employee/projects" className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <FolderKanban size={16} className="text-indigo-600" /> View My Projects
                  </div>
                </Link>
                <Link href="/employee/tasks" className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-indigo-600" /> View My Tasks
                  </div>
                </Link>
                <Link href="/employee/submit" className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
                  <div className="flex items-center gap-2">
                    <UploadCloud size={16} /> Submit Work
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Notifications</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {myNotifications.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 text-xs">No unread notifications.</div>
                ) : (
                  myNotifications.map(n => (
                    <div key={n.id} className="p-4 flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{n.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{n.date} {n.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
