import React from 'react';
import { ShieldCheck, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SecurityStatusCard: React.FC = () => {
  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group relative overflow-hidden select-none border-[#C6F432]/30 hover:border-[#C6F432]/60 shadow-[0_0_30px_rgba(198,244,50,0.1)]">
      {/* Rich Green Gradient Ambient Glows */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#C6F432]/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-72 h-44 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

      {/* Flowing Luminous Neon Lime & Emerald Aurora Wave Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-85 select-none overflow-hidden">
        <svg
          viewBox="0 0 600 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <defs>
            {/* Bright Neon Lime & Emerald Wave Gradient */}
            <linearGradient id="auroraLimeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C6F432" stopOpacity="0" />
              <stop offset="25%" stopColor="#C6F432" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#10B981" stopOpacity="0.95" />
              <stop offset="90%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#C6F432" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="auroraEmeraldFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C6F432" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#05070A" stopOpacity="0" />
            </linearGradient>

            <filter id="greenGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Green Aurora Ribbon Mesh Fill */}
          <path
            d="M -40 180 C 120 220, 220 80, 360 130 C 460 170, 520 70, 640 110 L 640 240 L -40 240 Z"
            fill="url(#auroraEmeraldFill)"
          />

          {/* Main Primary Glowing Lime Wave Ribbon */}
          <path
            d="M -40 170 C 120 210, 210 90, 350 135 C 450 170, 520 70, 640 105"
            stroke="url(#auroraLimeGrad)"
            strokeWidth="3.2"
            filter="url(#greenGlowFilter)"
            className="animate-wave"
          />

          {/* Secondary Emerald Flow Line */}
          <path
            d="M -20 190 C 140 150, 240 210, 370 110 C 460 50, 520 135, 620 150"
            stroke="#10B981"
            strokeWidth="2.2"
            opacity="0.85"
            className="animate-wave"
            style={{ animationDuration: '30s', animationDirection: 'reverse' }}
          />

          {/* Tertiary Dotted Accent Arc */}
          <path
            d="M 10 150 C 160 170, 250 80, 400 150 C 480 195, 540 90, 620 125"
            stroke="#C6F432"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C6F432]/15 border border-[#C6F432]/50 flex items-center justify-center text-[#C6F432] shadow-[0_0_18px_rgba(198,244,50,0.35)]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
            Security Status
          </h2>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/40 text-[#C6F432] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Defence</span>
        </div>
      </div>

      {/* Content Body & Animated Vibrant Green Checkmark */}
      <div className="flex items-center justify-between gap-6 py-3 relative z-10">
        <div className="space-y-1.5 max-w-sm">
          <div className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight leading-tight">
            <span>All </span>
            <span className="text-[#C6F432] italic font-normal drop-shadow-[0_0_20px_rgba(198,244,50,0.6)]">
              Systems Secure
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-light">
            No critical threats at the moment.
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-[#C6F432] animate-ping" />
            <span>100% Defense Perimeter Armed • 0 Active Intrusions</span>
          </div>
        </div>

        {/* Prominent Glowing Green Checkmark Circle matching screenshot */}
        <div className="relative shrink-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#05070A]/90 border-2 border-[#C6F432] flex items-center justify-center shadow-[0_0_35px_rgba(198,244,50,0.55),inset_0_0_20px_rgba(198,244,50,0.25)] backdrop-blur-md"
          >
            {/* Animated SVG Outer Glow Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="rgba(198, 244, 50, 0.25)"
                strokeWidth="3"
                fill="none"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#C6F432"
                strokeWidth="3.2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="220"
                initial={{ strokeDashoffset: 220 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>

            {/* Glowing Checkmark Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check className="w-8 h-8 sm:w-9 sm:h-9 text-[#C6F432] drop-shadow-[0_0_12px_#C6F432]" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
