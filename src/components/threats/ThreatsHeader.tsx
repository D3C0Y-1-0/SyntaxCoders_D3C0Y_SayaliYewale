import React from 'react';
import { Globe3D } from '../dashboard/Globe3D';

export const ThreatsHeader: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden pb-1 select-none">
      {/* 3D Globe partially visible, cropped behind and to the right of the header */}
      <div className="pointer-events-none absolute -top-12 -right-8 sm:right-6 md:right-16 w-[340px] h-[240px] sm:w-[420px] sm:h-[280px] overflow-hidden opacity-85 z-0">
        <div className="transform scale-90 translate-x-4 -translate-y-4">
          <Globe3D />
        </div>
      </div>

      {/* Header Titles */}
      <div className="relative z-10 space-y-1 py-1">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white leading-tight">
          Threats
        </h1>
        <p className="text-xs sm:text-sm tracking-[0.25em] text-[#9AA0A6] font-medium uppercase pt-1">
          Monitor • Analyse • Stay Ahead
        </p>
      </div>
    </div>
  );
};
