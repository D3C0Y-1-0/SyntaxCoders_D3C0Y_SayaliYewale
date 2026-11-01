import React from 'react';

export const BotanicalLeavesBottomLeft: React.FC = () => {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 w-[380px] h-[360px] overflow-hidden z-0 opacity-80 select-none">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform -translate-x-12 translate-y-12"
      >
        <defs>
          <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#030816" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#0B1E48" stopOpacity="0.8" />
            <stop offset="85%" stopColor="#1E3A8A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="20%" y1="100%" x2="90%" y2="10%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0F2864" stopOpacity="0.75" />
            <stop offset="95%" stopColor="#2563EB" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#05070A" stopOpacity="0" />
          </radialGradient>
          <filter id="leafBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <circle cx="150" cy="250" r="180" fill="url(#leafGlow)" />

        {/* Petal 1 */}
        <path
          d="M 20 380 C 40 280, 110 200, 200 170 C 180 250, 120 330, 20 380 Z"
          fill="url(#leafGrad1)"
          filter="url(#leafBlur)"
          stroke="rgba(56, 189, 248, 0.2)"
          strokeWidth="1.2"
        />

        {/* Petal 2 */}
        <path
          d="M 10 390 C 80 340, 160 270, 260 260 C 220 320, 130 380, 10 390 Z"
          fill="url(#leafGrad2)"
          stroke="rgba(96, 165, 250, 0.25)"
          strokeWidth="1"
        />

        {/* Petal 3 - Upright elegant leaf */}
        <path
          d="M 60 380 C 70 240, 140 140, 180 90 C 170 180, 140 280, 60 380 Z"
          fill="url(#leafGrad1)"
          stroke="rgba(147, 197, 253, 0.2)"
          strokeWidth="1.2"
        />

        {/* Petal 4 - Lower curved petal */}
        <path
          d="M 100 390 C 170 360, 260 330, 340 350 C 280 390, 190 400, 100 390 Z"
          fill="url(#leafGrad2)"
          stroke="rgba(59, 130, 246, 0.15)"
          strokeWidth="1"
        />

        {/* Delicate stem vein highlights */}
        <path
          d="M 50 380 Q 110 240 175 100"
          stroke="rgba(125, 211, 252, 0.25)"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M 30 385 Q 120 280 195 175"
          stroke="rgba(125, 211, 252, 0.18)"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
    </div>
  );
};

export const BotanicalLeavesTopRight: React.FC = () => {
  return (
    <div className="pointer-events-none absolute -top-8 -right-10 w-[420px] h-[360px] overflow-hidden z-0 opacity-75 select-none">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform rotate-12 scale-110"
      >
        <defs>
          <linearGradient id="topLeafGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B1C48" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#172554" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="topLeafGrad2" x1="80%" y1="10%" x2="10%" y2="90%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#0F172A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="topBlueGlow" cx="60%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#05070A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="240" cy="120" r="160" fill="url(#topBlueGlow)" />

        {/* Back Petals */}
        <path
          d="M 360 40 C 280 80, 210 160, 180 260 C 260 230, 340 150, 360 40 Z"
          fill="url(#topLeafGrad1)"
          stroke="rgba(96, 165, 250, 0.2)"
          strokeWidth="1.2"
        />
        <path
          d="M 380 90 C 290 140, 220 220, 210 320 C 280 270, 350 200, 380 90 Z"
          fill="url(#topLeafGrad2)"
          stroke="rgba(147, 197, 253, 0.22)"
          strokeWidth="1"
        />
        <path
          d="M 320 20 C 240 50, 160 120, 130 200 C 190 180, 270 120, 320 20 Z"
          fill="url(#topLeafGrad1)"
          stroke="rgba(56, 189, 248, 0.2)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};
