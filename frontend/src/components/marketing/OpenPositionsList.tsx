'use client';
import { useHrStore } from '@/store/hrStore';
import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

export function OpenPositionsList() {
  const jobs = useHrStore(state => state.jobs);
  
  // Filter for Published jobs only
  const activeJobs = jobs.filter(job => job.status === 'Published');

  if (activeJobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">No Open Roles Currently</h3>
        <p className="text-slate-500">Check back later or follow us on LinkedIn for updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeJobs.map((job, i) => (
        <AnimateOnScroll key={job.id} animation="fade-up" delay={i * 70}>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#4C1D95]/30 hover:shadow-lg transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-[#4C1D95] bg-[#4C1D95]/10 px-2.5 py-1 rounded-full">{job.department}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>{job.title}</h3>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} /> {job.employmentType}</span>
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:bg-[#4C1D95] hover:text-white transition-all whitespace-nowrap">
              Apply Now <ArrowRight size={16} />
            </button>
          </div>
        </AnimateOnScroll>
      ))}
    </div>
  );
}
