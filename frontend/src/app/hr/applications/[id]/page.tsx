'use client';
import { useHrStore } from '@/store/hrStore';
import { notFound, useParams, useRouter } from 'next/navigation';
import { StatusChip } from '@/components/hr/StatusChip';
import { ApplicationStatus } from '@/types/hr';
import { ArrowLeft, Download, Mail, Calendar, Check, X, User, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function CandidateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const applications = useHrStore(state => state.applications);
  const updateStatus = useHrStore(state => state.updateApplicationStatus);
  const addInterview = useHrStore(state => state.addInterview);
  
  const application = applications.find(a => a.id === id);

  if (!application) {
    return notFound();
  }

  const handleStatusChange = (status: ApplicationStatus) => {
    updateStatus(application.id, status);
  };

  const handleScheduleInterview = () => {
    addInterview({
      // eslint-disable-next-line react-hooks/purity
      id: `INT-${Math.floor(Math.random() * 10000)}`,
      applicationId: application.id,
      candidateName: application.candidateName,
      jobTitle: application.jobTitle,
      jobId: application.jobId,
      interviewer: 'Sarah Manager',
      department: application.department,
      type: 'Technical',
      // eslint-disable-next-line react-hooks/purity
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
      time: '10:00 AM',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'Scheduled',
    });
    handleStatusChange('Interviewing');
    alert('Interview scheduled mock successfully!');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Link href="/hr/applications" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#4C1D95] transition-colors font-medium text-sm mb-2">
        <ArrowLeft size={16} /> Back to Applications
      </Link>
      
      {/* Header Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#EC4899] flex items-center justify-center text-white font-bold text-2xl shadow-md">
            {application.candidateName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
              {application.candidateName}
            </h1>
            <div className="text-slate-500 font-medium">Applied for <span className="text-[#4C1D95]">{application.jobTitle}</span></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <StatusChip status={application.status} />
          
          {application.status === 'New' && (
            <button onClick={() => handleStatusChange('Shortlisted')} className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
              <Check size={16} /> Shortlist
            </button>
          )}
          
          {(application.status === 'Shortlisted' || application.status === 'Screening') && (
            <button onClick={handleScheduleInterview} className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
              <Calendar size={16} /> Schedule Interview
            </button>
          )}
          
          {(application.status !== 'Hired' && application.status !== 'Rejected') && (
            <button onClick={() => handleStatusChange('Rejected')} className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
              <X size={16} /> Reject
            </button>
          )}
          
          {application.status === 'Interviewing' && (
            <button onClick={() => handleStatusChange('Offered')} className="px-4 py-2 bg-[#4C1D95] text-white hover:bg-[#3B1574] rounded-xl text-sm font-semibold transition-colors shadow-sm">
              Generate Offer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Experience */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              <Briefcase size={20} className="text-[#EC4899]" /> Work Experience
            </h2>
            <div className="space-y-6">
              {application.workHistory.map((work, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#EC4899]"></div>
                  <h3 className="font-semibold text-slate-800">{work.title}</h3>
                  <div className="text-slate-500 text-sm font-medium">{work.company} • {work.duration}</div>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    Responsible for leading key projects and collaborating with cross-functional teams to deliver high-quality software solutions.
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Education */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              <GraduationCap size={20} className="text-[#4C1D95]" /> Education
            </h2>
            <div className="space-y-6">
              {application.education.map((edu, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#4C1D95]"></div>
                  <h3 className="font-semibold text-slate-800">{edu.degree}</h3>
                  <div className="text-slate-500 text-sm font-medium">{edu.institution} • {edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Contact Details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Email</div>
                <div className="text-sm text-slate-700 flex items-center justify-between">
                  {application.email}
                  <button className="text-[#4C1D95] hover:text-[#3B1574]"><Mail size={16} /></button>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Phone</div>
                <div className="text-sm text-slate-700">{application.phone}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Portfolio</div>
                <div className="text-sm text-[#4C1D95] hover:underline cursor-pointer">
                  {application.portfolioUrl || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {application.skills.map((skill, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Documents</h3>
            <button className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-3">
              <Download size={16} /> Download Resume
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Download size={16} /> Cover Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
