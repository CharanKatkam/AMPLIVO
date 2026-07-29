'use client';
import { useHrStore } from '@/store/hrStore';
import { InterviewCalendar } from '@/components/hr/InterviewCalendar';
import { useState } from 'react';

export default function InterviewsPage() {
  const interviews = useHrStore(state => state.interviews);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'All'>('Upcoming');

  const filteredInterviews = interviews.filter(int => {
    if (activeTab === 'Upcoming') return int.status === 'Scheduled' || int.status === 'Rescheduled';
    if (activeTab === 'Completed') return int.status === 'Completed';
    return true;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Interviews</h1>
        <p className="text-slate-500">Manage and track candidate interviews.</p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['Upcoming', 'Completed', 'All'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'Upcoming' | 'Completed' | 'All')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-[#4C1D95] text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <InterviewCalendar interviews={filteredInterviews} />
    </div>
  );
}
