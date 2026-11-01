import React, { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { riskTrendData } from '../../data/threats';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTrendTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-1.5 rounded-xl bg-[#090D14]/95 border border-[#C6F432]/50 shadow-[0_4px_20px_rgba(198,244,50,0.25)] backdrop-blur-md">
        <div className="text-[11px] font-bold text-white tracking-wide flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432]" />
          <span>Risk Index: {payload[0].value}</span>
        </div>
        <div className="text-[9px] text-slate-400 font-mono mt-0.5">{label}</div>
      </div>
    );
  }
  return null;
};

export const RiskTrendCard: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'Last 7 Days' | 'Last 24 Hours' | 'Last 30 Days'>('Last 7 Days');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const data = riskTrendData[selectedRange] || riskTrendData['Last 7 Days'];

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative">
      {/* Header with Sparkle and Dropdown */}
      <div className="flex items-center justify-between mb-2 relative z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C6F432]" />
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
            Risk Trend
          </h2>
        </div>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{selectedRange}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute right-0 mt-2 w-36 py-1 rounded-xl bg-[#0B101D]/95 border border-white/15 shadow-xl backdrop-blur-xl z-50 text-xs"
              >
                {(['Last 7 Days', 'Last 24 Hours', 'Last 30 Days'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setSelectedRange(range);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-white/[0.08] transition-colors cursor-pointer ${
                      selectedRange === range ? 'text-[#C6F432] font-semibold' : 'text-slate-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-44 sm:h-48 relative pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -26, bottom: 0 }}>
            <defs>
              <linearGradient id="limeTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6F432" stopOpacity={0.35} />
                <stop offset="70%" stopColor="#C6F432" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#C6F432" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 10 }}
              domain={[0, 30]}
              ticks={[0, 10, 20, 30]}
            />
            <Tooltip content={<CustomTrendTooltip />} />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#C6F432"
              strokeWidth={2.4}
              fillOpacity={1}
              fill="url(#limeTrendGrad)"
              activeDot={{
                r: 6,
                fill: '#C6F432',
                stroke: '#05070A',
                strokeWidth: 2,
                className: 'shadow-[0_0_12px_#C6F432]',
              }}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
