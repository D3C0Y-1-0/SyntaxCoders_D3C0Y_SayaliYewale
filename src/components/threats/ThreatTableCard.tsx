import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  TriangleAlert,
  AlertCircle,
  Info,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThreats } from '../../context/ThreatContext';
import type { RiskLevel, ThreatStatus } from '../../data/threats';

type SortField = 'title' | 'riskLevel' | 'score' | 'publishedAt' | 'status';
type SortOrder = 'asc' | 'desc';

export const ThreatTableCard: React.FC = () => {
  const { threats, selectedThreat, setSelectedThreat } = useThreats();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ThreatStatus | 'All'>('All');
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state (5 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter threats
  const filteredThreats = useMemo(() => {
    return threats.filter((item) => {
      // Risk filter
      if (riskFilter !== 'All' && item.riskLevel !== riskFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSub = item.subtitle.toLowerCase().includes(q);
        const matchSumm = item.summary.toLowerCase().includes(q);
        return matchTitle || matchSub || matchSumm;
      }
      return true;
    });
  }, [threats, riskFilter, statusFilter, searchQuery]);

  // Sort threats
  const sortedThreats = useMemo(() => {
    return [...filteredThreats].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = a.score - b.score;
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'riskLevel') {
        const order = { High: 3, Medium: 2, Low: 1 };
        comparison = order[a.riskLevel] - order[b.riskLevel];
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'publishedAt') {
        comparison = a.publishedAt.localeCompare(b.publishedAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredThreats, sortField, sortOrder]);

  // Paginated items
  const totalItems = sortedThreats.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedThreats = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return sortedThreats.slice(startIndex, startIndex + pageSize);
  }, [sortedThreats, validCurrentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, totalItems);

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full select-none relative overflow-visible">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, source, or CVE…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-[#C6F432]/60 text-xs text-white placeholder-slate-400 outline-none transition-colors"
          />
        </div>

        {/* Filter Dropdown Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* All Filter */}
          <button
            type="button"
            onClick={() => {
              setRiskFilter('All');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              riskFilter === 'All'
                ? 'bg-white/15 text-white border border-white/25'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span>All</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* High Filter */}
          <button
            type="button"
            onClick={() => {
              setRiskFilter('High');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              riskFilter === 'High'
                ? 'bg-red-500/20 text-[#FF4D4D] border border-red-500/40 shadow-[0_0_10px_rgba(255,77,77,0.2)]'
                : 'bg-white/[0.03] text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF4D4D]" />
            <span>High</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Medium Filter */}
          <button
            type="button"
            onClick={() => {
              setRiskFilter('Medium');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              riskFilter === 'Medium'
                ? 'bg-amber-500/20 text-[#FFB020] border border-amber-500/40 shadow-[0_0_10px_rgba(255,176,32,0.2)]'
                : 'bg-white/[0.03] text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFB020]" />
            <span>Medium</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Low Filter */}
          <button
            type="button"
            onClick={() => {
              setRiskFilter('Low');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              riskFilter === 'Low'
                ? 'bg-emerald-500/20 text-[#7CE04B] border border-emerald-500/40 shadow-[0_0_10px_rgba(124,224,75,0.2)]'
                : 'bg-white/[0.03] text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#7CE04B]" />
            <span>Low</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Filter Options Icon Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              aria-label="Filter options"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                statusFilter !== 'All'
                  ? 'bg-[#C6F432]/20 border-[#C6F432]/50 text-[#C6F432]'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Status Filter Popover */}
            <AnimatePresence>
              {statusFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-44 p-2 rounded-2xl bg-[#090D15]/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 text-xs space-y-1"
                >
                  <div className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400">
                    Filter by Status
                  </div>
                  {(['All', 'Active', 'Investigating', 'Monitoring', 'Resolved', 'Acknowledged'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setStatusFilter(st);
                          setStatusFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-white/[0.08] text-[#C6F432] font-semibold'
                            : 'text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <span>{st}</span>
                        {statusFilter === st && <Check className="w-3.5 h-3.5 text-[#C6F432]" />}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto min-h-[340px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <th
                onClick={() => handleSort('title')}
                className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Threat</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('riskLevel')}
                className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Risk Level</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Score</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('publishedAt')}
                className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Published</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-3 px-2 w-8"></th>
            </tr>
          </thead>

          <tbody className="space-y-1.5">
            <AnimatePresence mode="wait">
              {paginatedThreats.map((threat, idx) => {
                const isSelected = selectedThreat?.id === threat.id;

                // Risk styles
                const isHigh = threat.riskLevel === 'High';
                const isMed = threat.riskLevel === 'Medium';

                const riskBadge = isHigh
                  ? 'bg-red-500/15 text-[#FF4D4D] border-red-500/35'
                  : isMed
                  ? 'bg-amber-500/15 text-[#FFB020] border-amber-500/35'
                  : 'bg-emerald-500/15 text-[#7CE04B] border-emerald-500/35';

                const iconBox = isHigh
                  ? 'bg-red-500/15 border-red-500/35 text-[#FF4D4D]'
                  : isMed
                  ? 'bg-amber-500/15 border-amber-500/35 text-[#FFB020]'
                  : 'bg-blue-500/15 border-blue-500/35 text-[#38BDF8]';

                // Status styles
                const statusStyles = {
                  Active: 'bg-[#C6F432]/10 text-[#C6F432] border-[#C6F432]/30',
                  Investigating: 'bg-blue-500/10 text-sky-400 border-blue-500/30',
                  Monitoring: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                  Resolved: 'bg-emerald-500/10 text-[#7CE04B] border-emerald-500/30',
                  Acknowledged: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
                };

                return (
                  <motion.tr
                    key={threat.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    onClick={() => setSelectedThreat(threat)}
                    className={`cursor-pointer transition-all duration-200 group rounded-xl my-1 ${
                      isSelected
                        ? 'border border-[#C6F432] shadow-[0_0_18px_rgba(198,244,50,0.22)] bg-white/[0.04]'
                        : 'border border-transparent hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Threat Column (Icon + Title + Subtitle) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconBox}`}
                        >
                          {threat.iconType === 'info' ? (
                            <Info className="w-4 h-4" />
                          ) : threat.iconType === 'alert' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <TriangleAlert className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[240px] sm:max-w-[280px]">
                          <div className="font-semibold text-white text-xs truncate group-hover:text-[#C6F432] transition-colors">
                            {threat.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            {threat.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Risk Level Column */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border tracking-wider ${riskBadge}`}
                      >
                        <span>▲</span>
                        <span>{threat.riskLevel}</span>
                      </span>
                    </td>

                    {/* Score Column */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs">
                        <span className="font-bold text-white text-sm">{threat.score}</span>
                        <span className="text-slate-400"> / 10</span>
                      </div>
                    </td>

                    {/* Published Column */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                      {threat.publishedAt}
                    </td>

                    {/* Status Column */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                          statusStyles[threat.status] || 'bg-white/10 text-white border-white/20'
                        }`}
                      >
                        {threat.status === 'Resolved' ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : threat.status === 'Active' ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-pulse" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                        <span>{threat.status}</span>
                      </span>
                    </td>

                    {/* Chevron Arrow */}
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredThreats.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No threats matching your search or filters.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
        {/* Left Pagination Controls */}
        <div className="flex items-center gap-1.5">
          {/* Prev Arrow */}
          <button
            type="button"
            disabled={validCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-white/[0.04] text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers (1 2 3 ... 6) */}
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === validCurrentPage;

            // Only show first 3, ellipsis, and last if totalPages > 5
            if (totalPages > 5 && pageNum > 3 && pageNum < totalPages) {
              if (pageNum === 4) {
                return (
                  <span key={pageNum} className="px-1 text-slate-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C6F432] text-black shadow-[0_0_12px_rgba(198,244,50,0.45)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Arrow */}
          <button
            type="button"
            disabled={validCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-white/[0.04] text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Count */}
        <div className="font-mono text-[11px] text-slate-400">
          Showing {startItem}–{endItem} of {totalItems} threats
        </div>
      </div>
    </div>
  );
};
