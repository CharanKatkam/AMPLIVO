'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line,
} from 'recharts';

// ─── Performance Area Chart ────────────────────────────────────────────────────
interface PerformanceChartProps {
  data: { month: string; revenue: number; adSpend: number }[];
  height?: number;
}
export function PerformanceChart({ data, height = 220 }: PerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gImp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4C1D95" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4C1D95" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gClk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString()}`, name]}
        />
        <Area type="monotone" dataKey="revenue" stroke="#4C1D95" strokeWidth={2} fill="url(#gImp)" name="Revenue" />
        <Area type="monotone" dataKey="adSpend" stroke="#06B6D4" strokeWidth={2} fill="url(#gClk)" name="Ad Spend" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Channel Bar Chart ────────────────────────────────────────────────────────
interface ChannelChartProps {
  data: { channel: string; value: number; color: string }[];
  height?: number;
}
export function ChannelChart({ data, height = 150 }: ChannelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
        <XAxis dataKey="channel" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Share %">
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Revenue Bar Chart ────────────────────────────────────────────────────────
interface RevenueChartProps {
  data: { month: string; revenue: number }[];
  height?: number;
}
export function RevenueChart({ data, height = 180 }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`₹${v}L`, 'Revenue']}
        />
        <Bar dataKey="revenue" radius={[8, 8, 0, 0]} name="Revenue">
          {data.map((_, i) => (
            <Cell key={i} fill={i === data.length - 1 ? '#4C1D95' : '#DDD6FE'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Lead Source Donut Chart ──────────────────────────────────────────────────
interface LeadSourceChartProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
}
export function LeadSourceChart({ data, height = 160 }: LeadSourceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── SEO Traffic Line Chart ───────────────────────────────────────────────────
interface SEOChartProps {
  data: { month: string; traffic: number; position: number }[];
  height?: number;
}
export function SEOChart({ data, height = 200 }: SEOChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
        <Line type="monotone" dataKey="traffic" stroke="#4C1D95" strokeWidth={2.5} dot={{ fill: '#4C1D95', r: 4 }} name="Organic Traffic" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Spend Area Chart ─────────────────────────────────────────────────────────
interface SpendChartProps {
  data: { month: string; spend: number }[];
  height?: number;
}
export function SpendChart({ data, height = 180 }: SpendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`₹${v}L`, 'Ad Spend']}
        />
        <Area type="monotone" dataKey="spend" stroke="#EC4899" strokeWidth={2} fill="url(#gSpend)" name="Ad Spend" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
