import React from 'react';
import { motion } from 'framer-motion';
import { ThreatMapHeader } from '../components/threatMap/ThreatMapHeader';
import { ThreatMapCard } from '../components/threatMap/ThreatMapCard';
import {
  BotanicalLeavesBottomLeft,
  BotanicalLeavesTopRight,
} from '../components/decorations/BotanicalLeaves';

export const ThreatMapPage: React.FC = () => {
  return (
    <div className="relative w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Decorative Botanical Leaves Elements */}
      <BotanicalLeavesBottomLeft />
      <BotanicalLeavesTopRight />

      {/* Subtle Background Radial Ambient Glows */}
      <div className="pointer-events-none absolute -top-16 left-1/4 w-[600px] h-[500px] bg-blue-700/10 rounded-full blur-[150px] z-0" />
      <div className="pointer-events-none absolute top-1/2 right-12 w-[550px] h-[450px] bg-[#C6F432]/5 rounded-full blur-[140px] z-0" />

      {/* Header with Serif title, subtitle, underline, and 3D globe with shield */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10"
      >
        <ThreatMapHeader />
      </motion.div>

      {/* Main Global Threat Activity Map Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 w-full"
      >
        <ThreatMapCard />
      </motion.div>
    </div>
  );
};

export default ThreatMapPage;
