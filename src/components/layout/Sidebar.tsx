import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShieldAlert,
  BarChart3,
  MapPin,
  FileText,
  Settings,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Overview', path: '/', icon: Home },
  { name: 'Threats', path: '/threats', icon: ShieldAlert },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Threat Map', path: '/threat-map', icon: MapPin },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredBottom, setHoveredBottom] = useState(false);

  return (
    <>
      {/* Desktop / Tablet Icon-Only Sidebar (~72px) */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-[74px] flex-col items-center justify-between py-6 z-40 bg-[#05070A]/80 backdrop-blur-xl border-r border-white/10 select-none"
        aria-label="Main Navigation"
      >
        {/* Top Brand Logo Sparkle */}
        <div className="flex flex-col items-center">
          <NavLink
            to="/"
            className="group relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#C6F432]/50 hover:bg-[#C6F432]/10 transition-all duration-300"
            aria-label="CHITTI Home"
            onMouseEnter={() => setHoveredItem('brand')}
            onMouseLeave={() => setHoveredItem(null)}
            onFocus={() => setHoveredItem('brand')}
            onBlur={() => setHoveredItem(null)}
          >
            <div className="relative">
              {/* 4-pointed golden sparkle icon */}
              <Sparkles className="w-6 h-6 text-[#C6F432] group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-[#C6F432] blur-md opacity-30 group-hover:opacity-70 transition-opacity" />
            </div>

            {/* Brand Tooltip */}
            <AnimatePresence>
              {hoveredItem === 'brand' && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-[64px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#090D14]/95 border border-[#C6F432]/30 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md whitespace-nowrap z-50 pointer-events-none"
                >
                  <div className="text-xs font-semibold text-white tracking-wide flex items-center gap-1.5">
                    <span className="text-[#C6F432] font-display text-sm tracking-widest font-bold">CHITTI</span>
                    <span className="text-white/60 text-[10px]">Cyber Threat Tracker</span>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-y-4 border-y-transparent border-r-6 border-r-[#090D14]/95" />
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>
        </div>

        {/* Navigation Icon List */}
        <nav className="flex flex-col items-center gap-4 my-auto w-full px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

            return (
              <div key={item.path} className="relative flex items-center justify-center w-full">
                <NavLink
                  to={item.path}
                  aria-label={item.name}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onFocus={() => setHoveredItem(item.name)}
                  onBlur={() => setHoveredItem(null)}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C6F432] ${
                    isActive
                      ? 'text-black font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Framer motion sliding active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavHighlight"
                      className="absolute inset-0 rounded-2xl bg-[#C6F432] shadow-[0_0_20px_rgba(198,244,50,0.45)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={`relative z-10 w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-black' : 'group-hover:scale-110'
                    }`}
                  />
                </NavLink>

                {/* Animated Tooltip */}
                <AnimatePresence>
                  {hoveredItem === item.name && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-[62px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#090D14]/95 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md whitespace-nowrap z-50 pointer-events-none"
                    >
                      <div className="text-xs font-medium text-slate-200">{item.name}</div>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-y-4 border-y-transparent border-r-6 border-r-[#090D14]/95" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Bottom Status Pulsing Indicator */}
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            aria-label="System Online: Last updated 2 min ago"
            onMouseEnter={() => setHoveredBottom(true)}
            onMouseLeave={() => setHoveredBottom(false)}
            onFocus={() => setHoveredBottom(true)}
            onBlur={() => setHoveredBottom(false)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 hover:border-[#C6F432]/40 transition-colors cursor-pointer"
          >
            {/* Outer pulse */}
            <span className="absolute w-3 h-3 rounded-full bg-[#C6F432] animate-ping opacity-75" />
            {/* Center dot */}
            <span className="relative w-2.5 h-2.5 rounded-full bg-[#C6F432] shadow-[0_0_10px_#C6F432]" />
          </button>

          {/* Bottom Tooltip */}
          <AnimatePresence>
            {hoveredBottom && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-[58px] bottom-1 px-3 py-2 rounded-xl bg-[#090D14]/95 border border-[#C6F432]/30 shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md whitespace-nowrap z-50 pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C6F432]" />
                  <span className="text-xs font-semibold text-slate-100">System Online</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Last updated 2 min ago</div>
                {/* Arrow */}
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-y-4 border-y-transparent border-r-6 border-r-[#090D14]/95" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar (<768px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#05070A]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-40 select-none"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.name}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'text-[#C6F432]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileNav"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-[#C6F432] shadow-[0_0_8px_#C6F432]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
