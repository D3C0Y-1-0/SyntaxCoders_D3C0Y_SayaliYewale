import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

// Realistic geographic hotspots with real coordinates and cyber telemetry
const telemetryHotspots = [
  { id: 'us-east', name: 'North America (Ashburn)', lat: 39.04, lng: -77.48, x: 23, y: 34, count: 3410, threat: 'RCE Exploitation', color: '#C6F432' },
  { id: 'us-west', name: 'US West (San Jose)', lat: 37.33, lng: -121.89, x: 15, y: 35, count: 2190, threat: 'API Injections', color: '#38BDF8' },
  { id: 'sa-east', name: 'South America (São Paulo)', lat: -23.55, lng: -46.63, x: 32, y: 72, count: 680, threat: 'Banking Trojans', color: '#38BDF8' },
  { id: 'eu-west', name: 'Europe Central (Frankfurt)', lat: 50.11, lng: 8.68, x: 49, y: 26, count: 2840, threat: 'CobaltStrike C2', color: '#7C5CFF' },
  { id: 'eu-uk', name: 'UK (London)', lat: 51.50, lng: -0.12, x: 46, y: 24, count: 1940, threat: 'Brute Force Clusters', color: '#38BDF8' },
  { id: 'in-south', name: 'India (Mumbai/Delhi)', lat: 19.07, lng: 72.87, x: 67, y: 44, count: 4210, threat: 'DDoS Amplification', color: '#C6F432' },
  { id: 'ea-tokyo', name: 'Asia East (Tokyo)', lat: 35.67, lng: 139.65, x: 84, y: 34, count: 2310, threat: 'Ransomware Loader', color: '#C6F432' },
  { id: 'sea-sg', name: 'Southeast Asia (Singapore)', lat: 1.35, lng: 103.81, x: 74, y: 55, count: 1450, threat: 'Credential Stuffing', color: '#7C5CFF' },
  { id: 'au-syd', name: 'Australia (Sydney)', lat: -33.86, lng: 151.20, x: 89, y: 78, count: 820, threat: 'Phishing Relays', color: '#38BDF8' },
];

