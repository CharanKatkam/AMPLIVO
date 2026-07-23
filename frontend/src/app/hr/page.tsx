'use client';
import { useHrStore, useHrStats } from '@/store/hrStore';
import { AnalyticsCard } from '@/components/hr/AnalyticsCard';
import { Briefcase, Users, UserCheck, Calendar, Award, FileText } from 'lucide-react';
import Link from 'next/link';

export default function HRDashboard() {
  const stats = useHrStats();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>HR Dashboard</h1>
          <p className="text-slate-500">Overview of talent acquisition and recruitment.</p>
        </div>
        <Link href="/hr/jobs/create" className="bg-[#4C1D95] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3B1574] transition-colors shadow-sm">
          + Create Job
        </Link>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={<Briefcase size={20} />}
          trend="2 new this week"
          trendUp={true}
        />
        <AnalyticsCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<FileText size={20} />}
          trend="12% vs last month"
          trendUp={true}
        />
        <AnalyticsCard
          title="Shortlisted"
          value={stats.shortlistedCandidates}
          icon={<Users size={20} />}
          trend="5% conversion"
          trendUp={true}
        />
        <AnalyticsCard
          title="Interviews Today"
          value={stats.interviewsToday}
          icon={<Calendar size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recruitment Pipeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>Hiring Pipeline</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Total Applicants</span>
                <span className="text-slate-500">{stats.totalApplications}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-[#4C1D95] h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Shortlisted</span>
                <span className="text-slate-500">{stats.shortlistedCandidates}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${(stats.shortlistedCandidates / stats.totalApplications) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Interviewed</span>
                <span className="text-slate-500">80</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(80 / stats.totalApplications) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Hired</span>
                <span className="text-slate-500">{stats.hiredCandidates}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(stats.hiredCandidates / stats.totalApplications) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] rounded-2xl p-6 shadow-sm text-white">
            <h3 className="font-semibold mb-4 text-white/90">Time to Hire</h3>
            <div className="text-4xl font-bold mb-2">18 Days</div>
            <p className="text-sm text-white/75">Average across all departments</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>Recent Hires</h3>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-slate-600">
                +{stats.hiredCandidates - 5} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
