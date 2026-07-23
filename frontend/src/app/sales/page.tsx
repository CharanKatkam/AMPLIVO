'use client';
import { SalesHeader } from '@/components/sales/SalesSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { LeadStatusBadge } from '@/components/sales/LeadStatusBadge';
import { ActivityFeed } from '@/components/sales/ActivityFeed';
import { useSalesStore } from '@/store/salesStore';
import { salesMonthlyData } from '@/data/sales';
import {
  Users, CalendarDays, Clock, Trophy, XCircle, TrendingUp, Zap,
  ArrowRight, Video, Phone, MapPin, Monitor,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const MeetingTypeIcon = ({ type }: { type: string }) => {
  if (type === 'Video Call') return <Video size={14} />;
  if (type === 'Phone Call') return <Phone size={14} />;
  if (type === 'In-Person') return <MapPin size={14} />;
  return <Monitor size={14} />;
};

export default function SalesDashboard() {
  const { leads, meetings } = useSalesStore();

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const today = new Date().toISOString().split('T')[0];
  const meetingsToday = meetings.filter((m) => m.date === today && m.status === 'Scheduled').length;
  const pendingMeetings = meetings.filter((m) => m.status === 'Scheduled').length;
  const wonLeads = leads.filter((l) => l.status === 'Won' || l.status === 'Ready for CRM').length;
  const lostLeads = leads.filter((l) => l.status === 'Lost').length;

  const upcomingMeetings = meetings
    .filter((m) => m.status === 'Scheduled')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 4);

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Gather all timeline events for recent activity feed
  const allEvents = leads.flatMap((l) =>
    l.timeline.map((e) => ({ ...e, leadName: `${l.firstName} ${l.lastName}`, company: l.company }))
  );
  const recentActivity = allEvents
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
    .slice(0, 8);

  const pipelineValue = leads
    .filter((l) => !['Lost', 'Ready for CRM'].includes(l.status))
    .reduce((sum, l) => sum + l.budget, 0);

  return (
    <div>
      <SalesHeader
        title="Sales Dashboard"
        subtitle="Pipeline Overview"
        actions={
          <Link
            href="/sales/leads"
            className="flex items-center gap-2 px-4 py-2 bg-[#4C1D95] text-white rounded-xl text-sm font-semibold hover:bg-[#3b1574] transition-colors"
          >
            <Zap size={15} /> View All Leads
          </Link>
        }
      />

      <div className="p-6 space-y-6 max-w-[1600px]">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Leads"
            value={String(totalLeads)}
            icon={<Users size={20} />}
            iconColor="#4C1D95"
            trend={true}
            trendValue="+4 this week"
          />
          <StatCard
            label="New Leads"
            value={String(newLeads)}
            icon={<Zap size={20} />}
            iconColor="#06B6D4"
            trend={true}
            trendValue="Today"
          />
          <StatCard
            label="Meetings Today"
            value={String(meetingsToday)}
            icon={<CalendarDays size={20} />}
            iconColor="#7C3AED"
            trend={null}
          />
          <StatCard
            label="Pending Meetings"
            value={String(pendingMeetings)}
            icon={<Clock size={20} />}
            iconColor="#F59E0B"
            trend={null}
          />
          <StatCard
            label="Won Leads"
            value={String(wonLeads)}
            icon={<Trophy size={20} />}
            iconColor="#10B981"
            trend={true}
            trendValue="+2 this month"
          />
          <StatCard
            label="Lost Leads"
            value={String(lostLeads)}
            icon={<XCircle size={20} />}
            iconColor="#EF4444"
            trend={false}
            trendValue="1 this month"
          />
        </div>

        {/* Pipeline Value Banner */}
        <div className="bg-gradient-to-r from-[#4C1D95] via-[#7C3AED] to-[#06B6D4] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-white/70 text-sm font-medium mb-1">Active Pipeline Value</div>
              <div className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ₹{(pipelineValue / 100000).toFixed(1)}L
              </div>
              <div className="text-white/60 text-xs mt-1">Across {leads.filter((l) => !['Lost', 'Ready for CRM'].includes(l.status)).length} active deals</div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-sm mb-1">Avg. Deal Size</div>
              <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ₹{Math.round(pipelineValue / Math.max(1, leads.filter((l) => !['Lost', 'Ready for CRM'].includes(l.status)).length) / 1000).toFixed(0)}K
              </div>
            </div>
            <TrendingUp size={80} className="text-white/10 absolute right-6 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Charts + Upcoming Meetings Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly Lead Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900">Lead Pipeline (Monthly)</h3>
                <p className="text-xs text-slate-400 mt-0.5">New leads vs Won vs Lost</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesMonthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="newLeads" name="New Leads" fill="#DDD6FE" radius={[4, 4, 0, 0]} />
                <Bar dataKey="won" name="Won" fill="#4C1D95" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" name="Lost" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-4 justify-center">
              {[{ color: '#DDD6FE', label: 'New Leads' }, { color: '#4C1D95', label: 'Won' }, { color: '#FCA5A5', label: 'Lost' }].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Upcoming Meetings</h3>
              <Link href="/sales/meetings" className="text-xs font-semibold text-[#4C1D95] hover:underline flex items-center gap-1">
                View All <ArrowRight size={11} />
              </Link>
            </div>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No upcoming meetings</div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-[#4C1D95] flex-shrink-0">
                      <MeetingTypeIcon type={meeting.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm truncate">{meeting.leadName}</div>
                      <div className="text-xs text-slate-500 truncate">{meeting.company}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CalendarDays size={10} className="text-slate-400" />
                        <span className="text-[10px] text-slate-500">{meeting.date}</span>
                        <Clock size={10} className="text-slate-400 ml-1" />
                        <span className="text-[10px] text-slate-500">{meeting.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads + Activity Feed Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Recent Leads</h3>
              <Link href="/sales/leads" className="text-xs font-semibold text-[#4C1D95] hover:underline flex items-center gap-1">
                All Leads <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/sales/leads/${lead.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4C1D95] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">{lead.firstName} {lead.lastName}</div>
                    <div className="text-xs text-slate-500 truncate">{lead.company} · {lead.source}</div>
                  </div>
                  <div className="text-right">
                    <LeadStatusBadge status={lead.status} size="sm" />
                    <div className="text-xs text-slate-400 mt-1">₹{(lead.budget / 1000).toFixed(0)}K</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-5">Recent Activity</h3>
            <ActivityFeed events={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
