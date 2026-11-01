import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from 'react-simple-maps';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import worldData from '../../data/countries-110m.json';

interface HotspotNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  threat: string;
  color: string;
  severity: 'Critical' | 'High' | 'Medium';
}

const TELEMETRY_HOTSPOTS: HotspotNode[] = [
  {
    id: 'us-west',
    name: 'US West (Seattle/San Jose)',
    lat: 44.5,
    lng: -121.5,
    count: 3840,
    threat: 'RCE Exploitation',
    color: '#38BDF8', // Cyan
    severity: 'High',
  },
  {
    id: 'us-east',
    name: 'North America (Ashburn)',
    lat: 38.8,
    lng: -77.2,
    count: 3410,
    threat: 'API Injections',
    color: '#C6F432', // Lime
    severity: 'Critical',
  },
  {
    id: 'sa-east',
    name: 'South America (São Paulo)',
    lat: -23.5,
    lng: -46.6,
    count: 1480,
    threat: 'Banking Trojans',
    color: '#38BDF8', // Cyan
    severity: 'Medium',
  },
  {
    id: 'eu-west',
    name: 'Europe Central (Frankfurt/UK)',
    lat: 51.2,
    lng: 4.8,
    count: 2940,
    threat: 'CobaltStrike C2',
    color: '#7C5CFF', // Purple
    severity: 'High',
  },
  {
    id: 'eu-nordic',
    name: 'Northern Europe (Baltic)',
    lat: 59.9,
    lng: 24.5,
    count: 1620,
    threat: 'Brute Force Clusters',
    color: '#38BDF8', // Cyan
    severity: 'Medium',
  },
  {
    id: 'in-hub',
    name: 'India (Mumbai/Delhi)',
    lat: 22.0,
    lng: 78.0,
    count: 4910,
    threat: 'DDoS Amplification',
    color: '#C6F432', // Lime
    severity: 'Critical',
  },
  {
    id: 'sea-east',
    name: 'Southeast Asia (Singapore)',
    lat: 1.35,
    lng: 103.8,
    count: 2310,
    threat: 'Credential Stuffing',
    color: '#7C5CFF', // Purple
    severity: 'High',
  },
  {
    id: 'ea-tokyo',
    name: 'Asia East (Tokyo)',
    lat: 35.7,
    lng: 139.7,
    count: 3120,
    threat: 'Ransomware Loader',
    color: '#C6F432', // Lime
    severity: 'High',
  },
  {
    id: 'au-syd',
    name: 'Australia (Sydney)',
    lat: -33.8,
    lng: 151.2,
    count: 980,
    threat: 'Phishing Relays',
    color: '#38BDF8', // Cyan
    severity: 'Medium',
  },
];

const OVERVIEW_ATTACK_PATHS = [
  {
    id: 'path-1',
    from: [-121.5, 44.5] as [number, number],
    to: [4.8, 51.2] as [number, number],
    color: '#C6F432',
  },
  {
    id: 'path-2',
    from: [78.0, 22.0] as [number, number],
    to: [-121.5, 44.5] as [number, number],
    color: '#38BDF8',
  },
  {
    id: 'path-3',
    from: [4.8, 51.2] as [number, number],
    to: [78.0, 22.0] as [number, number],
    color: '#7C5CFF',
  },
  {
    id: 'path-4',
    from: [139.7, 35.7] as [number, number],
    to: [151.2, -33.8] as [number, number],
    color: '#38BDF8',
  },
];

