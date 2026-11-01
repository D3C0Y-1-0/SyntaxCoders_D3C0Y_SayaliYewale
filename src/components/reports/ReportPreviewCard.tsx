import React, { useState } from 'react';
import { BarChart3, Sparkles, Monitor, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReportItem, ReportSeverity } from '../../data/reports';

interface ReportPreviewCardProps {
  report: ReportItem | null;
  onDownload: (report: ReportItem) => Promise<void> | void;
}

const PreviewSeverityBadge: React.FC<{ severity: ReportSeverity }> = ({ severity }) => {
  switch (severity) {
    case 'Critical':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FF4D4D] text-white shadow-sm">
          Critical
        </span>
      );
    case 'Medium':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFB020] text-black shadow-sm">
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4F8CFF] text-white shadow-sm">
          Low
        </span>
      );
    case 'Informational':
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7CE04B] text-black shadow-sm">
          Informational
        </span>
      );
  }
};

export const ReportPreviewCard: React.FC<ReportPreviewCardProps> = ({
  report,
  onDownload,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!report) {
    return (
      <div className="glass-card p-5 sm:p-6 flex flex-col items-center justify-center h-full text-center text-slate-400">
        <p className="text-sm">Select a report from the list to preview details.</p>
      </div>
    );
  }

  const handleDownloadClick = async () => {
    setDownloading(true);
    try {
      await onDownload(report);
    } finally {
      setDownloading(false);
    }
  };

  // Formatted date string, e.g. "Oct 28, 2025"
  const formattedDate = report.createdAt.split(' ').slice(0, 3).join(' ');

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group select-none relative overflow-hidden border-white/10">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-36 bg-[#C6F432]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 relative z-10 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-[#7CE04B]/10 border border-[#7CE04B]/30 flex items-center justify-center text-[#7CE04B] shadow-[0_0_15px_rgba(124,224,75,0.2)]">
          <BarChart3 className="w-4 h-4" />
        </div>
        <h2 className="text-base font-semibold text-white tracking-wide">
          Report Preview
        </h2>
      </div>

      {/* Light Paper-style Document Sheet */}
      <div className="my-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="rounded-2xl p-5 sm:p-6 bg-[#E2E8F0] text-slate-800 shadow-[0_12px_36px_rgba(0,0,0,0.35)] space-y-4"
          >
            {/* Paper Header: CHITTI logo + Security Report Date */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/80">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span className="font-display font-bold tracking-widest text-slate-900 text-sm">
                  CHITTI
                </span>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold text-slate-700 tracking-tight">
                  Security Report
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Title & Severity Badge */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {report.title}
              </h3>
              <div className="flex-shrink-0 mt-0.5">
                <PreviewSeverityBadge severity={report.severity} />
              </div>
            </div>

            {/* Overview Section */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Overview
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {report.overview}
              </p>
            </div>

            {/* Affected Systems Section */}
            <div className="pt-2 border-t border-slate-300/70 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900">
                <Monitor className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-semibold">Affected Systems</span>
              </div>
              <div className="text-xs text-slate-600 pl-6">
                {report.affectedSystemsCount} {report.affectedSystemsCount === 1 ? 'asset matches' : 'assets match'}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prominent Full-Width Lime Download Button */}
      <div className="pt-5 relative z-10">
        <motion.button
          type="button"
          onClick={handleDownloadClick}
          disabled={downloading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-xl bg-[#C6F432] hover:bg-[#d8ff4f] text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,244,50,0.35)] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download Report</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};
