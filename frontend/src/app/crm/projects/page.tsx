'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, FolderKanban, Clock, CheckCircle,
  Eye, UserPlus, Calendar, AlertCircle
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

export default function CrmProjectsPage() {
  const { projects, employees, clients } = useCrmStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return projects
      .filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          p.name.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q) ||
          p.services.join(', ').toLowerCase().includes(q);
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [projects, search, statusFilter]);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'In Progress').length,
    waiting: projects.filter(p => p.status === 'Waiting Assignment').length,
    completed: projects.filter(p => p.status === 'Completed').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage deliverables and team assignments</p>
        </div>
      </div>

      {/* Stats/Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2 bg-[#12141f] p-1 rounded-lg border border-white/5 overflow-x-auto scrollbar-hide">
          {['All', 'Waiting Assignment', 'Assigned', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#12141f] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-[#12141f] rounded-xl border border-white/5">
            No projects found.
          </div>
        )}
        {filtered.map(project => {
          const client = clients.find(c => c.id === project.clientId);
          
          return (
            <div key={project.id} className="bg-[#12141f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-base font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{project.company}</p>
                </div>
                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  project.status === 'Waiting Assignment' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {project.status}
                </span>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all ${project.status === 'Completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
                      style={{ width: `${project.progress}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.assignedEmployeeIds.length === 0 ? (
                      <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center bg-white/5 text-slate-500">
                        <UserPlus className="w-3 h-3" />
                      </div>
                    ) : (
                      <>
                        {project.assignedEmployeeIds.slice(0, 4).map((id, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#12141f] flex items-center justify-center text-xs font-bold text-white relative z-10 hover:z-20 hover:scale-110 transition-transform cursor-pointer" title={employees.find(e => e.id === id)?.name}>
                            {employees.find(e => e.id === id)?.name.charAt(0) || 'U'}
                          </div>
                        ))}
                        {project.assignedEmployeeIds.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#12141f] flex items-center justify-center text-[10px] font-bold text-slate-300 relative z-10">
                            +{project.assignedEmployeeIds.length - 4}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Deadline</p>
                    <p className="text-xs font-medium text-white">{project.endDate}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400">
                  {project.services.join(', ')}
                </span>
                <Link
                  href={`/crm/projects/${project.id}`}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  Manage <Eye className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
