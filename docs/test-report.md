# SentinelScope | QA Verification and Test Report

> **Owner**: Person 3 (Risk scoring, AI enrichment, QA & deployment)  
> **Test Environment**: Python 3.12.10, Pytest 9.2.0, Windows Platform  
> **Total Test Cases Executed**: 33  
> **Pass Rate**: 100% (33 passed, 0 failed)  

---

## 1. Test Execution Matrix

| Test Suite | Area Checked | Test Function | Pass Condition | Result |
|---|---|---|---|---|
| **Scoring Math** | Formula Version | `test_formula_version_present` | Returns formula version `1.0.0` | **PASS** |
| **Scoring Math** | Maximum Clamping | `test_max_score_all_factors` | Maximum score clamp at 100 with all factors maxed | **PASS** |
| **Scoring Math** | Missing Evidence | `test_zero_score_all_unknown` | All unknown inputs yield 0 pts and populate `unknown_fields` | **PASS** |
| **Scoring Math** | Band Boundaries | `test_band_boundaries[0..100]` | Strict boundary checks: 34/35 (Low/Med), 59/60 (Med/High), 79/80 (High/Crit) | **PASS** |
| **Scoring Math** | Additive Integrity | `test_factor_sum_always_equals_total_score` | Sum of factor contributions equals total score across permutations | **PASS** |
| **Scoring Math** | Severity Hierarchy | `test_cvss_and_severity_precedence` | Numeric CVSS takes precedence; text severity fallback works | **PASS** |
| **Scoring Math** | Confidence Scaling | `test_candidate_confidence_scaling` | Candidate scales confidence x 15 with explicit reduction reasoning | **PASS** |
| **Scoring Math** | Freshness Brackets | `test_freshness_decay` | <=7d (10pts), <=30d (7pts), <=90d (4pts), >90d (1pt) | **PASS** |
| **Scoring Math** | Prioritization Ordering | `test_ordering_exploited_critical_vs_unrelated_low` | Exploited + critical asset outranks unexploited low-criticality asset | **PASS** |
| **AI Enrichment** | Input Sanitization | `test_sanitize_advisory_text_removes_scripts_and_caps_length` | Script tags, control chars stripped, max length bounded | **PASS** |
| **AI Enrichment** | Prompt Injection Defense | `test_prompt_injection_safety_prompt_construction` | Boundary tags `<ADVISORY_TEXT>` isolate untrusted content | **PASS** |
| **AI Enrichment** | Rule Fallback | `test_deterministic_fallback_cve_and_keyword_extraction` | Accurate regex CVE extraction and keyword matching | **PASS** |
| **AI Enrichment** | Substring Verification | `test_verify_evidence_spans_accepts_valid_and_rejects_hallucinations` | Verbatim quotes accepted; hallucinated quotes rejected | **PASS** |
| **AI Enrichment** | Timeout Resilience | `test_ai_service_handles_timeout_gracefully` | Simulated LLM timeout seamlessly falls back to rules | **PASS** |
| **AI Enrichment** | Malformed JSON Defense | `test_ai_service_handles_malformed_json_gracefully` | Malformed non-JSON output caught and replaced by fallback | **PASS** |
| **AI Enrichment** | Hallucination Rejection | `test_ai_service_rejects_hallucinated_quotes_and_falls_back` | Fabricated claims without source substring trigger fallback | **PASS** |
| **Cross-Module Smoke** | Health Readiness | `test_health_readiness` | `/api/v1/health` returns status `ok` and `database: ready` | **PASS** |
| **Cross-Module Smoke** | Ranked Ordering | `test_list_alerts_ordering` | `/api/v1/alerts` returns alerts strictly sorted by risk score desc | **PASS** |
| **Cross-Module Smoke** | Band Filter | `test_filter_alerts_by_band` | Filter by `critical`, `high`, `medium`, `low` | **PASS** |
| **Cross-Module Smoke** | Search Keyword | `test_filter_alerts_by_keyword` | Text search across CVE, product, and title | **PASS** |
| **Cross-Module Smoke** | Detail & Factors | `test_alert_detail_factors_and_evidence` | Factor sum equals score; matched assets and recommendations returned | **PASS** |
| **Cross-Module Smoke** | Analyst Triage | `test_analyst_status_update_and_audit_trail` | PATCH status updates state and writes audit log | **PASS** |
| **Cross-Module Smoke** | Input Validation | `test_invalid_status_rejection` | Invalid status enum raises HTTP 400 | **PASS** |
| **Cross-Module Smoke** | Error Handling | `test_nonexistent_alert_returns_404` | Querying unknown ID raises HTTP 404 | **PASS** |
| **Cross-Module Smoke** | Executive Dashboard | `test_dashboard_summary_metrics` | Aggregates counts by band and status correctly | **PASS** |
| **Cross-Module Smoke** | Idempotence | `test_ingestion_idempotence` | Repeated ingestion does not duplicate advisories or alerts | **PASS** |

---

## 2. Shared MVP Scenario Verification

- **Fixture Advisory**: `DEMO-ADV-2026-001` (CVE-2026-0001, Remote Code Execution in ExampleServer 4.2)
  - Criticality: CVSS 9.8 (25 pts)
  - Exploited: Active in the wild (30 pts)
  - Matched Asset: `web-prod-01` (Critical production asset, 20 pts)
  - Match Status: Exact product/version match (11 pts scaled candidate/exact)
  - Freshness: 2 days old (10 pts)
  - **Total Risk Score**: **96 / 100 (Band: Critical)**
- **Unrelated Asset**: `db-archive-01` (PostgreSQL 15.1, low criticality)
  - Match Status: None (0 pts)
  - Correctly unlinked from the ExampleServer advisory.
- **Incomplete Evidence Advisory**: `DEMO-ADV-2026-004`
  - All missing fields (severity, CVSS, exploit, date) returned as `unknown`
  - Contributed 0 fabricated points; final score: **0 / 100 (Band: Low)**.

