import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsKPICards } from '../components/analytics/AnalyticsKPICards';
import { ThreatTrendsCard } from '../components/analytics/ThreatTrendsCard';
import { ThreatDistributionCard } from '../components/analytics/ThreatDistributionCard';
import { TopThreatCategoriesCard } from '../components/analytics/TopThreatCategoriesCard';
import { ActivityOverviewCard } from '../components/analytics/ActivityOverviewCard';
import {
  BotanicalLeavesBottomLeft,
  BotanicalLeavesTopRight,
} from '../components/decorations/BotanicalLeaves';

export const AnalyticsPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

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
        <AnalyticsHeader />
      </motion.section>

      {/* Main Analytics Content with Staggered Entrance */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-6"
      >
        {/* Row 1: KPI Cards (4 in a row on desktop, 2x2 on tablet/mobile) */}
        <motion.section variants={itemVariants}>
          <AnalyticsKPICards />
        </motion.section>

        {/* Row 2: Threat Trends (wide, left) + Threat Distribution (donut, right) */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch"
        >
          {/* Threat Trends: Span 7 on lg, full width on tablet */}
          <div className="lg:col-span-7 flex flex-col">
            <ThreatTrendsCard />
          </div>

          {/* Threat Distribution: Span 5 on lg, full width on tablet */}
          <div className="lg:col-span-5 flex flex-col">
            <ThreatDistributionCard />
          </div>
        </motion.section>

        {/* Row 3: Top Threat Categories (bottom left) + Activity Overview (bottom right) */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch"
        >
          {/* Top Threat Categories: Span 6 on large */}
          <div className="lg:col-span-6 flex flex-col">
            <TopThreatCategoriesCard />
          </div>

          {/* Activity Overview: Span 6 on large */}
          <div className="lg:col-span-6 flex flex-col">
            <ActivityOverviewCard />
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
