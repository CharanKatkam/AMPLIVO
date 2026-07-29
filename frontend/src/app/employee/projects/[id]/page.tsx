'use client';

import { use } from 'react';
import { useCrmStore } from '@/store/crmStore';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { FolderKanban, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function EmployeeProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { getProjectById, activeEmployeeId, tasks, submissions } = useCrmStore();
  
  const project = getProjectById(id);
  
  if (!project) return notFound();
  
  const isAssigned = project.assignedEmployeeIds.includes(activeEmployeeId || '');
  if (!isAssigned) {
    return (
      <div className="flex flex-col min-h-full">
        <EmployeeHeader title="Access Denied" />
        <div className="p-8 text-center text-red-600 font-bold">You are not assigned to this project.</div>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === id && t.assignedEmployeeId === activeEmployeeId);
  const projectSubmissions = submissions.filter(s => s.projectId === id && s.employeeId === activeEmployeeId);

  return (
    <div className="flex flex-col min-h-full">
      <EmployeeHeader title={project.name} subtitle={project.clientName} />
      
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <Link href="/employee/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-2">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Project Overview</h2>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">{project.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div className="font-semibold text-slate-900">{project.status.replace(/_/g, ' ')}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Priority</div>
                  <div className="font-semibold text-slate-900">{project.priority}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Due Date</div>
                  <div className="font-semibold text-slate-900">{project.endDate}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Progress</div>
                  <div className="font-semibold text-slate-900">{project.progress}%</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">My Tasks</h2>
              {projectTasks.length === 0 ? (
                <div className="text-sm text-slate-500">No tasks assigned to you for this project.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {projectTasks.map(task => (
                    <div key={task.id} className="py-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{task.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{task.dueDate} • {task.status.replace(/_/g, ' ')}</div>
                      </div>
                      <Link href={`/employee/tasks`} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100">
                        View Task
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">My Submissions</h2>
              {projectSubmissions.length === 0 ? (
                <div className="text-sm text-slate-500">You haven&apos;t submitted any work yet.</div>
              ) : (
                <div className="space-y-4">
                  {projectSubmissions.map(sub => (
                    <div key={sub.id} className="p-3 border border-slate-200 rounded-lg">
                      <div className="font-medium text-sm text-slate-900">{sub.title}</div>
                      <div className="text-xs mt-1 text-slate-500">Status: {sub.currentStatus.replace(/_/g, ' ')}</div>
                      <Link href={`/employee/submit?id=${sub.id}`} className="mt-2 text-indigo-600 text-xs font-medium hover:underline block">
                        View Submission
                      </Link>
                    </div>
                  ))}
                </div>
              )}
              <Link href={`/employee/submit?projectId=${project.id}`} className="mt-4 w-full flex justify-center items-center py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                Submit Work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
