# SentinelScope | Live Demo Runbook & Operator Guide

> **Author**: Person 3 (Risk Scoring, AI Enrichment, QA & Deployment)  
> **Target Audience**: Presenter, Operator, Judges, and Teammates  
> **Product**: SentinelScope Cyber Threat Early Warning Prototype  

---

## 1. Quick Start & Launch Commands

### Prerequisites
- Python 3.10+ (Tested on Python 3.12)
- Dependencies installed: `pip install -r requirements.txt`

### Step 1: Clean Reset & Fixture Seed
Ensure demo data is at the baseline state before beginning:
```bash
python scripts/reset_db.py
```
*Expected Output:*
```text
[SentinelScope] Resetting database and reloading initial demo fixtures...
[SentinelScope] Database reset completed successfully.
```

### Step 2: Start the Web Server
Launch the FastAPI service with embedded interactive dashboard:
```bash
python -m uvicorn api.app.main:app --host 127.0.0.1 --port 8000
```
- **Web UI & Dashboard**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **OpenAPI Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Endpoint**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 2. Four-Minute Demonstration Script

| Timing | Segment | Speaker Script & Action | Key Screen / Endpoint |
|---|---|---|---|
| **0:00 - 0:30** | **Operational Problem** | *"Security teams are flooded with thousands of daily vulnerability bulletins, CISA alerts, and threat reports. Most alerts are ignored because analysts can't quickly answer: Does this affect our actual servers right now, how urgent is it, and what should we do first? SentinelScope solves this by joining external threat intelligence to organizational asset inventories with transparent, explainable risk ranking."* | Dashboard header showing "SentinelScope Early Warning Prototype" and "Demonstration Data" badge. |
| **0:30 - 1:10** | **Situational Awareness** | *"Here is the early warning overview. We monitor 4 registered enterprise assets against multi-source advisories. Notice the prioritized queue on the left: advisories are not listed chronologically or by vendor severity alone; they are ranked by a deterministic composite risk score from 0 to 100."* | Point to monitored assets metric, critical/high alert counter, and ranked alert queue. |
| **1:10 - 2:00** | **Targeted Match Scenario** | *"Let's open the top-ranked alert: 'Remote Code Execution in ExampleServer 4.2' (Score: 96/100, Critical). SentinelScope matched this vulnerability directly against our high-criticality production asset `web-prod-01`. Meanwhile, an unrelated asset like `db-archive-01` was correctly excluded. The match reason is explicit: product name and version 4.2.0 matched the affected vendor specification."* | Click on Alert #1. Highlight the Matched Assets section showing `web-prod-01 (critical)`. |
| **2:00 - 2:45** | **Explainability & AI Boundary** | *"Look at the 'Why Ranked' factor breakdown. Unlike a black-box model, each factor is fully audited: Severity awards 25/25 pts (CVSS 9.8); Active Exploitation adds 30/30 pts; Asset Criticality contributes 20/20 pts; Match Confidence gives 11/15 pts; and Freshness gives 10/10 pts. Displayed factor sum equals exactly 96. Notice the AI summary: the LLM provides plain-language decision support, but every claim is constrained by verified substring quotes from the raw advisory. If AI is offline or produces hallucinations, our deterministic rule engine seamlessly takes over."* | Expand factor progress bars; highlight verified source evidence box and rule fallback tag. |
| **2:45 - 3:20** | **Remediation & Triage Action** | *"Analysts receive immediate actionable next steps: verify installed version on `web-prod-01`, apply vendor patch 4.3, and isolate ingress. The analyst clicks 'Acknowledge'. Notice the status updates immediately and records an immutable audit timestamp in the database. Refreshing the browser preserves this triage state."* | Click "Acknowledge" button. Status changes to ACKNOWLEDGED with green badge. Refresh page to show state persistence. |
| **3:20 - 4:00** | **Architecture & Guardrails** | *"SentinelScope is architected with strict separation: deterministic Python scoring engine first, schema-constrained AI extraction second, and relational persistence in SQLite/PostgreSQL. In production, this ingests live CISA KEV and NVD feeds. Most importantly, SentinelScope provides decision support for analysts—it does not claim autonomous action or predictive magic."* | Show architecture slide / API docs at `/docs`. Close presentation. |

---

## 3. How to Demonstrate Offline Fallback Mode

To prove prototype resilience to judges:
1. Stop any external network connection or set in `.env`:
   ```env
   AI_PROVIDER=fallback
   ```
2. Restart or trigger ingestion:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/v1/ingestions -H "Content-Type: application/json" -d "{\"source_id\":\"demo_fixture\",\"mode\":\"demo\"}"
   ```
3. Open the alert in the UI:
   - Notice badge displays `AI-ASSISTED SUMMARY (FALLBACK: RULE-BASED)`
   - Full risk scoring, factors, and recommendations continue to function without any degradation.

---

## 4. Key Claims and Guardrails (Presentation Boundaries)

> [!IMPORTANT]
> Always adhere to these boundaries during judging:
> - **What to say**: *"The prototype flags a potential match based on software inventory and calculates a transparent prioritization aid."*
> - **What NOT to claim**: Do not claim that SentinelScope "predicts attacks before they happen", "replaces human analysts", or "detects active malware compromise". It is decision support for vulnerability exposure.
> - **Synthetic data label**: All demo records are visibly tagged as `is_demo=True` with `example.invalid` placeholder URLs.

