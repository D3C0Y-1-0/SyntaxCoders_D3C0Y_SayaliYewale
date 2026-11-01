import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReportsHeader } from '../components/reports/ReportsHeader';
import { ReportsKPICards } from '../components/reports/ReportsKPICards';
import { ReportsFilterBar, type FilterState } from '../components/reports/ReportsFilterBar';
import { RecentReportsList } from '../components/reports/RecentReportsList';
import { ReportPreviewCard } from '../components/reports/ReportPreviewCard';
import {
  BotanicalLeavesBottomLeft,
  BotanicalLeavesTopRight,
} from '../components/decorations/BotanicalLeaves';
import { mockReportsData, type ReportItem } from '../data/reports';
import { downloadReportFile } from '../utils/reportDownload';

export const ReportsPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Filters State
  const initialFilters: FilterState = {
    search: '',
    type: 'All Types',
    dateRange: 'Last 30 Days',
    severity: 'All',
    status: 'All',
    author: 'All Authors',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedReport, setSelectedReport] = useState<ReportItem>(mockReportsData[0]);
  const [isViewAll, setIsViewAll] = useState(false);
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDownloadReport = async (report: ReportItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    downloadReportFile(report);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#C6F432', '#7CE04B', '#38BDF8'],
    });
    showToast(`✓ Report downloaded: ${report.title}`);
  };

  // Compute active extra filters count (excluding search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'All Types') count++;
    if (filters.dateRange !== 'Last 30 Days') count++;
    if (filters.severity !== 'All') count++;
    if (filters.status !== 'All') count++;
    if (filters.author !== 'All Authors') count++;
    return count;
  }, [filters]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return mockReportsData.filter((report) => {
      // Type filter
      if (filters.type !== 'All Types' && report.type !== filters.type) {
        return false;
      }

      // Severity filter
      if (filters.severity !== 'All' && report.severity !== filters.severity) {
        return false;
      }

      // Status filter
      if (filters.status !== 'All' && report.status !== filters.status) {
        return false;
      }

      // Author filter
      if (filters.author !== 'All Authors' && report.author !== filters.author) {
        return false;
      }

      // Date Range filter
      if (filters.dateRange !== 'Last 30 Days' && filters.dateRange !== 'Custom') {
        const reportDate = new Date(report.dateKey).getTime();
        const now = new Date('2025-10-28T23:59:59').getTime(); // Reference demo time
        const diffHours = (now - reportDate) / (1000 * 60 * 60);

        if (filters.dateRange === '24 Hours' && diffHours > 24) return false;
        if (filters.dateRange === '7 Days' && diffHours > 24 * 7) return false;
        if (filters.dateRange === '90 Days' && diffHours > 24 * 90) return false;
      }

      // Search Query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesTitle = report.title.toLowerCase().includes(query);
        const matchesSubtitle = report.subtitle.toLowerCase().includes(query);
        const matchesOverview = report.overview.toLowerCase().includes(query);
        const matchesCve = report.cveId?.toLowerCase().includes(query);
        const matchesAuthor = report.author.toLowerCase().includes(query);
        const matchesAsset = report.affectedAssets.some(
          (a) => a.name.toLowerCase().includes(query) || a.type.toLowerCase().includes(query)
        );

        if (
          !matchesTitle &&
          !matchesSubtitle &&
          !matchesOverview &&
          !matchesCve &&
          !matchesAuthor &&
          !matchesAsset
        ) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Keep selected report synchronized with filtered list
  React.useEffect(() => {
    if (filteredReports.length > 0) {
      const stillExists = filteredReports.find((r) => r.id === selectedReport?.id);
      if (!stillExists) {
        setSelectedReport(filteredReports[0]);
      }
    }
  }, [filteredReports, selectedReport]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setIsViewAll(false);
    setPage(1);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="relative w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Decorative Botanical Leaves Elements */}
      <BotanicalLeavesBottomLeft />
      <BotanicalLeavesTopRight />

      {/* Background Soft Blue/Lime Radial Gradients */}
      <div className="pointer-events-none absolute -top-20 left-1/4 w-[600px] h-[500px] bg-blue-700/10 rounded-full blur-[140px] z-0" />
      <div className="pointer-events-none absolute top-1/2 right-10 w-[500px] h-[400px] bg-[#C6F432]/5 rounded-full blur-[130px] z-0" />

      {/* Top Header Row with Cropped Glowing 3D Globe */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <ReportsHeader />
      </motion.section>

      {/* Main Reports Content with Staggered Entrance */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-5 sm:space-y-6"
      >
        {/* Row 1: KPI Cards (4 in a row on desktop, 2x2 on tablet/mobile) */}
        <motion.section variants={itemVariants}>
          <ReportsKPICards />
        </motion.section>

        {/* Row 2: Filter Bar */}
        <motion.section variants={itemVariants}>
          <ReportsFilterBar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />
        </motion.section>

        {/* Row 3: Recent Reports (left, wide) + Report Preview (right, tall) */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch"
        >
          {/* Recent Reports List: Span 7 on lg, Span 8 on xl */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <RecentReportsList
              reports={filteredReports}
              selectedReportId={selectedReport?.id || null}
              onSelectReport={(r) => {
                setSelectedReport(r);
                if (window.innerWidth < 768) {
                  setMobilePreviewOpen(true);
                }
              }}
              onDownloadReport={handleDownloadReport}
              isViewAll={isViewAll}
              onToggleViewAll={() => setIsViewAll(!isViewAll)}
              onResetFilters={handleResetFilters}
              page={page}
              onPageChange={setPage}
              pageSize={5}
            />
          </div>

          {/* Report Preview: Span 5 on lg, Span 4 on xl (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col">
            <ReportPreviewCard
              report={selectedReport}
              onDownload={handleDownloadReport}
            />
          </div>
        </motion.section>
      </motion.div>

      {/* Mobile Report Preview Bottom Sheet (<768px) */}
      <AnimatePresence>
        {mobilePreviewOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobilePreviewOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#090D14] border-t border-white/20 p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C6F432]">
                  Report Preview
                </span>
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ReportPreviewCard
                report={selectedReport}
                onDownload={async (r) => {
                  await handleDownloadReport(r);
                  setMobilePreviewOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#090D15]/95 border border-[#C6F432]/60 text-white text-xs font-medium shadow-[0_12px_36px_rgba(0,0,0,0.7)] flex items-center gap-2.5 backdrop-blur-xl"
          >
            <div className="w-5 h-5 rounded-full bg-[#C6F432]/20 text-[#C6F432] flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
