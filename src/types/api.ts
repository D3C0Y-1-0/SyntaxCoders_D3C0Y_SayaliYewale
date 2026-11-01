export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type MatchStatus = 'exact' | 'candidate' | 'none';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface Advisory {
  id: string;
  source_id: string;
  external_id: string;
  cve_id: string;
  title: string;
  description: string;
  published_at: string; // ISO UTC
  severity: SeverityLevel;
  cvss: number;
  exploited: boolean;
  affected_products: string[];
  source_url: string;
  fetched_at: string;
}

export interface Asset {
  id: string;
  name: string;
  product: string;
  vendor: string;
  version: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  environment: 'production' | 'staging' | 'internal' | 'dmz';
  owner: string;
}

export interface Match {
  advisory_id: string;
  asset_id: string;
  match_status: MatchStatus;
  match_reason: string;
  confidence: number; // 0..1
}

export interface Alert {
  id: string;
  advisory_id: string;
  advisory: Advisory;
  matched_assets: Asset[];
  matches: Match[];
  score: number; // 0..100
  band: SeverityLevel;
  score_factors: {
    exploitability: number;
    asset_criticality: number;
    exposure_surface: number;
    feed_confidence: number;
  };
  summary: string;
  status: AlertStatus;
  status_note?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  generated_at: string;
  recommendations: string[];
}

export interface DashboardSummary {
  total_threats: number;
  total_threats_trend: string;
  active_threats: number;
  active_threats_trend: string;
  blocked_rate: number;
  blocked_rate_trend: string;
  avg_response_ms: number;
  avg_response_trend: string;
  system_status: 'online' | 'degraded' | 'maintenance';
  last_updated: string;
  countries_count: number;
}
