import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

const timeRanges = ['1h', '6h', '24h', '7d'] as const;
type TimeRange = typeof timeRanges[number];

// High-fidelity telemetry data
const activityDatasets: Record<TimeRange, { time: string; threats: number; delta: string }[]> = {
  '1h': [
    { time: '10:00', threats: 620, delta: '+4%' },
    { time: '10:10', threats: 740, delta: '+6%' },
    { time: '10:20', threats: 890, delta: '+9%' },
    { time: '10:30', threats: 1240, delta: '+14%' },
    { time: '10:40', threats: 1050, delta: '-5%' },
    { time: '10:50', threats: 920, delta: '-8%' },
    { time: '11:00', threats: 980, delta: '+3%' },
  ],
  '6h': [
    { time: '05:00', threats: 480, delta: '-2%' },
    { time: '06:00', threats: 760, delta: '+8%' },
    { time: '07:00', threats: 640, delta: '-4%' },
    { time: '08:00', threats: 820, delta: '+11%' },
    { time: '09:00', threats: 1240, delta: '+16%' },
    { time: '10:00', threats: 1020, delta: '-6%' },
    { time: '11:00', threats: 910, delta: '-3%' },
  ],
  '24h': [
    { time: '00:00', threats: 560, delta: '-5%' },
    { time: '04:00', threats: 820, delta: '+12%' },
    { time: '08:00', threats: 610, delta: '-8%' },
    { time: '12:00', threats: 1240, delta: '+18%' },
    { time: '16:00', threats: 930, delta: '-7%' },
    { time: '20:00', threats: 1110, delta: '+10%' },
    { time: '24:00', threats: 843, delta: '-9%' },
  ],
  '7d': [
    { time: 'Mon', threats: 8900, delta: '+4%' },
    { time: 'Tue', threats: 10400, delta: '+8%' },
    { time: 'Wed', threats: 12847, delta: '+15%' },
    { time: 'Thu', threats: 11200, delta: '-6%' },
    { time: 'Fri', threats: 13500, delta: '+12%' },
    { time: 'Sat', threats: 9200, delta: '-14%' },
    { time: 'Sun', threats: 8430, delta: '-5%' },
  ],
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { time: string; threats: number; delta: string } }>;
  label?: string;
}

const CustomActivityTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-3 py-2 rounded-xl bg-[#090D14]/95 border border-[#C6F432]/60 shadow-[0_4px_24px_rgba(198,244,50,0.3)] backdrop-blur-md select-none">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-white">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C6F432] animate-pulse" />
            <span>{payload[0].value.toLocaleString()} Threats</span>
          </span>
          <span className="font-mono text-[#C6F432] text-[10px]">{data.delta}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-white/10">
          <span>{label}</span>
          <span>98.7% Filtered</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom rendered dot on the line peaks
const RenderCustomDot = (props: any) => {
  const { cx, cy, index } = props;
  if (!cx || !cy) return null;

  // Highlight every point with a crisp glowing cyber dot
  const isKeyPeak = index === 3; // 12:00 peak

  return (
    <g key={`dot-${index}`}>
      {/* Outer halo */}
      <circle
        cx={cx}
        cy={cy}
        r={isKeyPeak ? 6 : 4}
        fill="#C6F432"
        opacity={isKeyPeak ? 0.35 : 0.2}
      />
      {/* Solid center dot */}
      <circle
        cx={cx}
        cy={cy}
        r={isKeyPeak ? 4 : 3}
        fill="#C6F432"
        stroke="#05070A"
        strokeWidth={1.5}
      />
    </g>
  );
};

export const ThreatActivityChart: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24h');
  const data = activityDatasets[selectedRange];

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-32 bg-[#C6F432]/5 blur-3xl pointer-events-none" />

      {/* Card Header with Time Toggles */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/30 flex items-center justify-center text-[#C6F432] shadow-[0_0_15px_rgba(198,244,50,0.25)]">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
            Threat Activity
          </h2>
        </div>

        {/* Time Filter Pills matching screenshot */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/10 text-xs">
          {timeRanges.map((range) => {
            const isActive = selectedRange === range;
            return (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`relative px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'text-black font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeThreatRangePill"
                    className="absolute inset-0 rounded-full bg-[#C6F432] shadow-[0_0_14px_rgba(198,244,50,0.5)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{range}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Peak Badge matching screenshot: [ 1,240 | Threats ] above the 12:00 peak */}
      {selectedRange === '24h' && (
        <div className="absolute top-16 left-1/2 transform -translate-x-4 sm:-translate-x-6 z-20 pointer-events-none animate-pulse">
          <div className="relative px-2.5 py-1 rounded-xl bg-[#090D14]/95 border border-[#C6F432]/70 shadow-[0_0_16px_rgba(198,244,50,0.35)] flex flex-col items-center">
            <span className="text-xs font-mono font-bold text-white tracking-tight">1,240</span>
            <span className="text-[9px] text-[#C6F432] uppercase tracking-wider font-semibold -mt-0.5">Threats</span>
            {/* Tiny arrow pointing down to peak */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#090D14] border-r border-b border-[#C6F432]/70 transform rotate-45" />
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full h-44 sm:h-52 relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 22, right: 10, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="limeRealisticThreatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C6F432" stopOpacity={0.48} />
                <stop offset="35%" stopColor="#C6F432" stopOpacity={0.22} />
                <stop offset="75%" stopColor="#C6F432" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#C6F432" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => {
                if (v >= 1000) return `${(v / 1000).toFixed(1).replace('.0', '')}K`;
                return v;
              }}
              domain={[0, 1600]}
              ticks={[0, 500, 1000, 1500]}
            />
            <Tooltip content={<CustomActivityTooltip />} />

            <Area
              type="monotone"
              dataKey="threats"
              stroke="#C6F432"
              strokeWidth={2.8}
              fillOpacity={1}
              fill="url(#limeRealisticThreatGrad)"
              dot={<RenderCustomDot />}
              activeDot={{
                r: 7,
                fill: '#C6F432',
                stroke: '#05070A',
                strokeWidth: 2,
                className: 'shadow-[0_0_16px_#C6F432]',
              }}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
