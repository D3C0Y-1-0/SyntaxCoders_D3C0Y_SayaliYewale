import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup,
} from 'react-simple-maps';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Globe,
  Plus,
  Minus,
  RotateCcw,
  X,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  Radio,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import worldData from '../../data/countries-110m.json';
import {
  getThreatMarkersForRange,
  ATTACK_ARCS,
  LIVE_UPDATE_SIMULATION_POOL,
  type ThreatMarkerItem,
  type SeverityLevel,
  type TimeRangeOption,
} from '../../data/threatMap';

const TIME_RANGES: TimeRangeOption[] = [
  'Last 1 Hour',
  'Last 24 Hours',
  'Last 7 Days',
  'Last 30 Days',
];

export const ThreatMapCard: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Time Range Filter
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>('Last 24 Hours');
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const rangeDropdownRef = useRef<HTMLDivElement>(null);

  // Attack paths toggle
  const [showAttackPaths, setShowAttackPaths] = useState(true);

  // Zoom & Pan state
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [10, 15],
    zoom: 1,
  });

  // Severity Filter Visibility (Legend toggles)
  const [activeSeverities, setActiveSeverities] = useState<Record<SeverityLevel, boolean>>({
    high: true,
    medium: true,
    low: true,
  });

  // Hovered and Selected Marker
  const [hoveredMarker, setHoveredMarker] = useState<ThreatMarkerItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<ThreatMarkerItem | null>(null);

  // Ambient Live Ingestion Notification
  const [liveToast, setLiveToast] = useState<{ id: number; message: string; region: string } | null>(null);
  const [pulseMarkerId, setPulseMarkerId] = useState<string | null>(null);

  // Markers based on time range
  const markers = useMemo(() => {
    return getThreatMarkersForRange(selectedRange);
  }, [selectedRange]);

  // Filtered markers by active severities
  const visibleMarkers = useMemo(() => {
    return markers.filter((m) => activeSeverities[m.severity]);
  }, [markers, activeSeverities]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rangeDropdownRef.current && !rangeDropdownRef.current.contains(e.target as Node)) {
        setRangeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility: ESC closes detail panel & tooltip
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedMarker(null);
        setHoveredMarker(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulated Live Ingestion Sensor Stream every 8-10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Pause if tab is hidden
      if (document.visibilityState === 'hidden') return;

      const randomEvent =
        LIVE_UPDATE_SIMULATION_POOL[
          Math.floor(Math.random() * LIVE_UPDATE_SIMULATION_POOL.length)
        ];

      setLiveToast({
        id: Date.now(),
        message: randomEvent.type,
        region: randomEvent.region,
      });

      // Find matching or random marker to pulse
      const targetMarker =
        markers.find((m) => m.region.includes(randomEvent.region.split(' ')[0])) || markers[0];
      if (targetMarker) {
        setPulseMarkerId(targetMarker.id);
        setTimeout(() => setPulseMarkerId(null), 3000);
      }

      // Auto dismiss toast after 4 seconds
      const toastTimer = setTimeout(() => {
        setLiveToast(null);
      }, 4000);

      return () => clearTimeout(toastTimer);
    }, 9500);

    return () => clearInterval(timer);
  }, [markers]);

  // Zoom controls
  const handleZoomIn = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.35, 6),
    }));
  };

  const handleZoomOut = () => {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.35, 1),
    }));
  };

  const handleResetZoom = () => {
    setPosition({
      coordinates: [10, 15],
      zoom: 1,
    });
  };

  // Severity toggle from legend
  const toggleSeverity = (sev: SeverityLevel) => {
    setActiveSeverities((prev) => ({
      ...prev,
      [sev]: !prev[sev],
    }));
  };

  // Navigate to Threats page pre-filtered
  const handleViewThreats = (marker: ThreatMarkerItem) => {
    const query = encodeURIComponent(marker.country || marker.region);
    navigate(`/threats?q=${query}`);
  };

  // Memoize geography features as GeoJSON FeatureCollection
  const mapGeographies = useMemo(() => {
    return feature(worldData as any, (worldData as any).objects.countries) as unknown as FeatureCollection<Geometry>;
  }, []);

  return (
    <div
      ref={cardContainerRef}
      className="relative w-full h-[85vh] min-h-[520px] max-h-[920px] rounded-[28px] bg-[#05080C] border border-[#C6F432]/25 shadow-[0_0_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl flex flex-col overflow-hidden select-none"
    >
      {/* Background Soft Vignette & Radial Lime Glow for Depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#05080C]/70 to-[#05080C] z-0" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#C6F432]/[0.025] rounded-full blur-[140px] z-0" />

      {/* Header Row */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/[0.07] bg-[#05080C]/80 backdrop-blur-md">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/30 flex items-center justify-center text-[#C6F432] shadow-[0_0_15px_rgba(198,244,50,0.2)]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-medium text-white tracking-wide">
              Global Threat Activity
            </h2>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-pulse" />
              <span>{visibleMarkers.length} Active Hotspot Clusters</span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls: Attack paths toggle & Range dropdown */}
        <div className="flex items-center gap-3">
          {/* Attack paths switch */}
          <button
            type="button"
            onClick={() => setShowAttackPaths(!showAttackPaths)}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              showAttackPaths
                ? 'bg-[#C6F432]/10 border-[#C6F432]/40 text-[#C6F432]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle active attack vector trajectories"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Show attack paths</span>
            <div
              className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
                showAttackPaths ? 'bg-[#C6F432]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-black transition-transform ${
                  showAttackPaths ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Range Dropdown */}
          <div className="relative select-none" ref={rangeDropdownRef}>
            <button
              type="button"
              onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-xs text-white transition-all cursor-pointer shadow-sm"
            >
              <span>{selectedRange}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  rangeDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {rangeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-40 py-1 rounded-2xl bg-[#090D14]/95 border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 text-xs overflow-hidden"
                >
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setSelectedRange(range);
                        setRangeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 transition-colors cursor-pointer flex items-center justify-between ${
                        selectedRange === range
                          ? 'bg-[#C6F432]/10 text-[#C6F432] font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <span>{range}</span>
                      {selectedRange === range && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative flex-1 w-full h-full overflow-hidden z-10 flex items-center justify-center">
        {/* Live Threat Notification Chip (Top Left) */}
        <AnimatePresence>
          {liveToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="absolute top-4 left-6 z-30 px-3.5 py-2 rounded-2xl bg-[#090D14]/90 border border-[#C6F432]/40 shadow-[0_8px_30px_rgba(0,0,0,0.7)] backdrop-blur-md flex items-center gap-2.5 text-xs pointer-events-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6F432] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6F432]" />
              </span>
              <span className="text-white font-medium">New threat detected</span>
              <span className="text-slate-400">·</span>
              <span className="text-[#C6F432] font-mono">{liveToast.region}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The World Map SVG */}
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 175,
            center: [10, 5],
          }}
          className="w-full h-full outline-none select-none"
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            minZoom={1}
            maxZoom={6}
            onMoveEnd={(pos) => {
              if (pos.coordinates && pos.zoom) {
                setPosition({ coordinates: pos.coordinates, zoom: pos.zoom });
              }
            }}
          >
            {/* Geographies (Countries) */}
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
                      onClick={() => {
                        // Clicking empty country background deselects marker
                        setSelectedMarker(null);
                      }}
                    />
                  ))
              }
            </Geographies>

            {/* Attack Arcs */}
            {showAttackPaths &&
              ATTACK_ARCS.map((arc) => (
                <Line
                  key={arc.id}
                  from={arc.from}
                  to={arc.to}
                  stroke="#C6F432"
                  strokeWidth={1.4}
                  strokeDasharray="4 4"
                  strokeOpacity={0.65}
                  className="animate-attack-dash"
                  fill="none"
                />
              ))}

            {/* Threat Markers */}
            {visibleMarkers.map((marker, index) => {
              const isHigh = marker.severity === 'high';
              const isMed = marker.severity === 'medium';
              const isHovered = hoveredMarker?.id === marker.id;
              const isSelected = selectedMarker?.id === marker.id;
              const isPulsingLive = pulseMarkerId === marker.id;

              // Color configs
              const color = isHigh ? '#FF4D4D' : isMed ? '#FFB020' : '#7CE04B';
              const coreRadius = isHigh ? 7 : isMed ? 5.5 : 4.5;
              const haloRadius = isHigh ? 24 : isMed ? 16 : 10;

              // Staggered pulse delay
              const pulseDelay = `${(index * 0.4) % 2.5}s`;

              return (
                <Marker
                  key={marker.id}
                  coordinates={[marker.lng, marker.lat]}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarker(marker);
                  }}
                  onMouseEnter={(e) => {
                    setHoveredMarker(marker);
                    if (cardContainerRef.current) {
                      const rect = cardContainerRef.current.getBoundingClientRect();
                      const x = Math.min(Math.max(e.clientX - rect.left, 10), rect.width - 240);
                      const y = Math.max(e.clientY - rect.top - 105, 12);
                      setTooltipPos({ x, y });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (cardContainerRef.current) {
                      const rect = cardContainerRef.current.getBoundingClientRect();
                      const x = Math.min(Math.max(e.clientX - rect.left, 10), rect.width - 240);
                      const y = Math.max(e.clientY - rect.top - 105, 12);
                      setTooltipPos({ x, y });
                    }
                  }}
                  onMouseLeave={() => setHoveredMarker(null)}
                  className="cursor-pointer group outline-none"
                >
                  {/* Keep marker on-screen size constant when zoomed */}
                  <g
                    transform={`scale(${1 / position.zoom})`}
                    style={{
                      transformOrigin: '0px 0px',
                      transition: 'transform 0.15s ease-out',
                    }}
                  >
                    {/* Minimum 44px invisible touch hit target for mobile ergonomics */}
                    <circle r={22} fill="transparent" />

                    {/* Expanding Concentric Pulse Wave (High & Medium) */}
                    {!shouldReduceMotion && (
                      <circle
                        r={coreRadius}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        className="threat-pulse-anim pointer-events-none"
                        style={{
                          animation: isHigh
                            ? `threatPulseHigh 2s ease-out infinite`
                            : isMed
                            ? `threatPulseMed 3.2s ease-out infinite`
                            : undefined,
                          animationDelay: pulseDelay,
                        }}
                      />
                    )}

                    {/* Ambient Blurred Halo */}
                    <circle
                      r={haloRadius}
                      fill={color}
                      opacity={isHovered || isSelected || isPulsingLive ? 0.45 : isHigh ? 0.28 : isMed ? 0.2 : 0.14}
                      className={!shouldReduceMotion && !isHigh && !isMed ? 'threat-breathe-anim' : ''}
                      style={{
                        filter: `drop-shadow(0 0 ${haloRadius}px ${color})`,
                        transition: 'opacity 0.2s ease, r 0.2s ease',
                      }}
                    />

                    {/* Selected / Hover Ring */}
                    {(isHovered || isSelected) && (
                      <circle
                        r={coreRadius + 4}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={1.2}
                        opacity={0.8}
                      />
                    )}

                    {/* Solid Core Dot with White Highlight Edge */}
                    <circle
                      r={coreRadius}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={1}
                      style={{
                        filter: `drop-shadow(0 0 6px ${color})`,
                        transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                        transformOrigin: '0 0',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Interactive Floating Hover Tooltip */}
        <AnimatePresence>
          {hoveredMarker && tooltipPos && !selectedMarker && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute z-40 pointer-events-none px-3.5 py-2.5 rounded-2xl bg-[#090D14]/95 border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl text-left max-w-xs"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-white truncate">
                  {hoveredMarker.region}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    hoveredMarker.severity === 'high'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : hoveredMarker.severity === 'medium'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {hoveredMarker.severity}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#C6F432] font-semibold">
                {hoveredMarker.count.toLocaleString()} Active Threats
              </div>

              <div className="text-[10px] text-slate-300 mt-0.5 truncate">
                Top: {hoveredMarker.topTypes[0]?.name || 'Ingress Anomaly'}
              </div>

              <div className="text-[9px] text-slate-400 mt-1 font-mono">
                Last seen {hoveredMarker.lastSeen}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom & Pan Controls (Bottom Left) */}
        <div className="absolute bottom-5 left-6 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-[#090D14]/85 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Reset Map View"
            aria-label="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Legend Box (Docked at Right Edge, vertically centered in lower half) */}
        <div className="absolute bottom-6 right-6 md:bottom-12 md:right-8 z-20 p-3.5 rounded-2xl bg-[#090D14]/90 border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 px-1">
            Severity Filter
          </div>
          <div className="flex md:flex-col gap-2">
            {/* High */}
            <button
              type="button"
              onClick={() => toggleSeverity('high')}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSeverities.high
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                  : 'opacity-35 hover:opacity-60 text-slate-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]" />
              <span className="text-xs font-medium">High</span>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => toggleSeverity('medium')}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSeverities.medium
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                  : 'opacity-35 hover:opacity-60 text-slate-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#FFB020] shadow-[0_0_8px_#FFB020]" />
              <span className="text-xs font-medium">Medium</span>
            </button>

            {/* Low */}
            <button
              type="button"
              onClick={() => toggleSeverity('low')}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSeverities.low
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                  : 'opacity-35 hover:opacity-60 text-slate-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#7CE04B] shadow-[0_0_8px_#7CE04B]" />
              <span className="text-xs font-medium">Low</span>
            </button>
          </div>
        </div>

        {/* Detail Popover / Side Panel (Desktop: Right Slide-out / Mobile: Bottom Sheet) */}
        <AnimatePresence>
          {selectedMarker && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-[#090D14]/95 border-l border-white/15 shadow-[-16px_0_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-40 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-5">
                {/* Header with Close */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedMarker.severity === 'high'
                            ? 'bg-[#FF4D4D] shadow-[0_0_10px_#FF4D4D]'
                            : selectedMarker.severity === 'medium'
                            ? 'bg-[#FFB020] shadow-[0_0_10px_#FFB020]'
                            : 'bg-[#7CE04B] shadow-[0_0_10px_#7CE04B]'
                        }`}
                      />
                      <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                        {selectedMarker.country}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mt-1">
                      {selectedMarker.region}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedMarker(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close detail panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      Total Ingestion
                    </span>
                    <div className="text-xl font-bold font-mono text-[#C6F432] mt-0.5">
                      {selectedMarker.count.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400">Events / 24h</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      Threat Severity
                    </span>
                    <div className="text-base font-semibold capitalize text-white mt-1 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                          selectedMarker.severity === 'high'
                            ? 'bg-red-500/20 text-red-400'
                            : selectedMarker.severity === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {selectedMarker.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {selectedMarker.lastSeen}
                    </span>
                  </div>
                </div>

                {/* 24-Hour Sparkline Activity */}
                <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-mono">
                    <span>24h Influx Trajectory</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Live Stream
                    </span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="h-14 w-full">
                    <svg viewBox="0 0 200 48" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C6F432" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#C6F432" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      {(() => {
                        const maxVal = Math.max(...selectedMarker.series, 1);
                        const minVal = Math.min(...selectedMarker.series, 0);
                        const rangeVal = maxVal - minVal || 1;
                        const points = selectedMarker.series
                          .map((val, idx) => {
                            const x = (idx / (selectedMarker.series.length - 1)) * 200;
                            const y = 44 - ((val - minVal) / rangeVal) * 36;
                            return `${x},${y}`;
                          })
                          .join(' ');
                        const areaPath = `M 0,44 L ${points} L 200,44 Z`;
                        const linePath = `M ${points}`;
                        return (
                          <>
                            <path d={areaPath} fill="url(#sparklineGrad)" />
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#C6F432"
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Top 3 Threat Types Breakdown */}
                <div className="space-y-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Top Threat Vectors ({selectedMarker.topTypes.length})
                  </span>
                  <div className="space-y-2">
                    {selectedMarker.topTypes.map((type, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white/[0.025] border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-200 truncate pr-2">{type.name}</span>
                          <span className="font-mono text-white font-semibold">
                            {type.percentage}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#C6F432]"
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automated Mitigation Status */}
                <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 text-xs">
                  <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Mitigation Telemetry</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedMarker.mitigation}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => handleViewThreats(selectedMarker)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C6F432] hover:bg-[#b2e028] text-black font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(198,244,50,0.3)]"
                >
                  <span>View Threats &rarr;</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
