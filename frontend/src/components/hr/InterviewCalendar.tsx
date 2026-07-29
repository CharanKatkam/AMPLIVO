'use client';
import { Interview } from '@/types/hr';
import { StatusChip } from './StatusChip';
import { Calendar as CalendarIcon, Clock, Video, User } from 'lucide-react';

interface InterviewCalendarProps {
  interviews: Interview[];
}

export function InterviewCalendar({ interviews }: InterviewCalendarProps) {
  // Simple list view for interviews grouped by date
  const sorted = [...interviews].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="space-y-4">
      {sorted.map(interview => (
        <div key={interview.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between md:items-center">
          
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col items-center justify-center bg-slate-50 w-16 h-16 rounded-xl border border-slate-100 flex-shrink-0">
              <span className="text-xs text-slate-500 font-medium uppercase">{new Date(interview.date).toLocaleString('default', { month: 'short' })}</span>
              <span className="text-xl font-bold text-[#4C1D95]">{new Date(interview.date).getDate()}</span>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-800 text-lg">{interview.candidateName}</h4>
                <StatusChip status={interview.status} />
              </div>
              <div className="text-slate-500 text-sm font-medium mb-3">{interview.jobTitle} • {interview.department}</div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <Clock size={14} className="text-[#EC4899]" />
                  {interview.time}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <User size={14} className="text-blue-500" />
                  {interview.interviewer}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <CalendarIcon size={14} className="text-emerald-500" />
                  {interview.type} Round
                </div>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-2 w-full md:w-auto">
            {interview.status === 'Scheduled' && (
              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#4C1D95] hover:bg-[#3B1574] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                <Video size={16} /> Join Meeting
              </a>
            )}
            <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors">
              View Details
            </button>
          </div>
          
        </div>
      ))}
      
      {sorted.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Interviews Scheduled</h3>
          <p className="text-slate-500">There are no upcoming interviews matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
