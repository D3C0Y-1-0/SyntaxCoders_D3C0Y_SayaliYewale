# SentinelScope Shared Data Contract (v1)

> **Frozen API & Data Model Agreement for Persons 1, 2, and 3**  
> **API Prefix**: `/api/v1`  
> **Date**: October 31, 2026  
> **Status**: APPROVED & PUBLISHED

---

## 1. Domain Entities & Schemas

### 1.1 Advisory
Threat intelligence advisories ingested from fixture or public sources.
```json
{
  "id": 1,
  "source_id": 1,
  "external_id": "DEMO-ADV-2026-001",
  "cve_id": "CVE-2026-4011",
  "title": "Remote Code Execution in ExampleServer HTTP Core",
  "description": "A vulnerability in ExampleServer HTTP Core versions 4.0 through 4.3 allows remote attackers to execute arbitrary code via malformed headers.",
  "published_at": "2026-10-28T09:15:00Z",
  "severity": "CRITICAL",
  "cvss": 9.8,
  "exploited": true,
  "affected_products": [
    {
      "vendor": "ExampleCorp",
      "product": "ExampleServer",
      "version_range": ">=4.0.0, <=4.3.0"
    }
  ],
  "source_url": "https://example.invalid/advisories/DEMO-ADV-2026-001",
  "fetched_at": "2026-10-31T10:00:00Z"
}
```

### 1.2 Asset
Organization inventory item evaluated against incoming advisories.
```json
{
  "id": 12,
  "name": "web-prod-01",
  "product": "ExampleServer",
  "vendor": "ExampleCorp",
  "version": "4.2.1",
  "criticality": "high",
  "environment": "demo",
  "owner": "SecOps Team",
  "updated_at": "2026-10-25T14:00:00Z"
}
```

*Unrelated Asset Example (no false positive match)*:
```json
{
  "id": 99,
  "name": "db-analytics-02",
  "product": "PostgreSQL",
  "vendor": "PostgreSQL Global Development Group",
  "version": "16.1",
  "criticality": "medium",
  "environment": "demo",
  "owner": "Data Platform",
  "updated_at": "2026-10-20T11:00:00Z"
}
```

### 1.3 Match
Deterministic association between an Advisory and an Asset.
```json
{
  "advisory_id": 1,
  "asset_id": 12,
  "match_status": "candidate",
  "match_reason": "Product 'ExampleServer' matched; asset version 4.2.1 falls within vulnerable range [>=4.0.0, <=4.3.0]",
  "confidence": 0.85
}
```
- `match_status`: `"exact"` | `"candidate"` | `"none"`
- `confidence`: `0.0` to `1.0`

### 1.4 Alert
Prioritized, explainable warning generated from a matched advisory and asset context.
```json
{
  "id": "al_001",
  "advisory_id": 1,
  "score": 82,
  "band": "critical",
  "status": "new",
  "title": "ExampleServer 4.2 may be affected",
  "summary": "ExampleServer 4.2.1 running on critical asset web-prod-01 is susceptible to active exploitation reported in CVE-2026-4011.",
  "affected_assets": [
    {
      "asset_id": 12,
      "asset": "web-prod-01",
      "product": "ExampleServer",
      "version": "4.2.1",
      "criticality": "high",
      "match": "candidate",
      "confidence": 0.85,
      "match_reason": "Version 4.2.1 is within vulnerable range [4.0 - 4.3]"
    }
  ],
  "factors": {
    "severity": 22,
    "exploit": 30,
    "asset_criticality": 18,
    "confidence": 12
  },
  "evidence": [
    {
      "source": "demo fixture",
      "url": "https://example.invalid/advisory",
      "excerpt": "Active in-the-wild exploitation observed targeting exposed port 8443 on ExampleServer 4.2 instances."
    }
  ],
  "recommendations": [
    "Verify installed version on web-prod-01",
    "Restrict ingress access to management ports",
    "Apply vendor security update or temporary hotfix"
  ],
  "ai_provider": "deterministic_fallback",
  "ai_model": "rule-template-v1",
  "generated_at": "2026-10-31T10:15:00Z",
  "acknowledged_at": null
}
```

---

## 2. Risk Bands & Scoring Rule

- **Critical**: `80 - 100`
- **High**: `60 - 79`
- **Medium**: `35 - 59`
- **Low**: `0 - 34`

### Scoring Formula
$$\text{score} = \text{clamp}(0..100, \text{severity} + \text{known\_exploited} + \text{asset\_criticality} + \text{applicability\_confidence} + \text{freshness})$$

- Missing evidence contributes 0 and is labeled as `unknown`, never treated as safe.

---

## 3. Endpoints Overview

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service and database readiness |
| `GET` | `/api/v1/alerts` | Paginated and filtered alert queue (`band`, `status`, `q`, `limit`, `cursor`) |
| `GET` | `/api/v1/alerts/{id}` | Detailed alert record with evidence, factors, and recommendations |
| `PATCH` | `/api/v1/alerts/{id}/status` | Update analyst status (`status`, `note`) |
| `GET` | `/api/v1/dashboard/summary` | Aggregate alert counts by band and status, freshness |
| `GET` | `/api/v1/assets` | List asset inventory (`q`, `criticality`) |
| `POST` | `/api/v1/assets/import` | Import assets via CSV/JSON |
| `POST` | `/api/v1/ingestions` | Trigger fixture or public adapter ingestion |
| `GET` | `/api/v1/ingestions/{run_id}` | Ingestion run execution and results |

---

## 4. Standard Error Response
All 4xx and 5xx responses return:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Alert with id 'al_999' was not found",
    "request_id": "req-9844f2b1"
  }
}
```