export const GlobalThreatMap: React.FC = () => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [countriesCount, setCountriesCount] = useState(0);
  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Smooth counter animation to 72+
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

  // Memoize world geographies feature collection
  const mapGeographies = useMemo(() => {
    return feature(
      worldData as any,
      (worldData as any).objects.countries
    ) as unknown as FeatureCollection<Geometry>;
  }, []);

  const handleMouseEnterNode = (e: React.MouseEvent, node: HotspotNode) => {
    setHoveredHotspot(node);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 10), rect.width - 220);
      const y = Math.max(e.clientY - rect.top - 85, 10);
      setTooltipPos({ x, y });
    }
  };

  const handleMouseMoveNode = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 10), rect.width - 220);
      const y = Math.max(e.clientY - rect.top - 85, 10);
      setTooltipPos({ x, y });
    }
  };

  return (
    <div
      ref={cardRef}
      className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group relative overflow-hidden select-none"
    >
      {/* Background Soft Blue/Cyan Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-44 bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 left-1/4 w-48 h-28 bg-[#C6F432]/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div
          onClick={() => navigate('/threat-map')}
          className="flex items-center gap-2.5 cursor-pointer group/title"
          title="Open interactive Global Threat Map"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover/title:border-[#C6F432] group-hover/title:text-[#C6F432] transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide group-hover/title:text-[#C6F432] transition-colors flex items-center gap-1.5">
            <span>Global Threat Map</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/title:opacity-100 transition-opacity" />
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-ping" />
          <span>Live Ingestion Sensor Mesh</span>
        </div>
      </div>

      {/* Map Graphic and Counter Section */}
      <div className="flex items-center justify-between gap-3 py-1 relative z-10 flex-1">
        {/* Realistic High-Resolution TopoJSON World Map */}
        <div className="relative flex-1 h-48 sm:h-56 lg:h-60 flex items-center justify-center overflow-hidden">
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 145,
              center: [12, 10],
            }}
            className="w-full h-full outline-none select-none filter drop-shadow-[0_0_18px_rgba(30,58,138,0.35)]"
          >
            {/* Real World Country Boundaries */}
            <Geographies geography={mapGeographies}>
              {({ geographies }) =>
                geographies
                  .filter(
                    (geo) =>
                      geo.id !== '010' &&
                      geo.properties?.name !== 'Antarctica' &&
                      geo.id !== 'ATA'
                  )
                  .map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1B2430"
                      stroke="#0B1018"
                      strokeWidth={0.5}
                      className="cursor-pointer transition-colors duration-200 outline-none hover:fill-[#273446]"
                      onClick={() => navigate('/threat-map')}
                    />
                  ))
              }
            </Geographies>

            {/* Attack Trajectory Arcs */}
            {OVERVIEW_ATTACK_PATHS.map((path) => (
              <Line
                key={path.id}
                from={path.from}
                to={path.to}
                stroke={path.color}
                strokeWidth={1.3}
                strokeDasharray="4 4"
                strokeOpacity={0.65}
                className="animate-attack-dash"
                fill="none"
              />
            ))}

            {/* Glowing Hotspots with Realistic Coordinates */}
            {TELEMETRY_HOTSPOTS.map((node) => {
              const isHovered = hoveredHotspot?.id === node.id;
              const isCritical = node.severity === 'Critical';

              return (
                <Marker
                  key={node.id}
                  coordinates={[node.lng, node.lat]}
                  onClick={() => navigate('/threat-map')}
                  onMouseEnter={(e) => handleMouseEnterNode(e, node)}
                  onMouseMove={handleMouseMoveNode}
                  onMouseLeave={() => setHoveredHotspot(null)}
                  className="cursor-pointer group/pin outline-none"
                >
                  {/* Concentric Animated Pulse Wave */}
                  <circle
                    r={isCritical ? 14 : 10}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={1.2}
                    className="threat-pulse-anim pointer-events-none"
                    style={{
                      animation: isCritical
                        ? 'threatPulseHigh 2.2s ease-out infinite'
                        : 'threatPulseMed 3.2s ease-out infinite',
                    }}
                  />

                  {/* Soft Halo Disc */}
                  <circle
                    r={isCritical ? 16 : 12}
                    fill={node.color}
                    opacity={isHovered ? 0.45 : isCritical ? 0.28 : 0.2}
                    style={{
                      filter: `drop-shadow(0 0 10px ${node.color})`,
                      transition: 'opacity 0.2s ease',
                    }}
                  />

                  {/* Core Beacon Dot */}
                  <circle
                    r={isCritical ? 4.5 : 3.8}
                    fill={node.color}
                    stroke="#FFFFFF"
                    strokeWidth={0.9}
                    style={{
                      filter: `drop-shadow(0 0 5px ${node.color})`,
                      transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                      transformOrigin: '0 0',
                      transition: 'transform 0.18s ease',
                    }}
                  />
                </Marker>
              );
            })}
          </ComposableMap>

          {/* Interactive Hover Telemetry Tooltip */}
          {hoveredHotspot && tooltipPos && (
            <div
              className="absolute z-30 px-3 py-2 rounded-xl bg-[#090D14]/95 border border-[#C6F432]/60 shadow-[0_8px_30px_rgba(0,0,0,0.85)] pointer-events-none text-left backdrop-blur-md transition-all"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
              }}
            >
              <div className="text-xs font-semibold text-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: hoveredHotspot.color }}
                  />
                  <span>{hoveredHotspot.name}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    hoveredHotspot.severity === 'Critical'
                      ? 'bg-red-500/20 text-red-400'
                      : hoveredHotspot.severity === 'High'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {hoveredHotspot.severity}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Coords: {hoveredHotspot.lat.toFixed(1)}°N, {hoveredHotspot.lng.toFixed(1)}°E
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px] mt-1 pt-1 border-t border-white/10 font-mono">
                <span className="text-[#C6F432]">
                  {hoveredHotspot.count.toLocaleString()} Events/min
                </span>
                <span className="text-slate-300">{hoveredHotspot.threat}</span>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-28 bg-white/10 mx-1 hidden sm:block" />

        {/* Right Counter: Active in 72+ Countries */}
        <div
          onClick={() => navigate('/threat-map')}
          className="flex flex-col justify-center min-w-[110px] sm:min-w-[125px] pl-2 cursor-pointer group/counter"
          title="Click to view full Global Threat Map"
        >
          <span className="text-[11px] text-slate-400 font-normal">Active in</span>
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium text-white italic tracking-tight group-hover/counter:text-[#C6F432] transition-colors">
              {countriesCount}
            </span>
            <span className="text-xl sm:text-2xl font-display text-[#C6F432] font-normal ml-0.5">
              +
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium">Countries</span>
          <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Global Sensor Mesh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
