'use client';
import { useState } from 'react';
import { JobForm } from '@/components/hr/JobForm';
import { useHrStore } from '@/store/hrStore';
import { useToastStore } from '@/store/toastStore';
import { Job } from '@/types/hr';
import { careersService } from '@/services/moduleServices';
import { useRouter } from 'next/navigation';

const STATUS_TO_BACKEND: Record<string, string> = { Published: 'open', Draft: 'draft', Closed: 'closed' };
const WORK_MODE_TO_BACKEND: Record<string, string> = { Remote: 'remote', Hybrid: 'hybrid', 'On-site': 'on_site' };
const EMPLOYMENT_TYPE_TO_BACKEND: Record<string, string> = {
  'Full-time': 'full_time', 'Part-time': 'part_time', Contract: 'contract', Freelance: 'freelance', Internship: 'internship',
};

export default function CreateJobPage() {
  const router = useRouter();
  const fetchJobs = useHrStore(state => state.fetchJobs);
  const showToast = useToastStore((s) => s.showToast);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: Partial<Job> & { departmentId?: string }) => {
    if (!data.departmentId) {
      showToast('Please select a department.', 'error');
      return;
    }
    setSaving(true);
    try {
      await careersService.createJob({
        title: data.title,
        department_id: data.departmentId,
        location: data.location || undefined,
        employment_type: EMPLOYMENT_TYPE_TO_BACKEND[data.employmentType || ''] || 'full_time',
        work_mode: WORK_MODE_TO_BACKEND[data.workMode || ''] || undefined,
        vacancies: data.vacancies || 1,
        skills_required: data.skillsRequired?.length ? data.skillsRequired : undefined,
        description: data.description || undefined,
        salary_range: data.salaryRange || undefined,
        status: STATUS_TO_BACKEND[data.status || 'Draft'] || 'draft',
      });
      await fetchJobs();
      showToast(`Job "${data.title}" created successfully!`, 'success');
      router.push('/hr/jobs');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create job opening.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Create Job Opening</h1>
        <p className="text-slate-500">Fill in the details to publish a new role.</p>
      </div>

      <JobForm onSubmit={handleSubmit} />
      {saving && <p className="text-sm text-slate-500">Saving…</p>}
    </div>
  );
}
