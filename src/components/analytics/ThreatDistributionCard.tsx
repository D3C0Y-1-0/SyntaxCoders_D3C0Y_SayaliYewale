import React, { useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { threatDistributionData, type DistributionSegment } from '../../data/analytics';
import { useThreats } from '../../context/ThreatContext';

export const ThreatDistributionCard: React.FC = () => {
  const { stats } = useThreats();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // If stats from ThreatContext exists, ensure counts align
  const totalCount = stats?.total || 24;

  const activeSegment: DistributionSegment | null =
    activeIndex !== null ? threatDistributionData[activeIndex] : null;

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-[#7CE04B]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-[#7CE04B]/10 border border-[#7CE04B]/30 flex items-center justify-center text-[#7CE04B] shadow-[0_0_15px_rgba(124,224,75,0.25)]">
          <PieChartIcon className="w-4 h-4" />
        </div>
        <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
          Threat Distribution
        </h2>
      </div>

      {/* Main Content: Donut + Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto pt-2">
        {/* Donut Chart Container */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DistributionSegment;
                    return (
                      <div className="px-3 py-1.5 rounded-xl bg-[#090D15]/95 border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md text-xs">
                        <div className="font-semibold text-white">{data.name}</div>
                        <div className="text-[11px] text-slate-300">
                          {data.count} incidents ({data.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={threatDistributionData}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={78}
                paddingAngle={3}
                stroke="#090D15"
                strokeWidth={2}
                animationDuration={1000}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {threatDistributionData.map((entry, index) => {
                  const isHovered = activeIndex === index;
                  const isAnyHovered = activeIndex !== null;

                  return (
                    <Cell
                      key={`segment-${entry.name}`}
                      fill={entry.color}
                      opacity={isAnyHovered ? (isHovered ? 1 : 0.4) : 1}
                      className="transition-opacity duration-200 cursor-pointer outline-none"
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 10px ${entry.color})` : 'none',
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: 'center center',
                        transition: 'transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease',
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Summary */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <motion.div
              key={activeSegment ? activeSegment.name : 'total'}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div
                className="text-3xl sm:text-4xl font-display font-semibold tracking-tight"
                style={{ color: activeSegment ? activeSegment.color : '#FFFFFF' }}
              >
                {activeSegment ? activeSegment.count : totalCount}
              </div>
              <div className="text-xs text-slate-400 font-medium tracking-wide">
                {activeSegment ? activeSegment.name : 'Total'}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 w-full sm:w-auto min-w-[140px]">
          {threatDistributionData.map((item, index) => {
            const isHovered = activeIndex === index;
            const isAnyHovered = activeIndex !== null;

            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between gap-4 p-1.5 px-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  isHovered
                    ? 'bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                    : isAnyHovered
                    ? 'opacity-40'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Colored Dot + Label */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: isHovered ? `0 0 10px ${item.color}` : 'none',
                      transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isHovered ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>

                {/* Percentage */}
                <span className="font-mono text-xs text-slate-300 font-medium">
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