export const GlobalThreatMap: React.FC = () => {
  const [countriesCount, setCountriesCount] = useState(0);
  const [hoveredHotspot, setHoveredHotspot] = useState<typeof telemetryHotspots[0] | null>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;
    const target = 72;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCountriesCount(Math.floor(ease * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, []);

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group relative overflow-hidden select-none">
      {/* Background Soft Blue/Cyan Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-40 bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <MapPin className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
            Global Threat Map
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-ping" />
          <span>Live Ingestion Sensor Mesh</span>
        </div>
      </div>

      {/* Map Graphic and Counter Section */}
      <div className="flex items-center justify-between gap-4 py-2 relative z-10 flex-1">
        {/* Realistic High-Resolution Vector World Map */}
        <div className="relative flex-1 h-44 sm:h-52 flex items-center justify-center">
          <svg
            viewBox="0 0 960 480"
            className="w-full h-full filter drop-shadow-[0_0_20px_rgba(30,58,138,0.4)]"
            fill="none"
          >
            <defs>
              {/* Landmass Shading */}
              <linearGradient id="realLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#131D31" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0B1325" stopOpacity="0.95" />
              </linearGradient>

              {/* Trajectory glow */}
              <linearGradient id="arcGlowLime" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C6F432" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Latitude & Longitude Coordinate Grid */}
            <g opacity="0.16" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="3 3">
              <line x1="0" y1="240" x2="960" y2="240" /> {/* Equator */}
              <line x1="0" y1="160" x2="960" y2="160" /> {/* Tropic of Cancer */}
              <line x1="0" y1="320" x2="960" y2="320" /> {/* Tropic of Capricorn */}
              <line x1="480" y1="0" x2="480" y2="480" /> {/* Prime Meridian */}
              <line x1="240" y1="0" x2="240" y2="480" />
              <line x1="720" y1="0" x2="720" y2="480" />
            </g>

            {/* Realistic Detailed Continent Outlines */}
            {/* North America */}
            <path
              d="M 125 50 
                 L 145 42 L 195 48 L 225 65 L 265 60 L 290 85 L 260 100 L 285 115 L 280 145 L 260 160 L 245 155 L 235 185 L 210 200 L 195 240 L 180 250 L 185 270 L 175 285 L 165 275 L 155 240 L 130 205 L 105 160 L 95 125 L 80 105 L 75 75 L 95 65 Z
                 M 270 190 Q 285 220 280 235 L 265 225 Z"
              fill="url(#realLandGrad)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.9"
            />

            {/* South America */}
            <path
              d="M 175 285 
                 L 220 270 L 255 280 L 295 305 L 320 330 L 315 365 L 280 405 L 250 440 L 235 465 L 225 450 L 230 400 L 210 360 L 190 325 L 175 285 Z"
              fill="url(#realLandGrad)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.9"
            />

            {/* Europe */}
            <path
              d="M 440 80 
                 L 470 65 L 505 70 L 510 100 L 485 115 L 520 135 L 495 165 L 465 170 L 445 150 L 420 165 L 415 140 L 435 125 L 440 80 Z
                 M 410 115 L 425 105 L 430 120 L 415 130 Z"
              fill="url(#realLandGrad)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.9"
            />

            {/* Africa */}
            <path
              d="M 425 175 
                 L 460 170 L 515 175 L 545 210 L 575 255 L 540 310 L 515 375 L 480 405 L 455 370 L 430 310 L 405 270 L 385 230 L 405 185 Z
                 M 565 340 L 580 330 L 575 365 L 560 360 Z"
              fill="url(#realLandGrad)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.9"
            />

            {/* Asia & Russia */}
            <path
              d="M 515 70 
                 L 600 55 L 680 50 L 760 65 L 850 70 L 890 90 L 870 125 L 820 130 L 810 165 L 780 180 L 730 190 L 720 220 L 750 250 L 720 270 L 685 240 L 670 280 L 640 300 L 620 250 L 590 230 L 570 250 L 545 200 L 525 140 Z
                 M 825 155 L 840 145 L 845 180 L 830 175 Z"
              fill="url(#realLandGrad)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.9"
            />

            {/* Australia & Oceania */}
            <path
              d="M 770 330 
                 L 830 320 L 870 345 L 880 390 L 845 425 L 795 420 L 760 375 Z
                 M 885 410 L 905 400 L 900 425 Z"
              fill="url(#realLandGrad)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.9"
            />

            {/* Active Cyber Attack Trajectory Arcs */}
            <path
              d="M 220 160 Q 360 80 490 125"
              stroke="url(#arcGlowLime)"
              strokeWidth="1.6"
              strokeDasharray="6 4"
              className="animate-wave"
              fill="none"
            />
            <path
              d="M 800 165 Q 520 80 230 165"
              stroke="url(#arcGlowLime)"
              strokeWidth="1.4"
              strokeDasharray="5 5"
              className="animate-wave"
              style={{ animationDirection: 'reverse', animationDuration: '18s' }}
              fill="none"
            />
            <path
              d="M 645 210 Q 560 160 480 125"
              stroke="#C6F432"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.8"
              fill="none"
            />
            <path
              d="M 310 340 Q 280 240 225 165"
              stroke="#38BDF8"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.75"
              fill="none"
            />
          </svg>

          {/* Real Animated Telemetry Hotspots */}
          {telemetryHotspots.map((node) => (
            <div
              key={node.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/pin"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredHotspot(node)}
              onMouseLeave={() => setHoveredHotspot(null)}
            >
              {/* Expanding Concentric Pulse Waves */}
              <span
                className="absolute -inset-2.5 rounded-full animate-ping opacity-60"
                style={{ backgroundColor: node.color }}
              />
              <span
                className="absolute -inset-1 rounded-full opacity-40 animate-pulse"
                style={{ backgroundColor: node.color }}
              />
              {/* Core Beacon Dot */}
              <span
                className="relative block w-2.5 h-2.5 rounded-full border border-black shadow-[0_0_12px_currentColor] transition-transform group-hover/pin:scale-125"
                style={{ backgroundColor: node.color, color: node.color }}
              />
            </div>
          ))}

          {/* Interactive Hover Telemetry Tooltip */}
          {hoveredHotspot && (
            <div
              className="absolute z-30 px-3 py-2 rounded-xl bg-[#090D14]/95 border border-[#C6F432]/60 shadow-[0_8px_30px_rgba(0,0,0,0.8)] pointer-events-none text-left backdrop-blur-md"
              style={{
                left: `${Math.min(hoveredHotspot.x + 3, 72)}%`,
                top: `${Math.max(hoveredHotspot.y - 18, 5)}%`,
              }}
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredHotspot.color }} />
                <span>{hoveredHotspot.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Coords: {hoveredHotspot.lat}°N, {hoveredHotspot.lng}°E
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px] mt-1 pt-1 border-t border-white/10 font-mono">
                <span className="text-[#C6F432]">{hoveredHotspot.count.toLocaleString()} Events/min</span>
                <span className="text-slate-300">{hoveredHotspot.threat}</span>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-24 bg-white/10 mx-2 hidden sm:block" />

        {/* Right Counter: Active in 72+ Countries */}
        <div className="flex flex-col justify-center min-w-[110px] sm:min-w-[125px] pl-2">
          <span className="text-[11px] text-slate-400 font-normal">Active in</span>
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-white italic tracking-tight">
              {countriesCount}
            </span>
            <span className="text-xl sm:text-2xl font-display text-[#C6F432] font-normal ml-0.5">
              +
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium">Countries</span>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">
            ● Global Sensor Mesh
          </div>
        </div>
      </div>
    </div>
  );
};
