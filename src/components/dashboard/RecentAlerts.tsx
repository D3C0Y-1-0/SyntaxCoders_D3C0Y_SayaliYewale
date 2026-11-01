import React, { useState, useEffect } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { recentAlertsDisplay } from '../../data/mockData';

interface AlertItem {
  id: string;
  title: string;
  time: string;
  type: string;
  ringColor: string;
  glowColor: string;
  score: number;
  band: string;
}

interface RecentAlertsProps {
  onSelectAlert?: (alertId: string) => void;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({ onSelectAlert }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>(recentAlertsDisplay);

  // Simulated live event feed: occasionally slides in a new simulated alert at top
  useEffect(() => {
    const timer = setInterval(() => {
      const simulatedNewAlert: AlertItem = {
        id: `ALT-LIVE-${Date.now().toString().slice(-4)}`,
        title: 'Zero-Day Heuristic Probe Intercepted',
        time: 'Just now',
        type: 'zero-day',
        ringColor: '#C6F432',
        glowColor: 'rgba(198, 244, 50, 0.4)',
        score: 88,
        band: 'CRITICAL',
      };

      setAlerts((prev) => [simulatedNewAlert, ...prev.slice(0, 3)]);
    }, 28000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = (alertId: string) => {
    if (onSelectAlert) {
      onSelectAlert(alertId);
    } else {
      navigate(`/threats?id=${alertId}`);
    }
  };

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-medium text-white tracking-wide">
            Recent Alerts
          </h2>
        </div>

        <button
          type="button"
          onClick={() => navigate('/threats')}
          className="text-xs text-slate-400 hover:text-[#C6F432] flex items-center gap-1 transition-colors cursor-pointer group/link"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-2.5 my-auto">
        <AnimatePresence initial={false}>
          {alerts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleClick(item.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all cursor-pointer group/item"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {/* Colored Status Ring */}
                <div className="relative flex items-center justify-center shrink-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-transform group-hover/item:scale-110"
                    style={{ borderColor: item.ringColor }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: item.ringColor }}
                    />
                  </span>
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: item.ringColor }}
                  />
                </div>

                {/* Title */}
                <span className="text-xs font-normal text-slate-200 group-hover/item:text-white transition-colors truncate">
                  {item.title}
                </span>
              </div>

              {/* Timestamp */}
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {item.time}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
