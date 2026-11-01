import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { ThreatsHeader } from '../components/threats/ThreatsHeader';
import { ThreatStatCards } from '../components/threats/ThreatStatCards';
import { ThreatTableCard } from '../components/threats/ThreatTableCard';
import { RiskTrendCard } from '../components/threats/RiskTrendCard';
import { ThreatDetailPanel } from '../components/threats/ThreatDetailPanel';
import { BotanicalLeavesBottomLeft, BotanicalLeavesTopRight } from '../components/decorations/BotanicalLeaves';
import { useThreats } from '../context/ThreatContext';

export const ThreatsPage: React.FC = () => {
  const { toastMessage } = useThreats();

  return (
    <div className="relative w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Decorative Botanical Leaves Elements */}
      <BotanicalLeavesBottomLeft />
      <BotanicalLeavesTopRight />

      {/* Subtle Background Radial Glow */}
      <div className="pointer-events-none absolute -top-16 left-1/4 w-[550px] h-[450px] bg-blue-700/10 rounded-full blur-[140px] z-0" />
      <div className="pointer-events-none absolute top-1/2 right-10 w-[500px] h-[400px] bg-[#C6F432]/5 rounded-full blur-[130px] z-0" />

      {/* Main Grid: Left Column (Header + Stat Cards + Table) & Right Column (Risk Trend + Detail Panel) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Span 7 on lg, Span 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
          {/* Threats Header with partially visible globe behind it */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ThreatsHeader />
          </motion.div>

          {/* 4 Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ThreatStatCards />
          </motion.div>

          {/* Wide Threat Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-1"
          >
            <ThreatTableCard />
          </motion.div>
        </div>

        {/* Right Column (Span 5 on lg, Span 4 on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-6">
          {/* Risk Trend Card (Top Right) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <RiskTrendCard />
          </motion.div>

          {/* Threat Detail Panel (Bottom Right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex-1"
          >
            <ThreatDetailPanel />
          </motion.div>
        </div>
      </div>


      {/* Floating Toast Notification */}
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

export default ThreatsPage;
