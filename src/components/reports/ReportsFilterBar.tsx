import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReportSeverity, ReportType, ReportStatus } from '../../data/reports';

export type DateRangeOption = '24 Hours' | '7 Days' | 'Last 30 Days' | '90 Days' | 'Custom';

export interface FilterState {
  search: string;
  type: ReportType | 'All Types';
  dateRange: DateRangeOption;
  severity: ReportSeverity | 'All';
  status: ReportStatus | 'All';
  author: string;
}

interface ReportsFilterBarProps {
  filters: FilterState;
  onChange: (updater: (prev: FilterState) => FilterState) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export const ReportsFilterBar: React.FC<ReportsFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  activeFilterCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<'type' | 'date' | 'severity' | 'more' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const typeOptions: (ReportType | 'All Types')[] = [
    'All Types',
    'Vulnerability',
    'Phishing',
    'Compliance',
    'Incident',
    'Malware',
  ];

  const dateOptions: DateRangeOption[] = [
    '24 Hours',
    '7 Days',
    'Last 30 Days',
    '90 Days',
    'Custom',
  ];

  const severityOptions: (ReportSeverity | 'All')[] = [
    'All',
    'Critical',
    'Medium',
    'Low',
    'Informational',
  ];

  const statusOptions: (ReportStatus | 'All')[] = [
    'All',
    'Published',
    'Under Review',
    'Draft',
    'Archived',
  ];

  const authorOptions = [
    'All Authors',
    'Sayali Yewale',
    'SOC Tier 2',
    'AI Automated',
  ];

  return (
    <div
      ref={containerRef}
      className="glass-card p-2 sm:p-2.5 rounded-2xl flex flex-wrap items-center gap-2 sm:gap-3 select-none relative z-20 border-white/10"
    >
      {/* Search Input */}
      <div className="flex-1 min-w-[200px] relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search reports..."
          value={filters.search}
          onChange={(e) => onChange((prev) => ({ ...prev, search: e.target.value }))}
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#C6F432]/60 focus:bg-[#0B101D] text-xs text-white placeholder-slate-400 outline-none transition-all"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, search: '' }))}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown: All Types */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>{filters.type}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 opacity-60 transition-transform ${
              openDropdown === 'type' ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {openDropdown === 'type' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-44 py-1 rounded-xl bg-[#0B101D]/95 border border-white/15 shadow-xl backdrop-blur-xl z-50 text-xs"
            >
              {typeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({ ...prev, type: opt }));
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-white/[0.08] transition-colors cursor-pointer ${
                    filters.type === opt ? 'text-[#C6F432] font-semibold' : 'text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown: Last 30 Days */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>{filters.dateRange}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 opacity-60 transition-transform ${
              openDropdown === 'date' ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {openDropdown === 'date' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-40 py-1 rounded-xl bg-[#0B101D]/95 border border-white/15 shadow-xl backdrop-blur-xl z-50 text-xs"
            >
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({ ...prev, dateRange: opt }));
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-white/[0.08] transition-colors cursor-pointer ${
                    filters.dateRange === opt ? 'text-[#C6F432] font-semibold' : 'text-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown: Severity */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'severity' ? null : 'severity')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-200 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>{filters.severity === 'All' ? 'Severity' : filters.severity}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 opacity-60 transition-transform ${
              openDropdown === 'severity' ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {openDropdown === 'severity' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-40 py-1 rounded-xl bg-[#0B101D]/95 border border-white/15 shadow-xl backdrop-blur-xl z-50 text-xs"
            >
              {severityOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange((prev) => ({ ...prev, severity: opt }));
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-between ${
                    filters.severity === opt ? 'text-[#C6F432] font-semibold' : 'text-slate-300'
                  }`}
                >
                  <span>{opt}</span>
                  {opt === 'Critical' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  {opt === 'Medium' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                  {opt === 'Low' && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                  {opt === 'Informational' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popover: More Filters Button */}
      <div className="relative ml-auto">
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'more' ? null : 'more')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer ${
            activeFilterCount > 0
              ? 'bg-[#C6F432]/10 border-[#C6F432]/50 text-[#C6F432]'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#C6F432] text-black text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 opacity-60 transition-transform ${
              openDropdown === 'more' ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {openDropdown === 'more' && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 p-3.5 rounded-2xl bg-[#0B101D]/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 text-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-semibold text-white">Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="text-[11px] text-[#C6F432] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Report Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, status: st }))}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-left transition-colors ${
                        filters.status === st
                          ? 'bg-[#C6F432]/10 border-[#C6F432]/40 text-[#C6F432]'
                          : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Filter */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Lead Author
                </label>
                <select
                  value={filters.author}
                  onChange={(e) => onChange((prev) => ({ ...prev, author: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white outline-none focus:border-[#C6F432]"
                >
                  {authorOptions.map((au) => (
                    <option key={au} value={au} className="bg-[#0B101D] text-white">
                      {au}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
