import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  ShieldAlert,
  Server,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  FileText,
  Check,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Alert, AlertStatus, SeverityLevel } from '../../types/api';
import { api } from '../../lib/api';

interface AlertDetailDrawerProps {
  alert: Alert | null;
  onClose: () => void;
  onStatusUpdated?: (updated: Alert) => void;
}

const getBandColor = (band: SeverityLevel) => {
  switch (band) {
    case 'CRITICAL':
      return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' };
    case 'HIGH':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'MEDIUM':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'LOW':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    default:
      return { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' };
  }
};

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({
  alert,
  onClose,
  onStatusUpdated,
}) => {
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(alert);
  const [statusNote, setStatusNote] = useState(alert?.status_note || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Keep in sync when alert prop changes
  React.useEffect(() => {
    setCurrentAlert(alert);
    setStatusNote(alert?.status_note || '');
    setFeedbackMessage(null);
  }, [alert]);

  if (!currentAlert) return null;

  const bandStyle = getBandColor(currentAlert.band);

  const handleUpdateStatus = async (newStatus: AlertStatus) => {
    setIsUpdating(true);
    setFeedbackMessage(null);
    try {
      const updated = await api.updateAlertStatus(currentAlert.id, newStatus, statusNote);
      setCurrentAlert(updated);
      if (onStatusUpdated) onStatusUpdated(updated);

      if (newStatus === 'resolved') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#C6F432', '#38BDF8', '#3B5BDB'],
        });
        setFeedbackMessage('Threat marked as Resolved in incident audit log.');
      } else if (newStatus === 'acknowledged') {
        setFeedbackMessage('Alert Acknowledged by Analyst. Workflow active.');
      }
    } catch (err) {
      console.error(err);
      setFeedbackMessage('Failed to update status. Please retry.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
        />

        {/* Slide-in Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-[#090D15] border-l border-white/15 h-full overflow-y-auto flex flex-col z-10 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]"
        >
          {/* Drawer Header */}
          <div className="sticky top-0 z-20 px-6 py-4 bg-[#090D15]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wider ${bandStyle.bg} ${bandStyle.text} ${bandStyle.border}`}
              >
                {currentAlert.band} RISK ({currentAlert.score}/100)
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentAlert.id}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 text-sm text-slate-300">
            {/* Title & Advisory Metadata */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-display font-medium text-white leading-tight">
                {currentAlert.advisory.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[#C6F432] font-mono font-semibold">
                  {currentAlert.advisory.cve_id}
                </span>

                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Published: {new Date(currentAlert.advisory.published_at).toUTCString()}</span>
                </span>

                <a
                  href={currentAlert.advisory.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sky-400 hover:underline"
                >
                  <span>{currentAlert.advisory.source_id}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Severity & Exploit Status Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">CVSS Base</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {currentAlert.advisory.cvss}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Exploited in Wild</div>
                <div className="text-sm font-semibold mt-1">
                  {currentAlert.advisory.exploited ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> YES (Active C2)
                    </span>
                  ) : (
                    <span className="text-slate-400">No public exploit</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Status</div>
                <div className="text-sm font-semibold mt-1 capitalize text-[#C6F432]">
                  {currentAlert.status}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Affected Assets</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {currentAlert.matched_assets.length}
                </div>
              </div>
            </div>

            {/* Factor-by-Factor Risk Score Breakdown */}
            <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#C6F432]" />
                  <span>Factor-by-Factor Risk Score</span>
                </h3>
                <span className="text-xs font-mono font-bold text-[#C6F432]">
                  Total: {currentAlert.score} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <div className="flex justify-between text-slate-400 pb-1">
                    <span>Exploitability:</span>
                    <span className="font-mono text-white">{currentAlert.score_factors.exploitability} pts</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${(currentAlert.score_factors.exploitability / 40) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 pb-1">
                    <span>Asset Criticality:</span>
                    <span className="font-mono text-white">{currentAlert.score_factors.asset_criticality} pts</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(currentAlert.score_factors.asset_criticality / 30) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 pb-1">
                    <span>Exposure Surface:</span>
                    <span className="font-mono text-white">{currentAlert.score_factors.exposure_surface} pts</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${(currentAlert.score_factors.exposure_surface / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 pb-1">
                    <span>Threat Confidence:</span>
                    <span className="font-mono text-white">{currentAlert.score_factors.feed_confidence} pts</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${(currentAlert.score_factors.feed_confidence / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generated Threat Summary (With required AI GENERATED badge) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C6F432]/5 to-transparent border border-[#C6F432]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C6F432]/10 border border-[#C6F432]/40 text-[10px] font-bold text-[#C6F432] tracking-wider uppercase">
                  <Sparkles className="w-3 h-3" />
                  AI Generated Decision Support
                </span>
                <span className="text-[10px] text-slate-400">Analyst Verification Required</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                {currentAlert.summary}
              </p>
            </div>

            {/* Matched Asset Inventory & Candidate Reason */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sky-400" />
                <span>Matched Enterprise Asset Inventory ({currentAlert.matched_assets.length})</span>
              </h3>

              <div className="space-y-2">
                {currentAlert.matched_assets.map((asset) => {
                  const matchInfo = currentAlert.matches.find(m => m.asset_id === asset.id);
                  const isMatch = matchInfo?.match_status === 'exact';

                  return (
                    <div
                      key={asset.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isMatch
                          ? 'bg-red-950/20 border-red-500/30'
                          : 'bg-white/[0.02] border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-white text-xs">{asset.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Product: <span className="text-slate-200">{asset.product}</span> (v{asset.version})
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isMatch
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/40'
                          }`}
                        >
                          {matchInfo ? matchInfo.match_status.toUpperCase() : 'NONE'} (
                          {matchInfo ? `${Math.round(matchInfo.confidence * 100)}%` : '0%'})
                        </span>
                      </div>

                      {matchInfo && (
                        <div className="mt-2 text-[11px] p-2 rounded-lg bg-black/40 text-slate-300 border border-white/5 font-mono">
                          <span className="text-[#C6F432]">Match Reason: </span>
                          {matchInfo.match_reason}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                        <span>Environment: <strong className="text-slate-200">{asset.environment}</strong></span>
                        <span>Criticality: <strong className="text-slate-200">{asset.criticality}</strong></span>
                        <span>Owner: <strong className="text-slate-200">{asset.owner}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Verification & Mitigation Steps */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Actionable Recommendations</span>
              </h3>
              <ul className="space-y-1.5 text-xs">
                {currentAlert.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-[#C6F432]/10 text-[#C6F432] font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-200">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Source Raw Evidence Excerpt (Escaped safely without raw HTML) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Advisory Raw Evidence Excerpt</span>
              </h3>
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-300 whitespace-pre-wrap break-words overflow-x-auto leading-relaxed">
                {currentAlert.advisory.description}
              </pre>
            </div>

            {/* Analyst State Changes & Action Controls */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/15 space-y-3">
              <div className="text-xs font-semibold text-white uppercase tracking-wider">
                Analyst Incident Triage & Record
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Analyst Investigation Note:
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Record mitigation action taken, ticket link, or firewall change ID..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-[#C6F432]"
                />
              </div>

              {feedbackMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={isUpdating || currentAlert.status === 'acknowledged'}
                  onClick={() => handleUpdateStatus('acknowledged')}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {currentAlert.status === 'acknowledged' ? 'Already Acknowledged' : 'Acknowledge Alert'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating || currentAlert.status === 'resolved'}
                  onClick={() => handleUpdateStatus('resolved')}
                  className="px-4 py-2.5 rounded-xl bg-[#C6F432] hover:bg-[#b8e528] disabled:opacity-40 text-black font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(198,244,50,0.3)] transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {currentAlert.status === 'resolved' ? 'Resolved' : 'Mark as Resolved'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
