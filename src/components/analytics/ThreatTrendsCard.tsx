import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RangeDropdown } from './RangeDropdown';
import type { RangeOption } from './RangeDropdown';
import { threatTrendsDataset } from '../../data/analytics';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; stroke: string }>;
  label?: string;
}

const CustomTrendsTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.find((p) => p.dataKey === 'total')?.value || 0;
    const critical = payload.find((p) => p.dataKey === 'critical')?.value || 0;

    return (
      <div className="px-3.5 py-2.5 rounded-2xl bg-[#090D15]/95 border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl select-none text-xs space-y-1.5 min-w-[140px]">
        <div className="font-mono text-slate-400 text-[10px] pb-1 border-b border-white/10 flex justify-between">
          <span>{label}</span>
          <span className="text-white font-semibold">Incident Telemetry</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#C6F432]" />
            <span>Total Threats</span>
          </span>
          <span className="font-mono font-bold text-white">{total}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#4F8CFF]" />
            <span>Critical Threats</span>
          </span>
          <span className="font-mono font-bold text-[#4F8CFF]">{critical}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom peak dot with halo
const RenderDot = (color: string) => (props: any) => {
  const { cx, cy, index } = props;
  if (!cx || !cy) return null;

  return (
    <g key={`dot-${index}-${color}`}>
      <circle cx={cx} cy={cy} r={4.5} fill={color} opacity={0.3} />
      <circle cx={cx} cy={cy} r={3} fill={color} stroke="#05070A" strokeWidth={1.5} />
    </g>
  );
};

export const ThreatTrendsCard: React.FC = () => {
  const [range, setRange] = useState<RangeOption>('Last 7 Days');
  const data = threatTrendsDataset[range] || threatTrendsDataset['Last 7 Days'];

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-36 bg-[#C6F432]/5 blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/30 flex items-center justify-center text-[#C6F432] shadow-[0_0_15px_rgba(198,244,50,0.25)]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
            Threat Trends
          </h2>
        </div>

        {/* Legend and Dropdown */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C6F432] shadow-[0_0_6px_#C6F432]" />
              <span className="text-[11px] text-slate-300">Total Threats</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4F8CFF] shadow-[0_0_6px_#4F8CFF]" />
              <span className="text-[11px] text-slate-300">Critical Threats</span>
            </span>
          </div>

          <RangeDropdown value={range} onChange={setRange} />
        </div>
      </div>

      {/* Dual Line / Area Chart */}
      <div className="w-full h-56 sm:h-64 relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
            <defs>
              {/* Lime gradient */}
              <linearGradient id="trendsLimeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6F432" stopOpacity={0.28} />
                <stop offset="60%" stopColor="#C6F432" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#C6F432" stopOpacity={0.0} />
              </linearGradient>
              {/* Blue gradient */}
              <linearGradient id="trendsBlueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F8CFF" stopOpacity={0.25} />
                <stop offset="60%" stopColor="#4F8CFF" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#4F8CFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#FFFFFF"
              strokeOpacity={0.05}
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              domain={[0, 40]}
              ticks={[0, 10, 20, 30, 40]}
            />
            <Tooltip content={<CustomTrendsTooltip />} />

            {/* Total Threats Area Line (Lime) */}
            <Area
              type="monotone"
              dataKey="total"
              stroke="#C6F432"
              strokeWidth={2.6}
              fillOpacity={1}
              fill="url(#trendsLimeGrad)"
              dot={RenderDot('#C6F432')}
              activeDot={{
                r: 6,
                fill: '#C6F432',
                stroke: '#05070A',
                strokeWidth: 2,
                className: 'shadow-[0_0_12px_#C6F432]',
              }}
              animationDuration={900}
            />

            {/* Critical Threats Area Line (Blue) */}
            <Area
              type="monotone"
              dataKey="critical"
              stroke="#4F8CFF"
              strokeWidth={2.4}
              fillOpacity={1}
              fill="url(#trendsBlueGrad)"
              dot={RenderDot('#4F8CFF')}
              activeDot={{
                r: 6,
                fill: '#4F8CFF',
                stroke: '#05070A',
                strokeWidth: 2,
                className: 'shadow-[0_0_12px_#4F8CFF]',
              }}
              animationDuration={1100}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
