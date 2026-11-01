import React, { useState } from 'react';
import { Server, Database, Check, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const SettingsPage: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl());
  const [fixtureMode, setFixtureMode] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetData = () => {
    api.resetDemoData();
    alert('Local demo fixture data has been reset to default state.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-wide">
            System & Feed Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure early warning ingestion endpoints, asset correlation triggers, and API contracts.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {/* API Endpoint Configuration */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-[#C6F432]" />
          <span>Backend API Contract & Target URL</span>
        </h2>

        <div>
          <label className="text-xs text-slate-300 block mb-1.5">
            Configurable Base URL (<code className="text-[#C6F432]">VITE_API_BASE_URL</code>):
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white font-mono outline-none focus:border-[#C6F432]"
            placeholder="http://localhost:8000/api/v1"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Expected endpoints: <code className="text-slate-300">GET /api/v1/alerts</code>,{' '}
            <code className="text-slate-300">GET /api/v1/alerts/:id</code>,{' '}
            <code className="text-slate-300">PATCH /api/v1/alerts/:id/status</code>
          </p>
        </div>

        {/* Fixture Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div>
            <div className="text-xs font-semibold text-white">Synthetic Fixture Mode</div>
            <div className="text-[11px] text-slate-400">
              When enabled, deterministic test advisories (CVE-2024-38077) are served offline.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFixtureMode(!fixtureMode)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              fixtureMode ? 'bg-[#C6F432]' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                fixtureMode ? 'right-1 bg-black' : 'left-1 bg-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Threat Feed Ingestion Sources */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Active Threat Intelligence Feeds</span>
        </h2>

        <div className="space-y-2.5 text-xs">
          {[
            { name: 'CISA Known Exploited Vulnerabilities (KEV)', status: 'Connected (Live)', cadence: 'Every 15 min' },
            { name: 'AlienVault OTX Pulse Mesh', status: 'Connected (Live)', cadence: 'Every 5 min' },
            { name: 'CERT-In National Advisory Stream', status: 'Connected (Live)', cadence: 'Every 30 min' },
            { name: 'NVD / NIST CVE Ingest API v2', status: 'Connected (Live)', cadence: 'Every 10 min' },
          ].map((feed) => (
            <div
              key={feed.name}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
            >
              <div>
                <span className="text-slate-200 font-medium">{feed.name}</span>
                <span className="text-slate-400 text-[10px] block mt-0.5">Poll Interval: {feed.cadence}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                {feed.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance & Reset */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-white">Reset Demo Fixture Records</div>
          <div className="text-[11px] text-slate-400">
            Resets all acknowledged and resolved alerts back to initial hackathon demo state.
          </div>
        </div>
        <button
          type="button"
          onClick={handleResetData}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Now</span>
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#C6F432] hover:bg-[#b8e528] text-black font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(198,244,50,0.3)] transition-all cursor-pointer"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};
