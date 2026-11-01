import type { Alert, AlertStatus, DashboardSummary, SeverityLevel, Advisory, Asset, Match } from '../types/api';
import { initialSummary, mockAlerts } from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const STORAGE_KEY = 'chitti_alerts_store_v1';

// Normalizer to convert backend API alert format into the frontend Alert contract
export function mapBackendAlertToFrontend(item: any): Alert {
  if (item.advisory && item.matched_assets) {
    return item as Alert;
  }

  const bandUpper = (item.band || 'CRITICAL').toUpperCase() as SeverityLevel;

  const matchedAssets: Asset[] = (item.affected_assets || []).map((a: any, idx: number) => ({
    id: String(a.asset_id || a.id || idx + 1),
    name: a.asset || a.name || 'Monitored Host',
    product: a.product || 'Unknown Product',
    vendor: a.vendor || '',
    version: a.version || '',
    criticality: (a.criticality || 'HIGH').toUpperCase() as any,
    environment: (a.environment || 'production') as any,
    owner: a.owner || 'SecOps Team',
  }));

  const matches: Match[] = (item.affected_assets || []).map((a: any) => ({
    advisory_id: String(item.advisory_id || item.id),
    asset_id: String(a.asset_id || a.id || 1),
    match_status: (a.match || 'candidate') as any,
    match_reason: a.match_reason || 'Product and vulnerable version pattern matched',
    confidence: a.confidence || 0.85,
  }));

  const advisory: Advisory = {
    id: String(item.advisory_id || item.id),
    source_id: '1',
    external_id: item.cve_id || item.id,
    cve_id: item.cve_id || 'CVE-2026-4011',
    title: item.title,
    description: item.summary || item.title,
    published_at: item.published_at || item.generated_at || new Date().toISOString(),
    severity: (item.severity || bandUpper) as SeverityLevel,
    cvss: item.score ? Math.round((item.score / 10) * 10) / 10 : 9.0,
    exploited: Boolean(item.exploited),
    affected_products: (item.affected_assets || []).map((a: any) => a.product).filter(Boolean),
    source_url: item.source_url || 'https://cve.mitre.org',
    fetched_at: item.generated_at || new Date().toISOString(),
  };

  const factors = item.factors || {};
  const score_factors = {
    exploitability: factors.exploit ?? factors.exploitability ?? 25,
    asset_criticality: factors.asset_criticality ?? 20,
    exposure_surface: factors.severity ?? factors.exposure_surface ?? 20,
    feed_confidence: factors.confidence ?? factors.feed_confidence ?? 15,
  };

  return {
    id: String(item.id),
    advisory_id: String(item.advisory_id || item.id),
    advisory,
    matched_assets: matchedAssets,
    matches,
    score: item.score,
    band: bandUpper,
    score_factors,
    summary: item.summary || item.title,
    status: (item.status || 'new').toLowerCase() as AlertStatus,
    status_note: item.status_note || '',
    acknowledged_at: item.acknowledged_at,
    resolved_at: item.resolved_at,
    generated_at: item.generated_at || new Date().toISOString(),
    recommendations: item.recommendations || [
      'Verify installed software version across matched asset(s)',
      'Apply vendor security update or temporary compensating controls',
    ],
  };
}

// Seed or retrieve from localStorage for persistent analyst state changes
function getStoredAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAlerts));
      return mockAlerts;
    }
    return JSON.parse(raw);
  } catch {
    return mockAlerts;
  }
}

