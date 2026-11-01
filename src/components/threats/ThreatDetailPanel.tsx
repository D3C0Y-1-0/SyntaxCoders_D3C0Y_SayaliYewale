import React, { useState } from 'react';
import {
  TriangleAlert,
  AlertCircle,
  Info,
  Sparkles,
  Monitor,
  CheckCircle2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThreats } from '../../context/ThreatContext';
import { AlertDetailDrawer } from './AlertDetailDrawer';
import type { Alert } from '../../types/api';

export const ThreatDetailPanel: React.FC = () => {
  const { selectedThreat, markAsAcknowledged } = useThreats();
  const [drawerAlert, setDrawerAlert] = useState<Alert | null>(null);

  if (!selectedThreat) return null;

  const isHigh = selectedThreat.riskLevel === 'High';
  const isMedium = selectedThreat.riskLevel === 'Medium';

  // Badge styling
  const badgeStyle = isHigh
    ? 'bg-red-500/15 text-[#FF4D4D] border-red-500/30'
    : isMedium
    ? 'bg-amber-500/15 text-[#FFB020] border-amber-500/30'
    : 'bg-emerald-500/15 text-[#7CE04B] border-emerald-500/30';

  const iconBg = isHigh
    ? 'bg-red-500/15 border-red-500/40 text-[#FF4D4D] shadow-[0_0_20px_rgba(255,77,77,0.25)]'
    : isMedium
    ? 'bg-amber-500/15 border-amber-500/40 text-[#FFB020] shadow-[0_0_20px_rgba(255,176,32,0.25)]'
    : 'bg-blue-500/15 border-blue-500/40 text-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.25)]';

  const handleOpenFullDetails = () => {
    // Map ThreatItem to full Alert format for the drawer
    const fullAlert: Alert = {
      id: selectedThreat.id,
      advisory_id: selectedThreat.subtitle,
      score: Math.round(selectedThreat.score * 10),
      band: selectedThreat.riskLevel === 'High' ? 'CRITICAL' : selectedThreat.riskLevel === 'Medium' ? 'HIGH' : 'LOW',
      status: selectedThreat.status.toLowerCase() as any,
      generated_at: new Date().toISOString(),
      summary: selectedThreat.summary,
      recommendations: selectedThreat.actions,
      score_factors: {
        exploitability: Math.round(selectedThreat.score * 3.5),
        asset_criticality: 28,
        exposure_surface: 18,
        feed_confidence: 9,
      },
      advisory: {
        id: `ADV-${selectedThreat.id}`,
        source_id: 'CERT_EARLY_WARNING',
        external_id: selectedThreat.subtitle,
        cve_id: selectedThreat.subtitle.startsWith('CVE') ? selectedThreat.subtitle : `CVE-2025-${selectedThreat.id}`,
        title: selectedThreat.title,
        description: selectedThreat.summary,
        published_at: '2025-10-28T14:32:00Z',
        severity: selectedThreat.riskLevel === 'High' ? 'CRITICAL' : selectedThreat.riskLevel === 'Medium' ? 'HIGH' : 'LOW',
        cvss: selectedThreat.score,
        exploited: selectedThreat.riskLevel === 'High',
        affected_products: selectedThreat.assets.map((a) => `${a.name} ${a.version || ''}`),
        source_url: 'https://nvd.nist.gov/',
        fetched_at: '2025-10-28T14:35:00Z',
      },
      matched_assets: selectedThreat.assets.map((a, i) => ({
        id: `AST-${i + 1}`,
        name: `${a.name} (Production East)`,
        product: a.name,
        vendor: 'Apache / Enterprise',
        version: a.version || 'v1.0',
        criticality: (a.risk?.toUpperCase() as any) || 'HIGH',
        environment: 'production',
        owner: 'SecOps Team',
      })),
      matches: selectedThreat.assets.map((_, i) => ({
        advisory_id: selectedThreat.subtitle,
        asset_id: `AST-${i + 1}`,
        match_status: 'exact',
        match_reason: 'Installed runtime package version matches vulnerability signature advisory.',
        confidence: 0.96,
      })),
    };

    setDrawerAlert(fullAlert);
  };

  return (
    <>
      <div className="glass-card p-5 sm:p-6 flex flex-col justify-between h-full select-none relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedThreat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Header: Large Icon + Title + Risk Badge + Subtitle */}
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                {selectedThreat.iconType === 'info' ? (
                  <Info className="w-6 h-6" />
                ) : selectedThreat.iconType === 'alert' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <TriangleAlert className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-display font-medium text-white leading-snug truncate">
                    {selectedThreat.title}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider shrink-0 ${badgeStyle}`}
                  >
                    {selectedThreat.riskLevel} Risk
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                  {selectedThreat.subtitle} • Published: {selectedThreat.publishedAt}
                </div>
              </div>
            </div>

            {/* Section 1: AI Summary */}
            <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#C6F432]" />
                  <span>AI Summary</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-400/30 text-[10px] font-medium text-sky-400">
                  AI Generated
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {selectedThreat.summary}
              </p>
            </div>

            {/* Section 2: Affected Assets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span>Affected Assets</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenFullDetails}
                  className="text-[11px] text-slate-400 hover:text-[#C6F432] flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                {selectedThreat.assets.length} assets match
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {selectedThreat.assets.map((asset, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200"
                  >
                    {asset.risk === 'critical' ? (
                      <span className="text-[#FF4D4D] font-bold text-xs leading-none">+</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020]" />
                    )}
                    <span>
                      {asset.name} {asset.version && <span className="text-slate-400">{asset.version}</span>}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 3: Recommended Actions */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recommended Actions</span>
              </div>
              <ol className="space-y-1.5 text-xs text-slate-300 pl-1">
                {selectedThreat.actions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons: Lime Acknowledge + Outlined View Details */}
        <div className="flex items-center gap-3 pt-5 border-t border-white/5">
          <button
            type="button"
            onClick={() => markAsAcknowledged(selectedThreat.id)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#C6F432] hover:bg-[#b5e324] text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(198,244,50,0.3)] transition-all cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {selectedThreat.status === 'Acknowledged' ? 'Acknowledged' : 'Mark as Acknowledged'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenFullDetails}
            className="py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Detail Drawer Modal */}
      {drawerAlert && (
        <AlertDetailDrawer
          alert={drawerAlert}
          onClose={() => setDrawerAlert(null)}
          onStatusUpdated={() => {
            markAsAcknowledged(selectedThreat.id);
          }}
        />
      )}
    </>
  );
};
