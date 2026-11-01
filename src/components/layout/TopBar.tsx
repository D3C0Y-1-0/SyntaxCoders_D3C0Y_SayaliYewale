import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearch, placeholder = 'Search threats, regions, or CVEs…' }) => {
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/threats?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-3 px-4 md:px-8 z-30 select-none">
      {/* Mobile Brand Title */}
      <div className="flex items-center gap-2 md:hidden">
        <span className="font-display text-lg font-bold tracking-wider text-[#C6F432]">CHITTI</span>
        <span className="text-xs text-white/50 tracking-tight">Threat Tracker</span>
      </div>

      {/* Center/Left Search Box (Desktop) */}
      <div className="hidden md:flex items-center flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <motion.div
            animate={{
              width: searchFocused ? '100%' : '88%',
              boxShadow: searchFocused ? '0 0 20px rgba(198, 244, 50, 0.15)' : 'none',
            }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full border transition-colors ${
              searchFocused
                ? 'bg-[#0B101B] border-[#C6F432]/60'
                : 'bg-white/[0.035] border-white/10 hover:border-white/20'
            }`}
          >
            <Search className={`w-4 h-4 transition-colors ${searchFocused ? 'text-[#C6F432]' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (onSearch) onSearch('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] text-slate-400 bg-white/5 border border-white/10 rounded font-mono">
              /
            </kbd>
          </motion.div>
        </form>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Mobile Search Toggle */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300"
          aria-label="Toggle search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Threat notifications (3 unread)"
          >
            <Bell className="w-4 h-4" />
            {/* Solid Red Badge (no blinking) */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 p-3 rounded-2xl bg-[#090D14]/95 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl z-50"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider">
                    Recent Alerts (3)
                  </div>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/threats');
                    }}
                    className="text-[11px] text-[#C6F432] hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  <div
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/threats?id=ALT-2024-9081');
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-red-500/20 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-xs font-medium text-white truncate">Windows RCE (CVE-2024-38077)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Matched production financial gateway.</div>
                    <div className="text-[9px] text-slate-500 mt-1">2 mins ago · High Criticality</div>
                  </div>

                  <div
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/threats?id=ALT-2024-9082');
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-amber-500/20 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-medium text-white truncate">CobaltStrike Beacon JA3</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Border egress proxy intercepted packet.</div>
                    <div className="text-[9px] text-slate-500 mt-1">5 mins ago · DMZ</div>
                  </div>

                  <div
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/threats?id=ALT-2024-9083');
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-blue-500/20 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-xs font-medium text-white truncate">Brute Force Auth Spike</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Rate limiting activated on OAuth realm.</div>
                    <div className="text-[9px] text-slate-500 mt-1">8 mins ago · IAM</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar "SV" */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/15 hover:border-[#C6F432]/60 transition-all cursor-pointer group shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
            aria-label="User profile: Sayali V. (Analyst)"
          >
            <span className="text-xs font-bold tracking-wider text-slate-200 group-hover:text-[#C6F432] transition-colors">
              SV
            </span>
            {/* Tiny online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#C6F432] border-2 border-[#05070A]" />
          </button>

          {/* User Profile Popover */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 p-3.5 rounded-2xl bg-[#090D14]/95 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl z-50"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/40 flex items-center justify-center text-[#C6F432] font-bold text-sm">
                    SV
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Sayali Yewale</div>
                    <div className="text-xs text-[#C6F432]">SecOps Lead Analyst</div>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-300">
                    <span className="text-slate-400">SOC Clearance:</span>
                    <span className="font-mono text-emerald-400 font-semibold">Tier 3 / NATO</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-300">
                    <span className="text-slate-400">Feed Mode:</span>
                    <span className="text-[#C6F432] font-medium">Demo Fixture</span>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>System Settings</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="absolute top-16 left-0 right-0 px-4 py-2 bg-[#05070A]/95 border-b border-white/10 md:hidden z-40">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search threats, CVEs, or IPs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white outline-none focus:border-[#C6F432]"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-[#C6F432] text-black font-semibold text-xs"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
