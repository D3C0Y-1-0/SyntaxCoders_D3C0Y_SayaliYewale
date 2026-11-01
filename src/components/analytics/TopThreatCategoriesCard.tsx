import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { topThreatCategoriesData, type ThreatCategory } from '../../data/analytics';

const categoryGradients: Record<string, string> = {
  Malware: 'linear-gradient(90deg, #7CE04B 0%, #C6F432 100%)',
  Phishing: 'linear-gradient(90deg, #38BDF8 0%, #4F8CFF 100%)',
  'Suspicious Login': 'linear-gradient(90deg, #E6C8A0 0%, #F59E0B 100%)',
  Others: 'linear-gradient(90deg, #C084FC 0%, #8B5CF6 100%)',
};

const categoryGlows: Record<string, string> = {
  Malware: 'rgba(198, 244, 50, 0.35)',
  Phishing: 'rgba(79, 140, 255, 0.35)',
  'Suspicious Login': 'rgba(245, 158, 11, 0.35)',
  Others: 'rgba(139, 92, 246, 0.35)',
};

export const TopThreatCategoriesCard: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<ThreatCategory | null>(null);

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute bottom-0 left-10 w-44 h-32 bg-[#C6F432]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#C6F432] shadow-[0_0_15px_rgba(198,244,50,0.15)]">
          <LayoutGrid className="w-4 h-4" />
        </div>
        <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
          Top Threat Categories
        </h2>
      </div>

      {/* Progress Bars List */}
      <div className="space-y-4 my-auto pt-1 relative z-10">
        {topThreatCategoriesData.map((cat) => {
          const isHovered = hoveredCategory?.name === cat.name;

          return (
            <div
              key={cat.name}
              className="group/item relative cursor-default"
              onMouseEnter={() => setHoveredCategory(cat)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-200 group-hover/item:text-white transition-colors">
                  {cat.name}
                </span>
                <span className="font-mono text-slate-300 font-semibold group-hover/item:text-white transition-colors">
                  {cat.percentage}%
                </span>
              </div>

              {/* Progress Trough */}
              <div className="w-full h-3 rounded-full bg-white/[0.06] border border-white/5 overflow-hidden p-0.5 relative">
                <motion.div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    background: categoryGradients[cat.name] || 'linear-gradient(90deg, #7CE04B, #C6F432)',
                    boxShadow: isHovered
                      ? `0 0 12px ${categoryGlows[cat.name] || 'rgba(198,244,50,0.5)'}`
                      : 'none',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percentage}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }}
                />
              </div>

              {/* Hover Floating Tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: -2, scale: 1 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute right-12 -top-7 px-2.5 py-1 rounded-lg bg-[#090D15]/95 border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-md text-[11px] text-white pointer-events-none whitespace-nowrap z-20"
                >
                  <span className="font-semibold text-[#C6F432]">{cat.count}</span> incidents (
                  {cat.percentage}% of total)
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
