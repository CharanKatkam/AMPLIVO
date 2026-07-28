'use client';
import { JobForm } from '@/components/hr/JobForm';
import { useHrStore } from '@/store/hrStore';
import { Job } from '@/types/hr';
import { useRouter, useParams } from 'next/navigation';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobs = useHrStore(state => state.jobs);
  const updateJob = useHrStore(state => state.updateJob);

  const job = jobs.find(j => j.id === params.id);

  const handleSubmit = (data: Partial<Job>) => {
    if (!job) return;
    updateJob(job.id, data);
    router.push('/hr/jobs');
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

      <JobForm initialData={job} onSubmit={handleSubmit} />
    </div>
  );
}
