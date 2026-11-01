import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { RangeDropdown } from './RangeDropdown';
import type { RangeOption } from './RangeDropdown';
import { activityOverviewDataset } from '../../data/analytics';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomBarTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl bg-[#090D15]/95 border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.7)] backdrop-blur-md text-xs select-none min-w-[120px]">
        <div className="text-[10px] font-mono text-slate-400 pb-1 border-b border-white/10 flex justify-between">
          <span>{label}</span>
          <span className="text-[#C6F432]">SOC Logs</span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-slate-300">Activity Level</span>
          <span className="font-mono font-bold text-[#C6F432]">{payload[0].value}k</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ActivityOverviewCard: React.FC = () => {
  const [range, setRange] = useState<RangeOption>('Last 7 Days');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const data = activityOverviewDataset[range] || activityOverviewDataset['Last 7 Days'];

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-36 bg-[#7CE04B]/5 blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7CE04B]/10 border border-[#7CE04B]/30 flex items-center justify-center text-[#7CE04B] shadow-[0_0_15px_rgba(124,224,75,0.2)]">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
            Activity Overview
          </h2>
        </div>

        <RangeDropdown value={range} onChange={setRange} />
      </div>

      {/* Bar Chart */}
      <div className="w-full h-56 sm:h-64 relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
            onMouseMove={(state) => {
              if (state && typeof state.activeTooltipIndex === 'number') {
                setHoveredBarIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredBarIndex(null)}
          >
            <defs>
              <linearGradient id="activityBarGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6F432" stopOpacity={0.95} />
                <stop offset="60%" stopColor="#7CE04B" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#2E6A20" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="activityBarHoverGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.95} />
                <stop offset="30%" stopColor="#C6F432" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#7CE04B" stopOpacity={0.7} />
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
              domain={[0, 30]}
              ticks={[0, 10, 20, 30]}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

            <Bar
              dataKey="activity"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              animationDuration={850}
            >
              {data.map((_, index) => {
                const isHovered = hoveredBarIndex === index;
                return (
                  <Cell
                    key={`bar-${index}`}
                    fill={isHovered ? 'url(#activityBarHoverGrad)' : 'url(#activityBarGreenGrad)'}
                    filter={isHovered ? 'drop-shadow(0 0 10px rgba(198,244,50,0.6))' : 'none'}
                    className="transition-all duration-200"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
