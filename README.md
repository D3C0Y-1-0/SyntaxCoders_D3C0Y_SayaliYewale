# SentinelScope - AI-Assisted National Cyber Threat Early Warning System

> **Decision Support Workbench for Security Analysts & Vulnerability Managers**  
> *Correlates vulnerability threat advisories with organization asset inventory to produce explainable, prioritized warnings before incidents occur.*

---

## 1. Quick Start

### Prerequisites
- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (recommended) or standard Python virtual environment

### Installation & Environment Setup
```bash
# 1. Create and activate virtual environment
uv venv .venv --python 3.11
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# 2. Install dependencies
uv pip install -r requirements.txt

# 3. Create .env configuration
cp .env.example .env
```

### Database Initialization & Demo Fixture Seed
```bash
# Reset tables and seed demo assets + fixture advisories
python scripts/seed_demo.py
```

### Run API Server
```bash
python -m uvicorn api.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API Base URL**: `http://127.0.0.1:8000/api/v1`
- **Interactive OpenAPI Documentation (Swagger)**: `http://127.0.0.1:8000/docs`
- **Alternative API Documentation (ReDoc)**: `http://127.0.0.1:8000/redoc`
- **OpenAPI Schema Specification**: `http://127.0.0.1:8000/api/v1/openapi.json`

---

## 2. Shared Data Contract

The canonical data contract shared across Person 1 (Frontend), Person 2 (Backend), and Person 3 (AI/Scoring) is documented in:
- `docs/contracts/shared_data_contract.md`
- `docs/contracts/sample_alert.json`

### Core Data Models
| Model | Key Fields | Description |
|---|---|---|
| **Advisory** | `id`, `source_id`, `external_id`, `cve_id`, `title`, `description`, `published_at`, `severity`, `cvss`, `exploited`, `affected_products[]`, `source_url`, `fetched_at` | Ingested threat advisory record |
| **Asset** | `id`, `name`, `product`, `vendor`, `version`, `criticality`, `environment`, `owner` | Monitored organizational inventory |
| **Match** | `advisory_id`, `asset_id`, `match_status`, `match_reason`, `confidence` | Product/version applicability correlation |
| **Alert** | `id`, `advisory_id`, `score`, `band`, `score_factors{}`, `summary`, `status`, `generated_at` | Prioritized analyst warning with evidence |

### Risk Bands & Score Formula
$$\text{score} = \text{clamp}(0..100, \text{severity (0-25)} + \text{known\_exploited (0-30)} + \text{asset\_criticality (0-20)} + \text{confidence (0-15)} + \text{freshness (0-10)})$$

- **Critical**: `80 - 100`
- **High**: `60 - 79`
- **Medium**: `35 - 59`
- **Low**: `0 - 34`
- *Missing evidence contributes zero and is displayed as unknown, not treated as safe.*

---

## 3. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service and database readiness check |
| `GET` | `/api/v1/alerts` | Paginated alert list (supports `band`, `status`, `q`, `limit`, `cursor`) |
| `GET` | `/api/v1/alerts/{id}` | Alert detail, affected assets, factor breakdown, evidence, recommendations |
| `PATCH` | `/api/v1/alerts/{id}/status` | Update analyst status (`status`, `note`) |
| `GET` | `/api/v1/dashboard/summary` | Aggregate alert counts by band/status and source freshness |
| `GET` | `/api/v1/assets` | Asset inventory list (supports `q`, `criticality`) |
| `POST` | `/api/v1/assets/import` | Import assets via JSON payload |
| `POST` | `/api/v1/ingestions` | Trigger ingestion run (`fixture` or `public` CISA KEV) |
| `GET` | `/api/v1/ingestions/{run_id}` | Ingestion run execution and results |

### Standard Safe Error Envelope
All error responses adhere to the unified format:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Alert with id 'al_999' was not found",
    "request_id": "req-9844f2b1"
  }
}
```

---

## 4. Automated Testing & Verification

Run the complete test suite:
```bash
python -m pytest tests/
```
The suite verifies:
1. **Fresh setup & seed**: repeatable initialization.
2. **Idempotency**: repeat ingestion runs yield `records_changed == 0`.
3. **Match correctness**: target product/version maps to expected asset; unrelated asset is not falsely matched; missing version produces conservative candidate status.
4. **Scoring accuracy**: score calculation, factor attribution, and risk band thresholds.
5. **Persistence**: alert status changes and audit log entries persist across queries.
6. **Resilience**: simulated feed failures record run errors without deleting existing alerts or failing GET endpoints.
7. **Validation**: invalid parameters and unknown IDs produce safe 4xx responses.

---

## 5. Project Guardrails & Limitations
- **Decision support only**: Analysts validate matches and recommendations; the system does not take autonomous response actions.
- **Demo provenance**: Synthetic demo assets and advisories are explicitly labeled with `[DEMO FIXTURE]` and `[DEMO ASSET]`.
- **Offline reliable**: Runs 100% locally from bundled fixtures with no external credentials required.

