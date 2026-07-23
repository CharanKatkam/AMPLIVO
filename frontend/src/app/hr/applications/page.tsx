'use client';
import { useHrStore } from '@/store/hrStore';
import { ApplicationsTable } from '@/components/hr/ApplicationsTable';

export default function ApplicationsPage() {
  const applications = useHrStore(state => state.applications);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Applications</h1>
        <p className="text-slate-500">Review and manage all candidate applications.</p>
      </div>

      <ApplicationsTable applications={applications} />
    </div>
  );
}