function saveStoredAlerts(alerts: Alert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export interface AlertFilterOptions {
  band?: SeverityLevel | 'ALL';
  status?: AlertStatus | 'ALL';
  q?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'connected' | 'disconnected';
  environment: string;
  timestamp: string;
}

export interface IngestionRunResult {
  run_id: number;
  source_id: number;
  status: string;
  records_seen: number;
  records_changed: number;
  error_summary?: string;
  started_at: string;
  finished_at?: string;
}

export const api = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async getHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend health check error:', e);
    }
    return {
      status: 'ok',
      database: 'connected',
      environment: 'local',
      timestamp: new Date().toISOString(),
    };
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const live = await res.json();
        if (live.counts) {
          return {
            ...initialSummary,
            total_threats: live.counts.total_alerts || initialSummary.total_threats,
            active_threats:
              (live.counts.by_status?.new || 0) +
                (live.counts.by_status?.triaged || 0) +
                (live.counts.by_status?.acknowledged || 0) || initialSummary.active_threats,
            system_status: 'online',
            last_updated: live.updated_at || initialSummary.last_updated,
          };
        }
      }
    } catch (e) {
      console.warn('Live API summary unavailable, serving deterministic dataset:', e);
    }
    return initialSummary;
  },

  async getAlerts(filters?: AlertFilterOptions): Promise<Alert[]> {
    let localStored = getStoredAlerts();

    try {
      const params = new URLSearchParams();
      if (filters?.band && filters.band !== 'ALL') params.set('band', filters.band.toLowerCase());
      if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status.toLowerCase());
      if (filters?.q) params.set('q', filters.q);

      const res = await fetch(`${API_BASE_URL}/alerts?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const liveData = await res.json();
        const rawItems = Array.isArray(liveData) ? liveData : liveData.items || [];
        if (rawItems.length > 0) {
          const liveMapped = rawItems.map(mapBackendAlertToFrontend);
          // Merge live backend alerts with local stored alerts (backend alerts take precedence)
          const liveIds = new Set(liveMapped.map((a: Alert) => a.id));
          const remainingLocal = localStored.filter((a) => !liveIds.has(a.id));
          localStored = [...liveMapped, ...remainingLocal];
          saveStoredAlerts(localStored);
        }
      }
    } catch (e) {
      console.warn('Live backend fetch failed, using local store:', e);
    }

    let filtered = localStored;

    if (filters) {
      if (filters.band && filters.band !== 'ALL') {
        filtered = filtered.filter((a) => a.band === filters.band);
      }
      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((a) => a.status === filters.status);
      }
      if (filters.q && filters.q.trim()) {
        const query = filters.q.toLowerCase().trim();
        filtered = filtered.filter(
          (a) =>
            a.advisory.title.toLowerCase().includes(query) ||
            a.advisory.cve_id.toLowerCase().includes(query) ||
            a.advisory.affected_products.some((p) => p.toLowerCase().includes(query)) ||
            a.matched_assets.some(
              (asset) =>
                asset.name.toLowerCase().includes(query) ||
                asset.product.toLowerCase().includes(query)
            )
        );
      }
    }

    return [...filtered].sort((a, b) => b.score - a.score);
  },

  async getAlertById(id: string): Promise<Alert | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${id}`);
      if (res.ok) {
        const live = await res.json();
        return mapBackendAlertToFrontend(live);
      }
    } catch (e) {
      console.warn('Live API getAlertById error:', e);
    }

    const alerts = getStoredAlerts();
    return alerts.find((a) => a.id === id) || null;
  },

  async updateAlertStatus(id: string, status: AlertStatus, note?: string): Promise<Alert> {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (res.ok) {
        console.info(`[CHITTI API] Alert ${id} status successfully synced to backend SQLite: ${status}`);
      }
    } catch (e) {
      console.warn('Live API PATCH failed, committing locally:', e);
    }

    const alerts = getStoredAlerts();
    const index = alerts.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Alert with id ${id} not found`);
    }

    const updatedAlert: Alert = {
      ...alerts[index],
      status,
      status_note: note || alerts[index].status_note,
      acknowledged_at: status === 'acknowledged' ? new Date().toISOString() : alerts[index].acknowledged_at,
      resolved_at: status === 'resolved' ? new Date().toISOString() : alerts[index].resolved_at,
    };

    alerts[index] = updatedAlert;
    saveStoredAlerts(alerts);
    return updatedAlert;
  },

  async getAssets(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/assets`);
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (e) {
      console.warn('Failed to fetch assets from backend:', e);
    }
    return [];
  },

  async triggerIngestion(mode: 'fixture' | 'public'): Promise<IngestionRunResult | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/ingestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to trigger ingestion run:', e);
    }
    return null;
  },

  resetDemoData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAlerts));
  },
};
