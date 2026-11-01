import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Globe, PieChart as PieIcon } from 'lucide-react';
import { threatSourcesData } from '../../data/mockData';

export const ThreatSourcesChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <PieIcon className="w-4 h-4" />
        </div>
        <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
          Threat Sources
        </h2>
      </div>

      {/* Donut and Legend Flex Container */}
      <div className="flex items-center justify-between gap-4 py-1">
        {/* Donut Chart with Center Globe */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={threatSourcesData}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationDuration={1200}
              >
                {threatSourcesData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      filter:
                        activeIndex === index
                          ? `drop-shadow(0 0 8px ${entry.color})`
                          : 'none',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center center',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Cyber Globe Wireframe Icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Globe className="w-7 h-7 text-slate-400" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 text-xs">
          {threatSourcesData.map((item, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer ${
                  isHovered ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full transition-transform"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: isHovered ? `0 0 8px ${item.color}` : 'none',
                      transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                  <span
                    className={`font-normal transition-colors ${
                      isHovered ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                <span
                  className="font-mono font-medium text-xs ml-2"
                  style={{ color: item.color }}
                >
                  {item.value}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
