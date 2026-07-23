'use client';
import { JobForm } from '@/components/hr/JobForm';
import { useHrStore } from '@/store/hrStore';
import { Job } from '@/types/hr';
import { useRouter } from 'next/navigation';

export default function CreateJobPage() {
  const router = useRouter();
  const addJob = useHrStore(state => state.addJob);

  const handleSubmit = (data: Partial<Job>) => {
    // Generate mock ID and dates
    const newJob: Job = {
      ...data,
      id: `JOB-${Math.floor(Math.random() * 10000)}`,
      postedDate: new Date().toISOString().split('T')[0],
    } as Job;

    addJob(newJob);
    router.push('/hr/jobs');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Create Job Opening</h1>
        <p className="text-slate-500">Fill in the details to publish a new role.</p>
      </div>

      <JobForm onSubmit={handleSubmit} />
    </div>
  );
}
