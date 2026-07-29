'use client';
import { useEffect, useState } from 'react';
import { JobForm } from '@/components/hr/JobForm';
import { useHrStore } from '@/store/hrStore';
import { useToastStore } from '@/store/toastStore';
import { Job } from '@/types/hr';
import { careersService } from '@/services/moduleServices';
import { useRouter, useParams } from 'next/navigation';

const STATUS_TO_BACKEND: Record<string, string> = { Published: 'open', Draft: 'draft', Closed: 'closed' };
const WORK_MODE_TO_BACKEND: Record<string, string> = { Remote: 'remote', Hybrid: 'hybrid', 'On-site': 'on_site' };
const EMPLOYMENT_TYPE_TO_BACKEND: Record<string, string> = {
  'Full-time': 'full_time', 'Part-time': 'part_time', Contract: 'contract', Freelance: 'freelance', Internship: 'internship',
};

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobs = useHrStore(state => state.jobs);
  const departments = useHrStore(state => state.departments);
  const fetchJobs = useHrStore(state => state.fetchJobs);
  const showToast = useToastStore((s) => s.showToast);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (jobs.length === 0) fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const job = jobs.find(j => j.id === params.id);
  const initialDepartmentId = departments.find(d => d.name === job?.department)?.id;

  const handleSubmit = async (data: Partial<Job> & { departmentId?: string }) => {
    if (!job) return;
    setSaving(true);
    try {
      await careersService.updateJob(job.id, {
        title: data.title,
        department_id: data.departmentId || undefined,
        location: data.location || undefined,
        employment_type: EMPLOYMENT_TYPE_TO_BACKEND[data.employmentType || ''] || undefined,
        work_mode: WORK_MODE_TO_BACKEND[data.workMode || ''] || undefined,
        vacancies: data.vacancies,
        skills_required: data.skillsRequired?.length ? data.skillsRequired : undefined,
        description: data.description || undefined,
        salary_range: data.salaryRange || undefined,
        status: STATUS_TO_BACKEND[data.status || ''] || undefined,
      });
      await fetchJobs();
      showToast(`Job "${data.title}" updated successfully!`, 'success');
      router.push('/hr/jobs');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update job opening.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!job) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-slate-500">Job not found. It may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Edit Job Opening</h1>
        <p className="text-slate-500">Update the details for this role.</p>
      </div>

      <JobForm initialData={job} initialDepartmentId={initialDepartmentId} onSubmit={handleSubmit} />
      {saving && <p className="text-sm text-slate-500">Saving…</p>}
    </div>
  );
}
