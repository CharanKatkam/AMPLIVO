'use client';

import { BlogPostInsight } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';

interface BlogInsightCardProps {
  insight?: BlogPostInsight;
}

export function BlogInsightCard({ insight }: BlogInsightCardProps) {
  if (!insight) return null;

  return (
    <div className="my-12 p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border border-slate-200/80 shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#4C1D95]/10 flex items-center justify-center text-[#4C1D95]">
          <BarChart3 size={18} />
        </div>
        <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
          Campaign Performance Insight
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: KPI Cards properly aligned */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">{insight.metricLabel1}</span>
              <span className="text-lg font-bold text-slate-900">{insight.metricValue1}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#4C1D95]/5 flex items-center justify-center text-[#4C1D95]">
              <Activity size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">{insight.metricLabel2}</span>
              <span className="text-lg font-bold text-slate-900">{insight.metricValue2}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/5 flex items-center justify-center text-[#06B6D4]">
              <TrendingUp size={16} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">{insight.metricLabel3}</span>
              <span className="text-lg font-bold text-slate-900">{insight.metricValue3}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#EC4899]/5 flex items-center justify-center text-[#EC4899]">
              <Activity size={16} />
            </div>
          </div>
        </div>

        {/* Center/Right Column: Chart & Text */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Container */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              {insight.chartLabel}
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insight.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4C1D95" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4C1D95" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                  />
                  <Area type="monotone" dataKey="value" stroke="#4C1D95" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strategic Analysis Text */}
          <div className="bg-slate-200/40 p-4 rounded-xl border border-slate-200/50">
            <p className="text-sm font-medium text-slate-700 leading-relaxed m-0">
              <span className="font-bold text-[#4C1D95]">Strategic Takeaway: </span>
              {insight.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
