'use client';
import { useHrStore } from '@/store/hrStore';
import { StatusChip } from '@/components/hr/StatusChip';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Copy, XCircle, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

export default function JobsPage() {
  const jobs = useHrStore(state => state.jobs);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Job Openings</h1>
          <p className="text-slate-500">Manage all job postings and drafts.</p>
        </div>
        <Link href="/hr/jobs/create" className="flex items-center gap-2 bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3B1574] transition-colors shadow-sm">
          <Plus size={18} /> Create Job
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title or department..."
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
                <th className="px-6 py-4 font-semibold">Job Title</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold text-center">Vacancies</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{job.title}</td>
                  <td className="px-6 py-4 text-slate-600">{job.department}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <div>{job.location}</div>
                    <div className="text-xs text-slate-400">{job.workMode}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">{job.vacancies}</td>
                  <td className="px-6 py-4">
                    <StatusChip status={job.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-[#4C1D95] rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-500 rounded-lg transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors" title="Duplicate">
                        <Copy size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition-colors" title="Close Job">
                        <XCircle size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No jobs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
