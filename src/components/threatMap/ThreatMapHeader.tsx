import React from 'react';
import { Globe3D } from '../dashboard/Globe3D';

export const ThreatMapHeader: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden pb-1 select-none">
      {/* 3D Globe with orbit rings and shield icon, cropped behind and to the right of the title */}
      <div className="pointer-events-none absolute -top-12 -right-8 sm:right-12 md:right-32 w-[340px] h-[240px] sm:w-[440px] sm:h-[280px] overflow-hidden opacity-90 z-0">
        <div className="transform scale-95 translate-x-4 -translate-y-4">
          <Globe3D />
        </div>
      </div>

      {/* Header Titles */}
      <div className="relative z-10 space-y-1.5 py-1">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white leading-tight">
          Threat Map
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA0A6] font-normal tracking-wide">
          Real-time global threat activity
        </p>
        {/* Short lime underline accent */}
        <div className="w-14 h-0.5 bg-[#C6F432] rounded-full mt-2" />
      </div>
    </div>
  );
};
