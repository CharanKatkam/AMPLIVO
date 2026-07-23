'use client';

import React, { useState, useMemo } from 'react';
import {
  Search, Users, Briefcase, Activity, Target
} from 'lucide-react';
import { useCrmStore } from '@/store/crmStore';

export default function CrmEmployeesPage() {
  const { employees, projects } = useCrmStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');

  const roles = ['All', ...Array.from(new Set(employees.map(e => e.role)))];

  const filtered = useMemo(() => {
    return employees
      .filter(e => {
        const q = search.toLowerCase();
        const matchSearch = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q);
        const matchRole = roleFilter === 'All' || e.role === roleFilter;
        return matchSearch && matchRole;
      })
      .sort((a, b) => b.workloadPercent - a.workloadPercent);
  }, [employees, search, roleFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage team workload and assignments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2 bg-[#12141f] p-1 rounded-lg border border-white/5 overflow-x-auto scrollbar-hide">
          {roles.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                roleFilter === r
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#12141f] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-[#12141f] rounded-xl border border-white/5">
            No employees found.
          </div>
        )}
        {filtered.map(emp => {
          const empProjects = emp.currentProjectIds.map(id => projects.find(p => p.id === id)).filter(Boolean);
          
          return (
            <div key={emp.id} className="bg-[#12141f] border border-white/5 rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-[#12141f] flex items-center justify-center text-lg font-bold text-white">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{emp.name}</h3>
                    <p className="text-xs text-slate-500">{emp.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                  emp.availability === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  emp.availability === 'Busy' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {emp.availability}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Workload</span>
                    <span className={`font-medium ${emp.workloadPercent >= 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {emp.workloadPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        emp.workloadPercent >= 80 ? 'bg-red-500' : emp.workloadPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${emp.workloadPercent}%` }} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Active Projects ({empProjects.length})
                    </h4>
                  </div>
                  
                  <div className="space-y-2">
                    {empProjects.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No active projects</p>
                    ) : (
                      empProjects.slice(0, 3).map(p => (
                        <div key={p!.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg border border-white/5">
                          <span className="text-slate-300 truncate pr-2">{p!.name}</span>
                          <span className="text-violet-400 font-medium shrink-0">{p!.progress}%</span>
                        </div>
                      ))
                    )}
                    {empProjects.length > 3 && (
                      <p className="text-xs text-slate-500 text-center pt-1">+ {empProjects.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
