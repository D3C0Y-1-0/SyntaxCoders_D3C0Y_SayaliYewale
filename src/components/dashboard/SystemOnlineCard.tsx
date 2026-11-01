import React from 'react';
import { Sparkles } from 'lucide-react';

export const SystemOnlineCard: React.FC = () => {
  return (
    <div className="relative glass-card p-4 sm:p-5 flex flex-col justify-between overflow-hidden group select-none border-[#C6F432]/20 hover:border-[#C6F432]/40">
      {/* Background Soft Green Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#C6F432]/10 blur-xl rounded-full pointer-events-none" />

      {/* Pulsing Status Dot & Title */}
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6F432] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C6F432] shadow-[0_0_10px_#C6F432]" />
        </span>
        <span className="text-sm font-semibold text-[#C6F432] tracking-wide">
          System Online
        </span>
      </div>

      {/* Subtitle & Sparkle */}
      <div className="flex items-center justify-between mt-3 text-xs text-slate-400 font-mono">
        <div>
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-sans">SOC Feed</div>
          <div className="text-slate-300 font-medium">Last Updated 2 min ago</div>
        </div>
        <Sparkles className="w-4 h-4 text-[#C6F432]/60 group-hover:scale-110 transition-transform" />
      </div>
    </div>
  );
};
