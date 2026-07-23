'use client';
import { useState } from 'react';
import { Application } from '@/types/hr';
import { StatusChip } from './StatusChip';
import Link from 'next/link';
import { Search, Filter, Eye, MoreVertical } from 'lucide-react';

interface ApplicationsTableProps {
  applications: Application[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = applications.filter(app => 
    app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, roles, or departments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95]"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-semibold">Candidate</th>
              <th className="px-6 py-4 font-semibold">Applied Position</th>
              <th className="px-6 py-4 font-semibold">Experience</th>
              <th className="px-6 py-4 font-semibold">Applied Date</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map(app => (
              <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#EC4899] flex items-center justify-center text-white font-bold text-xs">
                      {app.candidateName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{app.candidateName}</div>
                      <div className="text-slate-500 text-xs">{app.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{app.jobTitle}</div>
                  <div className="text-slate-500 text-xs">{app.department}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{app.experience}</td>
                <td className="px-6 py-4 text-slate-600">{new Date(app.appliedDate).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <StatusChip status={app.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/hr/applications/${app.id}`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#4C1D95] hover:bg-[#4C1D95]/10 rounded-lg transition-colors">
                    <Eye size={18} />
                  </Link>
                  <button className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No applications found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
