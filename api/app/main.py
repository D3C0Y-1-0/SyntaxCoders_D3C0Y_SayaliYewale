from contextlib import asynccontextmanager
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .core.config import settings
from .core.logging import setup_logging, logger
from .core.errors import (
    AppError,
    app_error_handler,
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from .db.init_db import init_db
from .api.v1 import api_v1_router

# Setup application logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SentinelScope application and database tables...")
    init_db()
    logger.info("SentinelScope ready to serve traffic.")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="SentinelScope National Cyber Threat Early Warning System API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware (allows frontend on any localhost port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    # Attach a unique request_id to each incoming request
    request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:8]}"
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Register Exception Handlers for safe standardized error responses
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Include API v1 Router
app.include_router(api_v1_router)


from fastapi.responses import HTMLResponse


@app.get("/", tags=["root"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/v1/health",
        "alerts": "/api/v1/alerts",
        "dashboard_api": "/api/v1/dashboard/summary",
        "interactive_ui": "/dashboard",
    }


@app.get("/dashboard", response_class=HTMLResponse, include_in_schema=False)
def serve_analyst_dashboard():
    """Embedded interactive dashboard for rapid local and offline demonstrations."""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SentinelScope | National Cyber Threat Early Warning</title>
  <style>
    :root {
      --bg: #0b1120;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --critical: #ef4444;
      --high: #f97316;
      --medium: #eab308;
      --low: #22c55e;
      --accent: #38bdf8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 24px; }
    header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--card-border); padding-bottom: 16px; margin-bottom: 24px; }
    .logo-badge { display: flex; align-items: center; gap: 12px; }
    .badge { background: #0369a1; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .demo-tag { background: #b45309; color: #fef3c7; padding: 3px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; font-weight: bold; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 16px; }
    .stat-val { font-size: 28px; font-weight: bold; margin-top: 8px; }
    .main-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 24px; }
    .panel { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; }
    .panel-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .alert-card { background: #0f172a; border: 1px solid var(--card-border); border-radius: 6px; padding: 14px; margin-bottom: 12px; cursor: pointer; transition: border 0.15s; }
    .alert-card:hover, .alert-card.active { border-color: var(--accent); }
    .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .risk-pill { font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
    .risk-critical { background: #7f1d1d; color: #fca5a5; }
    .risk-high { background: #7c2d12; color: #fdba74; }
    .risk-medium { background: #713f12; color: #fde047; }
    .risk-low { background: #14532d; color: #86efac; }
    .factor-bar { margin: 10px 0; }
    .factor-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
    .progress-track { background: #334155; border-radius: 4px; height: 8px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--accent); }
    .evidence-box { background: #020617; border-left: 3px solid var(--accent); padding: 12px; margin: 12px 0; font-size: 13px; line-height: 1.5; font-family: monospace; }
    .recommendation-list { list-style: none; margin: 12px 0; }
    .recommendation-list li { background: #0f172a; padding: 8px 12px; border-radius: 4px; margin-bottom: 6px; font-size: 13px; border-left: 3px solid #10b981; }
    button { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 13px; }
    button:hover { background: #0369a1; }
    .btn-ack { background: #059669; }
    .btn-ack:hover { background: #047857; }
  </style>
</head>
<body>
  <header>
    <div class="logo-badge">
      <h2>SentinelScope</h2>
      <span class="badge">Early Warning Prototype</span>
      <span class="demo-tag">Demonstration Data</span>
    </div>
    <div>
      <button onclick="fetchSummary(); fetchAlerts();">Refresh Feed</button>
      <a href="/docs" style="color: var(--accent); margin-left: 16px; font-size: 13px; text-decoration: none;" target="_blank">OpenAPI Specs &rarr;</a>
    </div>
  </header>

  <div class="stats-grid">
    <div class="stat-card">
      <div style="font-size: 12px; color: var(--text-muted);">MONITORED ASSETS</div>
      <div class="stat-val" id="stat-assets">-</div>
    </div>
    <div class="stat-card">
      <div style="font-size: 12px; color: var(--text-muted);">CRITICAL / HIGH ALERTS</div>
      <div class="stat-val" id="stat-critical-high" style="color: var(--critical);">-</div>
    </div>
    <div class="stat-card">
      <div style="font-size: 12px; color: var(--text-muted);">TOTAL ACTIVE ADVISORIES</div>
      <div class="stat-val" id="stat-total">-</div>
    </div>
    <div class="stat-card">
      <div style="font-size: 12px; color: var(--text-muted);">SCORING ENGINE</div>
      <div class="stat-val" style="font-size: 18px; color: var(--accent);">v1-weighted-transparent</div>
    </div>
  </div>

  <div class="main-grid">
    <div class="panel">
      <div class="panel-title">
        <span>Prioritized Alert Queue</span>
        <span style="font-size: 12px; color: var(--text-muted);">Ranked by Risk Formula</span>
      </div>
      <div id="alerts-list">Loading alerts...</div>
    </div>

    <div class="panel" id="detail-panel">
      <div class="panel-title">
        <span>Alert Decision Support & Evidence</span>
        <span id="detail-status-pill"></span>
      </div>
      <div id="detail-body">
        <p style="color: var(--text-muted);">Select an alert from the prioritized queue on the left to inspect its transparent score factors, matched assets, and verified evidence.</p>
      </div>
    </div>
  </div>

  <script>
    let currentAlertId = null;

    async function fetchSummary() {
      try {
        const res = await fetch('/api/v1/dashboard/summary');
        const data = await res.json();
        document.getElementById('stat-assets').innerText = data.monitored_assets;
        document.getElementById('stat-critical-high').innerText = (data.counts.critical || 0) + (data.counts.high || 0);
        document.getElementById('stat-total').innerText = data.total_alerts;
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchAlerts() {
      try {
        const res = await fetch('/api/v1/alerts');
        const data = await res.json();
        const listEl = document.getElementById('alerts-list');
        listEl.innerHTML = '';

        data.items.forEach(a => {
          const card = document.createElement('div');
          card.className = `alert-card ${currentAlertId === a.id ? 'active' : ''}`;
          card.onclick = () => loadDetail(a.id);
          card.innerHTML = `
            <div class="alert-header">
              <span class="risk-pill risk-${a.band}">${a.band} (${a.score}/100)</span>
              <span style="font-size: 11px; color: var(--text-muted);">${a.status.toUpperCase()}</span>
            </div>
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${a.title}</div>
            <div style="font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>${a.cve_id || 'No CVE'}</span>
              <span>Matched Assets: ${(a.affected_assets || []).length}</span>
            </div>
          `;
          listEl.appendChild(card);
        });

        if (data.items.length > 0 && !currentAlertId) {
          loadDetail(data.items[0].id);
        }
      } catch (e) {
        document.getElementById('alerts-list').innerText = 'Failed to load alerts: ' + e;
      }
    }

    async function loadDetail(alertId) {
      currentAlertId = alertId;
      document.querySelectorAll('.alert-card').forEach(el => el.classList.remove('active'));
      try {
        const res = await fetch(`/api/v1/alerts/${alertId}`);
        const data = await res.json();
        const bodyEl = document.getElementById('detail-body');
        
        let factorsHtml = '';
        const factors = data.factors || {};
        const maxPoints = { severity: 25, exploit: 30, asset_criticality: 20, confidence: 15, freshness: 10 };
        for (const [key, val] of Object.entries(factors)) {
          const max = maxPoints[key] || 25;
          const pct = Math.round((val / max) * 100);
          factorsHtml += `
            <div class="factor-bar">
              <div class="factor-header">
                <span style="text-transform: capitalize; font-weight: 600;">${key.replace('_', ' ')} (${val}/${max} pts)</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width: ${pct}%;"></div></div>
            </div>
          `;
        }

        let assetsHtml = '<p style="color: var(--text-muted); font-size: 13px;">No matching assets in local inventory.</p>';
        if (data.affected_assets && data.affected_assets.length > 0) {
          assetsHtml = data.affected_assets.map(a => `
            <div style="background: #0f172a; padding: 10px; border-radius: 4px; margin-bottom: 6px; font-size: 13px; display: flex; justify-content: space-between;">
              <div><strong>${a.asset}</strong> (${a.product} v${a.version || 'unknown'})</div>
              <div><span class="risk-pill risk-${a.criticality}">${a.criticality}</span> <span style="color: var(--accent); margin-left: 8px;">${a.match} (${Math.round(a.confidence * 100)}%)</span></div>
            </div>
          `).join('');
        }

        let recsHtml = (data.recommendations || []).map(r => `<li>${r}</li>`).join('');

        bodyEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <h3 style="margin-bottom: 4px;">${data.title}</h3>
              <div style="font-size: 12px; color: var(--text-muted);">${data.cve_id || ''} | Formula: ${data.formula_version}</div>
            </div>
            <div>
              <span class="risk-pill risk-${data.band}" style="font-size: 14px; padding: 6px 12px;">Score: ${data.score} / 100</span>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 6px;">AI-ASSISTED SUMMARY (${data.ai_provider.toUpperCase()})</div>
            <p style="font-size: 13px; line-height: 1.5;">${data.summary}</p>
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 6px;">EXPLAINABLE FACTOR BREAKDOWN</div>
            ${factorsHtml}
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 6px;">MATCHED ASSETS (${data.affected_assets.length})</div>
            ${assetsHtml}
          </div>

          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 6px;">VERIFIED SOURCE EVIDENCE</div>
            ${data.evidence.map(e => `
              <div class="evidence-box">
                <div style="color: var(--accent); margin-bottom: 4px; font-size: 11px;">[Provenance: ${e.source}]</div>
                ${e.excerpt}
              </div>
            `).join('')}
          </div>

          <div style="margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: bold; color: var(--text-muted); margin-bottom: 6px;">ACTIONABLE RECOMMENDATIONS</div>
            <ul class="recommendation-list">${recsHtml}</ul>
          </div>

          <div style="border-top: 1px solid var(--card-border); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--text-muted);">Current Status: <strong>${data.status.toUpperCase()}</strong></span>
            <div>
              <button class="btn-ack" onclick="updateStatus('${data.id}', 'acknowledged')">Acknowledge</button>
              <button style="background: #475569; margin-left: 8px;" onclick="updateStatus('${data.id}', 'resolved')">Resolve</button>
            </div>
          </div>
        `;
      } catch (e) {
        document.getElementById('detail-body').innerText = 'Failed to load alert details: ' + e;
      }
    }

    async function updateStatus(alertId, newStatus) {
      try {
        await fetch(`/api/v1/alerts/${alertId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, note: 'Analyst triage action from UI' })
        });
        loadDetail(alertId);
        fetchAlerts();
        fetchSummary();
      } catch (e) {
        alert('Status update failed: ' + e);
      }
    }

    // Initialize
    fetchSummary();
    fetchAlerts();
  </script>
</body>
</html>
"""
    return HTMLResponse(content=html_content)
