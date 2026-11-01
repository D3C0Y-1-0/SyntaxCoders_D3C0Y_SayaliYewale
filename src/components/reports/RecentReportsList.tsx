import React from 'react';
import {
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReportItem, ReportSeverity } from '../../data/reports';

interface RecentReportsListProps {
  reports: ReportItem[];
  selectedReportId: string | null;
  onSelectReport: (report: ReportItem) => void;
  onDownloadReport: (report: ReportItem, e: React.MouseEvent) => void;
  isViewAll: boolean;
  onToggleViewAll: () => void;
  onResetFilters: () => void;
  page: number;
  onPageChange: (newPage: number) => void;
  pageSize?: number;
}

const SeverityBadge: React.FC<{ severity: ReportSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/15 border border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(255,77,77,0.15)]">
          <Flame className="w-3 h-3 fill-red-400" />
          <span>Critical</span>
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(255,176,32,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#FFB020]" />
          <span>Medium</span>
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(79,140,255,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#4F8CFF]" />
          <span>Low</span>
        </span>
      );
    case 'Informational':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(124,224,75,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#7CE04B]" />
          <span>Informational</span>
        </span>
      );
    default:
      return null;
  }
};

const RowStatusIcon: React.FC<{ severity: ReportSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'Critical':
      return (
        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 shadow-[0_0_12px_rgba(255,77,77,0.2)]">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    case 'Medium':
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFB020] flex-shrink-0 shadow-[0_0_12px_rgba(255,176,32,0.2)]">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    case 'Low':
      return (
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#4F8CFF] flex-shrink-0 shadow-[0_0_12px_rgba(79,140,255,0.2)]">
          <Info className="w-4 h-4" />
        </div>
      );
    case 'Informational':
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#7CE04B] flex-shrink-0 shadow-[0_0_12px_rgba(124,224,75,0.2)]">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
  }
};

export const RecentReportsList: React.FC<RecentReportsListProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onDownloadReport,
  isViewAll,
  onToggleViewAll,
  onResetFilters,
  page,
  onPageChange,
  pageSize = 5,
}) => {
  const totalPages = Math.ceil(reports.length / pageSize) || 1;
  const displayedReports = isViewAll
    ? reports
    : reports.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative overflow-hidden border-white/10">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-10 w-64 h-36 bg-[#C6F432]/5 blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex items-center justify-between mb-4 relative z-10 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/30 flex items-center justify-center text-[#C6F432] shadow-[0_0_15px_rgba(198,244,50,0.2)]">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-white tracking-wide">
            Recent Reports
          </h2>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ({reports.length} total)
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleViewAll}
          className="text-xs font-semibold text-[#C6F432] hover:text-[#d7ff4f] flex items-center gap-1 transition-colors cursor-pointer group/link"
        >
          <span>{isViewAll ? '← Show Paginated' : 'View All →'}</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="flex-1 space-y-2 relative z-10">
        <AnimatePresence mode="popLayout">
          {displayedReports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400">
                <SearchX className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-white">No reports match your filters</div>
              <p className="text-xs text-slate-400 max-w-xs">
                Try adjusting your search query, severity, or date range filters to view matching security intelligence reports.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-2 px-3 py-1.5 rounded-xl bg-[#C6F432]/10 border border-[#C6F432]/40 text-[#C6F432] text-xs font-semibold hover:bg-[#C6F432]/20 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            displayedReports.map((report) => {
              const isSelected = selectedReportId === report.id;

              return (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectReport(report)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 sm:gap-4 group/row ${
                    isSelected
                      ? 'bg-[#C6F432]/[0.08] border-[#C6F432]/60 shadow-[0_0_20px_rgba(198,244,50,0.18)]'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
                  }`}
                >
                  {/* Left: Status Icon + Title & Subtitle */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <RowStatusIcon severity={report.severity} />

                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-white truncate group-hover/row:text-[#C6F432] transition-colors">
                        {report.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {report.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Severity Badge + Date/Time + Download Icon */}
                  <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                    <div className="hidden sm:block">
                      <SeverityBadge severity={report.severity} />
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-mono hidden md:block">
                      <div className="text-slate-200 font-medium">
                        {report.createdAt.split(' ').slice(0, 3).join(' ')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {report.createdAt.split(' ').slice(3).join(' ')}
                      </div>
                    </div>

                    {/* Download Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => onDownloadReport(report, e)}
                      aria-label={`Download report ${report.title}`}
                      className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-[#C6F432] border border-white/10 hover:border-[#C6F432] flex items-center justify-center text-slate-300 hover:text-black transition-all cursor-pointer group/btn shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Footer */}
      {!isViewAll && reports.length > pageSize && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs text-slate-400 relative z-10">
          <div>
            Showing <span className="font-semibold text-white">{(page - 1) * pageSize + 1}</span>-
            <span className="font-semibold text-white">
              {Math.min(page * pageSize, reports.length)}
            </span> of <span className="font-semibold text-white">{reports.length}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
