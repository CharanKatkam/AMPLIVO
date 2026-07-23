'use client';
import { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const trafficData = [
  { month: 'Jan', organic: 18000, paid: 9000 },
  { month: 'Feb', organic: 22000, paid: 11000 },
  { month: 'Mar', organic: 28000, paid: 13000 },
  { month: 'Apr', organic: 35000, paid: 15000 },
  { month: 'May', organic: 42000, paid: 18000 },
  { month: 'Jun', organic: 56000, paid: 21000 },
  { month: 'Jul', organic: 68000, paid: 24000 },
  { month: 'Aug', organic: 79000, paid: 26000 },
];

const roiData = [
  { channel: 'SEO', roi: 340 },
  { channel: 'Meta Ads', roi: 280 },
  { channel: 'Google Ads', roi: 260 },
  { channel: 'Email', roi: 420 },
  { channel: 'Content', roi: 310 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a0540]/95 backdrop-blur-md border border-white/10 rounded-xl p-3 text-xs text-white shadow-xl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{Number(p.value).toLocaleString()}{p.name === 'ROI' ? '%' : ''}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ChartsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#0f0528] py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-bold px-4 py-2 rounded-full mb-4 uppercase tracking-widest">
            Live Performance Data
          </span>
          <h2
            className="text-3xl lg:text-4xl font-bold text-white"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Results That Speak for Themselves
          </h2>
          <p className="text-white/60 mt-3 max-w-lg mx-auto">
            Average client performance benchmarks across 250+ active campaigns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Area Chart — Traffic Growth */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Organic vs Paid Traffic Growth
                </h3>
                <p className="text-white/50 text-xs mt-0.5">Monthly sessions across client portfolio</p>
              </div>
              <span className="text-[#10B981] font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>+339%</span>
            </div>
            <div className="h-52">
              {visible && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="organic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="paid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="organic" name="Organic" stroke="#7C3AED" strokeWidth={2} fill="url(#organic)" dot={false} />
                    <Area type="monotone" dataKey="paid" name="Paid" stroke="#06B6D4" strokeWidth={2} fill="url(#paid)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex gap-5 mt-4">
              <span className="flex items-center gap-1.5 text-white/60 text-xs"><span className="w-3 h-1 rounded-full bg-[#7C3AED] inline-block" />Organic</span>
              <span className="flex items-center gap-1.5 text-white/60 text-xs"><span className="w-3 h-1 rounded-full bg-[#06B6D4] inline-block" />Paid</span>
            </div>
          </div>

          {/* Bar Chart — ROI by Channel */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Average ROI by Channel
                </h3>
                <p className="text-white/50 text-xs mt-0.5">Return on ad spend — client average</p>
              </div>
              <span className="text-[#F59E0B] font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>340% avg</span>
            </div>
            <div className="h-52">
              {visible && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="channel" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#ffffff40', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="roi" name="ROI" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={1200}>
                      {roiData.map((_, i) => (
                        <rect
                          key={i}
                          fill={`hsl(${260 + i * 20}, 75%, ${55 + i * 3}%)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
