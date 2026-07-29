'use client';

import { useCrmStore } from '@/store/crmStore';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { FolderKanban, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeProjects() {
  const { activeEmployeeId, getProjectsByEmployee } = useCrmStore();
  const projects = getProjectsByEmployee(activeEmployeeId || '');

  return (
    <div className="flex flex-col min-h-full">
      <EmployeeHeader title="My Projects" subtitle="Projects assigned to you" />
      
      <div className="p-6 max-w-7xl mx-auto w-full">
        {projects.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <FolderKanban className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Projects Assigned</h3>
            <p className="text-slate-500 text-sm">You don&apos;t have any active projects assigned to you at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                      {project.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                      project.status === 'SUBMITTED_BY_EMPLOYEE' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {project.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Client:</span>
                      <span className="font-medium text-slate-900">{project.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due Date:</span>
                      <span className="font-medium text-slate-900">{project.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Progress:</span>
                      <span className="font-medium text-slate-900">{project.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                  <Link href={`/employee/projects/${project.id}`} className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                    View Project <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
