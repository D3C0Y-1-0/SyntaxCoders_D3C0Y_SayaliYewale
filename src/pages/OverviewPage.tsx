import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '../components/dashboard/HeroSection';
import { Globe3D } from '../components/dashboard/Globe3D';
import { ChittiMascotAssistant } from '../components/dashboard/ChittiMascotAssistant';
import { ThreatActivityChart } from '../components/dashboard/ThreatActivityChart';
import { ThreatSourcesChart } from '../components/dashboard/ThreatSourcesChart';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { GlobalThreatMap } from '../components/dashboard/GlobalThreatMap';
import { SecurityStatusCard } from '../components/dashboard/SecurityStatusCard';
import { BotanicalLeavesBottomLeft, BotanicalLeavesTopRight } from '../components/decorations/BotanicalLeaves';
import { AlertDetailDrawer } from '../components/threats/AlertDetailDrawer';
import type { Alert } from '../types/api';
import { api } from '../lib/api';

export const OverviewPage: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const handleSelectAlertId = async (id: string) => {
    const alert = await api.getAlertById(id);
    if (alert) {
      setSelectedAlert(alert);
    }
  };

  return (
    <div className="relative w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Decorative Botanical Leaves Elements */}
      <BotanicalLeavesBottomLeft />
      <BotanicalLeavesTopRight />

      {/* Background Soft Blue/Lime Radial Gradients */}
      <div className="pointer-events-none absolute -top-20 left-1/3 w-[600px] h-[500px] bg-blue-700/10 rounded-full blur-[140px] z-0" />
      <div className="pointer-events-none absolute top-1/2 right-10 w-[500px] h-[400px] bg-[#C6F432]/5 rounded-full blur-[130px] z-0" />

      {/* Row 1: Hero (Left) + 3D Rotating Globe (Center) + CHITTI Mascot Assistant (Right) */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Hero & 4 Stat Cards: Span 5 on large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="lg:col-span-5 h-full flex flex-col justify-between"
        >
          <HeroSection />
        </motion.div>

        {/* 3D Rotating Globe: Span 4 on large */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="lg:col-span-4 flex items-center justify-center relative min-h-[300px]"
        >
          <Globe3D />
        </motion.div>

        {/* CHITTI Mascot & AI Assistant Card: Span 3 on large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="lg:col-span-3 flex flex-col justify-center"
        >
          <ChittiMascotAssistant />
        </motion.div>
      </section>

      {/* Row 2: Threat Activity (Left) + Threat Sources (Center) + Recent Alerts (Right) */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Threat Activity Area Chart (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="lg:col-span-5"
        >
          <ThreatActivityChart />
        </motion.div>

        {/* Threat Sources Donut Chart (Span 4) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-4"
        >
          <ThreatSourcesChart />
        </motion.div>

        {/* Recent Alerts List (Span 3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="md:col-span-2 lg:col-span-3"
        >
          <RecentAlerts onSelectAlert={handleSelectAlertId} />
        </motion.div>
      </section>

      {/* Row 3: Global Threat Map (Left) + Security Status (Right) - 3rd box removed */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Global Threat Map (Span 7) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="lg:col-span-7"
        >
          <GlobalThreatMap />
        </motion.div>

        {/* Security Status Card with rich green shade (Span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="lg:col-span-5"
        >
          <SecurityStatusCard />
        </motion.div>
      </section>


      {/* Interactive Alert Detail Drawer */}
      {selectedAlert && (
        <AlertDetailDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onStatusUpdated={(updated) => setSelectedAlert(updated)}
        />
      )}
    </div>
  );
};
