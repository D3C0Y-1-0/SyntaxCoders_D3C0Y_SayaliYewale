import React from 'react';
import { Sparkles } from 'lucide-react';

export const QuoteCard: React.FC = () => {
  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Decorative Serif Quotation Mark */}
      <div className="text-4xl sm:text-5xl font-display text-white/20 select-none leading-none">
        “
      </div>

      {/* Quote Body */}
      <div className="my-auto py-2">
        <p className="font-display italic text-base sm:text-lg text-slate-200 leading-snug tracking-wide">
          Intelligence is the first line of defence.
        </p>
      </div>

      {/* Attribution & Tiny Sparkle */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-mono text-slate-400 tracking-wider">
          — CHITTI
        </span>
        <Sparkles className="w-4 h-4 text-[#C6F432]/70 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Corner Glow Accent */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-[#C6F432]/10 blur-xl rounded-full pointer-events-none group-hover:bg-[#C6F432]/20 transition-colors" />
    </div>
  );
};
