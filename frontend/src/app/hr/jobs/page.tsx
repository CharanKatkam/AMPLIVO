'use client';
import { useHrStore } from '@/store/hrStore';
import { StatusChip } from '@/components/hr/StatusChip';
import { ConfirmDialog } from '@/components/hr/ConfirmDialog';
import { JobViewModal } from '@/components/hr/JobViewModal';
import { Job, JobStatus } from '@/types/hr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Edit, Copy, XCircle, Trash2, Eye, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const STATUS_OPTIONS: JobStatus[] = ['Published', 'Draft', 'Closed'];

export default function JobsPage() {
  const router = useRouter();
  const jobs = useHrStore(state => state.jobs);
  const addJob = useHrStore(state => state.addJob);
  const updateJob = useHrStore(state => state.updateJob);
  const deleteJob = useHrStore(state => state.deleteJob);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'close' | 'delete'; job: Job } | null>(null);

  const departments = useMemo(() => Array.from(new Set(jobs.map(j => j.department))).sort(), [jobs]);
  const locations = useMemo(() => Array.from(new Set(jobs.map(j => j.location).filter(Boolean))).sort(), [jobs]);

  const activeFilterCount = (statusFilter !== 'All' ? 1 : 0) + (departmentFilter !== 'All' ? 1 : 0) + (locationFilter !== 'All' ? 1 : 0);

  const filteredJobs = jobs.filter(job =>
    (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || job.status === statusFilter) &&
    (departmentFilter === 'All' || job.department === departmentFilter) &&
    (locationFilter === 'All' || job.location === locationFilter)
  );

  const clearFilters = () => {
    setStatusFilter('All');
    setDepartmentFilter('All');
    setLocationFilter('All');
  };

  const handleDuplicate = (job: Job) => {
    const duplicate: Job = {
      ...job,
      id: `JOB-${Math.floor(Math.random() * 10000)}`,
      title: `${job.title} (Copy)`,
      status: 'Draft',
      postedDate: new Date().toISOString().split('T')[0],
    };
    addJob(duplicate);
  };

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
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-[#4C1D95]/5 border-[#4C1D95]/30 text-[#4C1D95]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-[#4C1D95] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'All' | JobStatus)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] min-w-[140px]"
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] min-w-[140px]"
              >
                <option value="All">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4C1D95]/20 focus:border-[#4C1D95] min-w-[140px]"
              >
                <option value="All">All Locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        )}

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
                      <button
                        onClick={() => setViewJob(job)}
                        className="p-2 text-slate-400 hover:text-[#4C1D95] rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => router.push(`/hr/jobs/${job.id}/edit`)}
                        className="p-2 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(job)}
                        className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ type: 'close', job })}
                        disabled={job.status === 'Closed'}
                        className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Close Job"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ type: 'delete', job })}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Delete"
                      >
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

      {viewJob && <JobViewModal job={viewJob} onClose={() => setViewJob(null)} />}

      {confirmDialog && confirmDialog.type === 'close' && (
        <ConfirmDialog
          title="Close this job posting?"
          message={`"${confirmDialog.job.title}" will be marked as Closed and hidden from active listings. You can still find it under the Closed status filter.`}
          confirmLabel="Close Job"
          onConfirm={() => updateJob(confirmDialog.job.id, { status: 'Closed' })}
          onClose={() => setConfirmDialog(null)}
        />
      )}

      {confirmDialog && confirmDialog.type === 'delete' && (
        <ConfirmDialog
          title="Delete this job posting?"
          message={`"${confirmDialog.job.title}" will be permanently deleted. This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => deleteJob(confirmDialog.job.id)}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
