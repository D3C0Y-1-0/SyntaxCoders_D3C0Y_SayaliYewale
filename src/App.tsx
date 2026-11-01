import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewPage } from './pages/OverviewPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ThreatMapPage } from './pages/ThreatMapPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThreatProvider } from './context/ThreatContext';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/threats" element={<ThreatsPage />} />
          <Route path="/threats/:id" element={<ThreatsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/threat-map" element={<ThreatMapPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThreatProvider>
        <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col relative selection:bg-[#C6F432] selection:text-black">
          {/* Fixed Icon-Only Sidebar */}
          <Sidebar />

          {/* Main Workspace Area (offset by sidebar width on desktop) */}
          <div className="flex-1 flex flex-col md:pl-[74px] pb-16 md:pb-6 transition-all">
            {/* Top Header Bar */}
            <TopBar />

            {/* Page Routing with smooth page transitions */}
            <main className="flex-1 w-full">
              <AnimatedRoutes />
            </main>

            {/* Minimalist SOC Footer */}
            <footer className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <span className="font-display text-[#C6F432] font-semibold tracking-wider">CHITTI</span>
                <span>— Cyber Intelligence Threat Tracker</span>
              </div>
              <div>
                PS 01: AI-Based National Cyber Threat Early Warning System
              </div>
            </footer>
          </div>
        </div>
      </ThreatProvider>
    </BrowserRouter>
  );
};

export default App;
