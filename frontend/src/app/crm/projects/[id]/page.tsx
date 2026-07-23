'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, FolderKanban, CheckCircle, Clock, Calendar,
  Building2, Users, Target, UserPlus
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

export default function CrmProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    getProjectById, getClientById, employees, 
    completeMilestone, updateProjectProgress, updateProjectStatus,
    assignEmployeesToProject
  } = useCrmStore();
  
  const project = getProjectById(params.id as string);
  const client = project ? getClientById(project.clientId) : null;
  
  const [showAssign, setShowAssign] = useState(false);
  const [selectedEmps, setSelectedEmps] = useState<string[]>(project?.assignedEmployeeIds || []);

  if (!project) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>Project not found.</p>
        <button onClick={() => router.push('/crm/projects')} className="mt-4 text-violet-400 hover:underline">
          Back to Projects
        </button>
      </div>
    );
  }

  const handleSaveAssign = () => {
    assignEmployeesToProject(project.id, selectedEmps);
    setShowAssign(false);
  };

  const handleCompleteMilestone = (mId: string) => {
    completeMilestone(project.id, mId);
    
    // Auto-update progress based on milestones
    const updated = getProjectById(project.id);
    if (updated) {
      const completed = updated.milestones.filter(m => m.completed).length;
      const total = updated.milestones.length;
      const newProg = total > 0 ? Math.round((completed / total) * 100) : 0;
      updateProjectProgress(project.id, newProg);
      
      if (newProg === 100) {
        updateProjectStatus(project.id, 'Completed');
      } else if (newProg > 0 && updated.status !== 'In Progress') {
        updateProjectStatus(project.id, 'In Progress');
      }
    }
  };

  const assignedEmpsFull = employees.filter(e => project.assignedEmployeeIds.includes(e.id));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/crm/projects" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${
                  project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  project.status === 'Waiting Assignment' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {project.company} · {project.services.join(', ')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500">Progress</p>
                <p className="text-lg font-bold text-violet-400">{project.progress}%</p>
              </div>
              <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all ${project.status === 'Completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
                  style={{ width: `${project.progress}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Details & Team */}
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-[#12141f] border border-white/5 rounded-xl p-5 space-y-4">
            {client && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <Link href={`/crm/clients/${client.id}`} className="text-sm font-medium text-white hover:text-violet-400 transition-colors">
                    {client.company}
                  </Link>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Start Date</p>
                <p className="text-sm font-medium text-white">{project.startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Deadline</p>
                <p className="text-sm font-medium text-white">{project.endDate}</p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-[#12141f] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                Project Team
              </h2>
              <button onClick={() => setShowAssign(!showAssign)} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <UserPlus className="w-3 h-3" /> Assign
              </button>
            </div>
            
            {showAssign ? (
              <div className="space-y-3 mb-4">
                <div className="h-48 overflow-y-auto pr-2 space-y-1">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEmps.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedEmps([...selectedEmps, emp.id]);
                          else setSelectedEmps(selectedEmps.filter(id => id !== emp.id));
                        }}
                        className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-[10px] ${emp.workloadPercent >= 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {emp.workloadPercent}% load
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveAssign} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium py-2 rounded transition-colors">
                    Save Team
                  </button>
                  <button onClick={() => setShowAssign(false)} className="px-3 bg-white/5 text-slate-400 hover:bg-white/10 text-xs font-medium py-2 rounded transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedEmpsFull.map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{emp.name}</p>
                      <p className="text-[10px] text-slate-500">{emp.role}</p>
                    </div>
                  </div>
                ))}
                {assignedEmpsFull.length === 0 && (
                  <div className="text-center py-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
                    No employees assigned.<br/>Click assign to add team members.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12141f] border border-white/5 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" />
              Project Milestones
            </h2>
            
            <div className="space-y-0">
              {project.milestones.map((m, idx) => (
                <div key={m.id} className="relative flex gap-4 pb-6 last:pb-0 group">
                  {idx !== project.milestones.length - 1 && (
                    <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${m.completed ? 'bg-violet-500' : 'bg-white/10'}`} />
                  )}
                  <div className="shrink-0 mt-1 relative z-10">
                    {m.completed ? (
                      <CheckCircle className="w-6 h-6 text-violet-500 bg-[#12141f] rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-white/20 bg-[#12141f]" />
                    )}
                  </div>
                  <div className={`flex-1 p-4 rounded-xl border transition-colors ${
                    m.completed ? 'bg-violet-500/5 border-violet-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className={`font-semibold ${m.completed ? 'text-violet-300' : 'text-white'}`}>{m.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">Due: {m.dueDate}</p>
                      </div>
                      {!m.completed && (
                        <button 
                          onClick={() => handleCompleteMilestone(m.id)}
                          className="shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-lg transition-colors border border-white/10"
                        >
                          Mark Complete
                        </button>
                      )}
                      {m.completed && m.completedAt && (
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{m.completedAt}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {project.milestones.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">No milestones defined for this project.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
