import React, { useEffect, useState } from 'react';
import { FileText, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MiniSparklineProps {
  color: string;
  points: string;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ color, points }) => {
  return (
    <svg className="w-20 h-10 overflow-visible" viewBox="0 0 80 40" fill="none">
      <defs>
        <linearGradient id={`rep-kpi-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={points}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
      {/* Soft glowing line behind */}
      <path
        d={points}
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
        filter="blur(3px)"
      />
    </svg>
  );
};

export const ReportsKPICards: React.FC = () => {
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedCritical, setAnimatedCritical] = useState(0);
  const [animatedTime, setAnimatedTime] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1200;

    const animateCounters = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedTotal(Math.round(ease * 42));
      setAnimatedCritical(Math.round(ease * 8));
      setAnimatedTime(Number((ease * 2.6).toFixed(1)));
      setAnimatedAccuracy(Math.round(ease * 98));

      if (progress < 1) {
        requestAnimationFrame(animateCounters);
      }
    };

    requestAnimationFrame(animateCounters);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {/* Card 1: Total Reports */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className="glass-card p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between group cursor-default border-[#C6F432]/25 hover:border-[#C6F432]/60 hover:shadow-[0_0_25px_rgba(198,244,50,0.2)]"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/40 flex items-center justify-center text-[#C6F432] shadow-[0_0_12px_rgba(198,244,50,0.25)]">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
            {animatedTotal}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">Total Reports</div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#C6F432]">
            <span>▲ +12%</span>
          </div>
          <MiniSparkline
            color="#C6F432"
            points="M 2 28 Q 18 10, 36 22 T 78 8"
          />
        </div>
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#C6F432]/10 blur-xl rounded-full pointer-events-none group-hover:bg-[#C6F432]/20 transition-colors" />
      </motion.div>

      {/* Card 2: Critical Reports */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className="glass-card p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between group cursor-default border-red-500/25 hover:border-red-500/60 hover:shadow-[0_0_25px_rgba(255,77,77,0.2)]"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center text-[#FF4D4D] shadow-[0_0_12px_rgba(255,77,77,0.25)]">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
            {animatedCritical}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">Critical Reports</div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#C6F432]">
            <span>▲ +1%</span>
          </div>
          <MiniSparkline
            color="#FF4D4D"
            points="M 2 26 Q 22 34, 42 16 T 78 12"
          />
        </div>
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-red-500/10 blur-xl rounded-full pointer-events-none group-hover:bg-red-500/20 transition-colors" />
      </motion.div>

      {/* Card 3: Avg. Report Time */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className="glass-card p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between group cursor-default border-amber-500/25 hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(255,176,32,0.2)]"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-[#FFB020] shadow-[0_0_12px_rgba(255,176,32,0.25)]">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
            {animatedTime} <span className="text-xl font-normal text-slate-300">hrs</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">Avg. Report Time</div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7CE04B]">
            <span>▼ -18%</span>
          </div>
          <MiniSparkline
            color="#FFB020"
            points="M 2 24 Q 24 12, 44 26 T 78 14"
          />
        </div>
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/10 blur-xl rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-colors" />
      </motion.div>

      {/* Card 4: Report Accuracy */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className="glass-card p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between group cursor-default border-emerald-500/25 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(124,224,75,0.2)]"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-[#7CE04B] shadow-[0_0_12px_rgba(124,224,75,0.25)]">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
            {animatedAccuracy}%
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">Report Accuracy</div>
        </div>

        <div className="flex items-end justify-between mt-3 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7CE04B]">
            <span>▲ +2%</span>
          </div>
          <MiniSparkline
            color="#7CE04B"
            points="M 2 30 Q 20 22, 40 18 T 78 10"
          />
        </div>
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
      </motion.div>
    </div>
  );
};
