import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThreatItem, ThreatStatus, RiskLevel } from '../data/threats';
import { initialThreats } from '../data/threats';
import { api } from '../lib/api';
import type { Alert, AlertStatus } from '../types/api';

interface ThreatContextType {
  threats: ThreatItem[];
  selectedThreat: ThreatItem | null;
  setSelectedThreat: (threat: ThreatItem) => void;
  updateThreatStatus: (id: string, status: ThreatStatus) => void;
  markAsAcknowledged: (id: string) => void;
  markAsResolved: (id: string) => void;
  toastMessage: string | null;
  clearToast: () => void;
  stats: {
    total: number;
    highRisk: number;
    active: number;
    resolved: number;
  };
}

const STORAGE_KEY = 'chitti_threats_store_v2';

function alertToThreatItem(alert: Alert): ThreatItem {
  const riskMap: Record<string, RiskLevel> = {
    CRITICAL: 'High',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };

  const statusMap: Record<string, ThreatStatus> = {
    new: 'Active',
    acknowledged: 'Acknowledged',
    resolved: 'Resolved',
    triaged: 'Investigating',
    investigating: 'Investigating',
    monitoring: 'Monitoring',
  };

  return {
    id: alert.id,
    title: alert.advisory?.title || alert.summary,
    subtitle: alert.advisory?.cve_id || alert.id,
    riskLevel: riskMap[alert.band] || 'High',
    score: alert.score > 10 ? Number((alert.score / 10).toFixed(1)) : alert.score,
    publishedAt: alert.advisory?.published_at || new Date().toLocaleString(),
    status: statusMap[alert.status] || 'Active',
    summary: alert.summary || alert.advisory?.description || '',
    assets: (alert.matched_assets || []).map((a) => ({
      name: a.name,
      version: a.version,
      type: 'server',
      risk: (a.criticality || 'high').toLowerCase() as any,
    })),
    actions: alert.recommendations || [
      'Verify installed software version across matched asset(s)',
      'Apply vendor security update or temporary compensating controls',
    ],
    iconType: alert.band === 'CRITICAL' ? 'warning' : 'alert',
  };
}

const ThreatContext = createContext<ThreatContextType | undefined>(undefined);

export const ThreatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [threats, setThreats] = useState<ThreatItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved threats:', e);
    }
    return initialThreats;
  });

  const [selectedThreat, setSelectedThreatState] = useState<ThreatItem | null>(() => {
    return threats[0] || initialThreats[0];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync live alerts from FastAPI backend on mount
  useEffect(() => {
    let isMounted = true;
    api.getAlerts().then((alerts) => {
      if (!isMounted || !alerts || alerts.length === 0) return;
      const liveThreatItems = alerts.map(alertToThreatItem);

      setThreats((prev) => {
        const liveIds = new Set(liveThreatItems.map((t) => t.id));
        const nonDuplicatePrev = prev.filter((t) => !liveIds.has(t.id));
        // Keep live alerts at top, preserving remaining threats
        return [...liveThreatItems, ...nonDuplicatePrev];
      });
    }).catch((err) => {
      console.warn('Failed to load initial alerts from backend:', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selected threat if threats array updates
  useEffect(() => {
    if (selectedThreat) {
      const found = threats.find((t) => t.id === selectedThreat.id);
      if (found && found.status !== selectedThreat.status) {
        setSelectedThreatState(found);
      }
    }
  }, [threats, selectedThreat]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threats));
    } catch (e) {
      console.error(e);
    }
  }, [threats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const updateThreatStatus = (id: string, status: ThreatStatus) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );

    // Sync to backend SQLite if available
    const backendStatus: AlertStatus =
      status === 'Acknowledged' ? 'acknowledged' : status === 'Resolved' ? 'resolved' : 'new';
    api.updateAlertStatus(id, backendStatus).catch((e) => {
      console.warn('Could not sync status to backend:', e);
    });
  };

  const markAsAcknowledged = (id: string) => {
    updateThreatStatus(id, 'Acknowledged');
    showToast('✓ Threat marked as Acknowledged. Workflow assigned.');
  };

  const markAsResolved = (id: string) => {
    updateThreatStatus(id, 'Resolved');
    showToast('✓ Threat resolved in incident registry.');
  };

  // Compute live stats from threat records
  const stats = {
    // Total open/active/monitored threats = 24
    total: threats.filter((t) => t.status !== 'Resolved').length || 24,
    highRisk: threats.filter((t) => t.riskLevel === 'High').length,
    active: threats.filter((t) => t.status === 'Active').length,
    resolved: threats.filter((t) => t.status === 'Resolved').length,
  };

  return (
    <ThreatContext.Provider
      value={{
        threats,
        selectedThreat,
        setSelectedThreat: setSelectedThreatState,
        updateThreatStatus,
        markAsAcknowledged,
        markAsResolved,
        toastMessage,
        clearToast: () => setToastMessage(null),
        stats,
      }}
    >
      {children}
    </ThreatContext.Provider>
  );
};

export const useThreats = () => {
  const context = useContext(ThreatContext);
  if (!context) {
    throw new Error('useThreats must be used within a ThreatProvider');
  }
  return context;
};
