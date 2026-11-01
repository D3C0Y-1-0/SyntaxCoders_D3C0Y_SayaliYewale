import React, { useEffect, useState } from 'react';
import { Shield, Target, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export const HeroSection: React.FC = () => {
  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      {/* Title & Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-1"
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white leading-[1.08]">
          <span>Stay Ahead. </span>
          <br />
          <span className="italic font-normal text-[#C6F432] drop-shadow-[0_0_20px_rgba(198,244,50,0.35)]">
            Stay Secure.
          </span>
        </h1>
        <p className="text-sm md:text-base text-[#9AA0A6] font-light max-w-md pt-2">
          Real-time threat intelligence for a safer digital world.
        </p>
      </motion.div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
        {/* Card 1: Total Threats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="glass-card p-4 sm:p-4.5 relative overflow-hidden flex flex-col justify-between group cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/30 flex items-center justify-center text-[#C6F432] shadow-[0_0_12px_rgba(198,244,50,0.2)]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-semibold text-white tracking-tight">
              <CountUp end={12847} />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Total Threats</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12%</span>
            </div>
          </div>
          {/* Subtle top-right glow */}
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#C6F432]/10 blur-xl rounded-full pointer-events-none group-hover:bg-[#C6F432]/20 transition-colors" />
        </motion.div>

        {/* Card 2: Active Threats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="glass-card p-4 sm:p-4.5 relative overflow-hidden flex flex-col justify-between group cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-semibold text-white tracking-tight">
              <CountUp end={843} />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Active Threats</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+8%</span>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 blur-xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
        </motion.div>

        {/* Card 3: Blocked Rate */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="glass-card p-4 sm:p-4.5 relative overflow-hidden flex flex-col justify-between group cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-semibold text-white tracking-tight">
              <CountUp end={98.7} decimals={1} suffix="%" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Blocked</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+2%</span>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-500/10 blur-xl rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
        </motion.div>

        {/* Card 4: Avg Response Time */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -3, transition: { duration: 0.15 } }}
          className="glass-card p-4 sm:p-4.5 relative overflow-hidden flex flex-col justify-between group cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-display font-semibold text-white tracking-tight">
              <CountUp end={24} suffix="ms" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Avg Response</div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 mt-2">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-6%</span>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-purple-500/10 blur-xl rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
        </motion.div>
      </div>
    </div>
  );
};
