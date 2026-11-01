import React, { useState } from 'react';
import { Radio } from 'lucide-react';
import { globalThreatHotspots } from '../data/mockData';

export const ThreatMapPage: React.FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState(globalThreatHotspots[0]);

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-wide">
              Global Threat Early Warning Map
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/40 text-[#C6F432] text-xs font-mono">
              72+ Active Jurisdictions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time geospatial sensor telemetry and border gateway egress monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Interactive Map View (Span 8) */}
        <div className="lg:col-span-8 glass-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Header overlay */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C6F432] animate-pulse" />
              <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Live Sensor Mesh
              </span>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              Active Stream: 843 Threats / min
            </div>
          </div>

          {/* Large Stylized World Map */}
          <div className="relative w-full h-[360px] my-4 flex items-center justify-center">
            <svg
              viewBox="0 0 600 320"
              className="w-full h-full opacity-70 filter drop-shadow-[0_0_15px_rgba(59,91,219,0.3)]"
              fill="none"
            >
              <defs>
                <linearGradient id="mapBigContour" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1E293B" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0B1329" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              <path
                d="M 60 70 Q 110 50 170 70 Q 210 100 190 140 Q 150 170 120 180 Q 90 150 70 120 Z"
                fill="url(#mapBigContour)"
                stroke="rgba(255,255,255,0.12)"
              />
              <path
                d="M 170 190 Q 220 200 210 260 Q 180 300 160 270 Q 150 220 170 190 Z"
                fill="url(#mapBigContour)"
                stroke="rgba(255,255,255,0.12)"
              />
              <path
                d="M 280 60 Q 340 50 350 90 Q 320 120 280 110 Q 260 80 280 60 Z"
                fill="url(#mapBigContour)"
                stroke="rgba(255,255,255,0.12)"
              />
              <path
                d="M 270 120 Q 340 120 350 180 Q 320 250 280 240 Q 250 180 270 120 Z"
                fill="url(#mapBigContour)"
                stroke="rgba(255,255,255,0.12)"
              />
              <path
                d="M 360 50 Q 480 40 540 80 Q 520 150 450 160 Q 380 140 360 90 Z"
                fill="url(#mapBigContour)"
                stroke="rgba(255,255,255,0.12)"
              />
              <path
                d="M 460 220 Q 530 210 530 260 Q 480 280 450 250 Z"
                fill="url(#mapBigContour)"
                stroke="rgba(255,255,255,0.12)"
              />

              {/* Threat trajectories */}
              <path
                d="M 150 110 Q 260 40 380 120"
                stroke="rgba(198, 244, 50, 0.5)"
                strokeWidth="1.8"
                strokeDasharray="6 4"
                fill="none"
              />
              <path
                d="M 310 90 Q 400 60 420 135"
                stroke="rgba(56, 189, 248, 0.5)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                fill="none"
              />
              <path
                d="M 180 230 Q 300 200 400 130"
                stroke="rgba(124, 92, 255, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                fill="none"
              />
            </svg>

            {/* Pulsing Hotspots */}
            {globalThreatHotspots.map((h) => {
              const isSelected = selectedHotspot.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHotspot(h)}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                >
                  <span
                    className="absolute -inset-3 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: h.color }}
                  />
                  <span
                    className={`relative block w-3.5 h-3.5 rounded-full border-2 border-black transition-all ${
                      isSelected ? 'ring-4 ring-white/60 scale-125' : ''
                    }`}
                    style={{ backgroundColor: h.color }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 z-10 pt-2 border-t border-white/5">
            <span>Projection: Equirectangular WGS84</span>
            <span>Click any node to inspect telemetry</span>
          </div>
        </div>

        {/* Selected Region Telemetry Card (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#C6F432] font-mono">
                Regional Telemetry
              </span>
              <span className="w-2 h-2 rounded-full bg-[#C6F432] animate-ping" />
            </div>

            <div>
              <h2 className="text-xl font-display font-semibold text-white">
                {selectedHotspot.name}
              </h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Coordinates: {selectedHotspot.lat}°N, {selectedHotspot.lng}°E
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Threat Ingest Volume:</span>
                <span className="font-mono text-white font-bold text-sm">
                  {selectedHotspot.count.toLocaleString()} / min
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Primary Attack Vector:</span>
                <span className="text-[#C6F432] font-medium">Remote Exploitation</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex justify-between items-center">
                <span className="text-slate-400">Mitigation Edge Gateways:</span>
                <span className="text-white font-mono">4 Nodes Online</span>
              </div>
            </div>
          </div>

          {/* Regional Nodes List */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Monitored Sensor Regions ({globalThreatHotspots.length})
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {globalThreatHotspots.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedHotspot(item)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedHotspot.id === item.id
                      ? 'bg-white/[0.08] border-[#C6F432]/60'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-white">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.count} / min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
