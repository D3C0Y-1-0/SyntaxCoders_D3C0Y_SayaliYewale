"""Cross-module smoke and API integration tests for SentinelScope prototype.

Directly validates endpoints, service pipelines, database state transitions, and audit trails.
Safe for restricted and offline execution environments without requiring loopback networking.
"""

import pytest
from fastapi import HTTPException
from api.app.db.session import SessionLocal
from api.app.db.seed import seed_database
from api.app.db.models import AlertModel, AuditEventModel
from api.app.api.v1.health import get_health
from api.app.api.v1.alerts import list_alerts, get_alert_detail, update_alert_status
from api.app.api.v1.assets import list_assets
from api.app.api.v1.dashboard import get_dashboard_summary
from api.app.api.v1.ingestions import trigger_ingestion
from api.app.schemas.alert import AlertStatusUpdate
from api.app.schemas.ingestion import IngestionRequest


@pytest.fixture(scope="module")
def db_session():
    """Seed fresh database and yield session."""
    db = SessionLocal()
    try:
        seed_database(db, force_reset=True)
        yield db
    finally:
        db.close()


def test_health_readiness(db_session):
    """Verify service and database health readiness probe."""
    res = get_health(db=db_session)
    assert res["status"] == "ok"
    assert res["database"] == "ready"
    assert res["version"] == "1.0.0"


def test_list_alerts_ordering(db_session):
    """Verify alert listing orders records strictly by deterministic risk score descending."""
    res = list_alerts(band=None, status=None, q=None, limit=50, cursor=None, db=db_session)
    assert "items" in res
    assert res["total"] >= 5

    items = res["items"]
    scores = [item.score for item in items]
    assert scores == sorted(scores, reverse=True), f"Alerts are not sorted by score: {scores}"

    # Top alert must be the high-risk MVP fixture
    top = items[0]
    assert top.score >= 80
    assert top.band == "critical"
    assert "ExampleServer" in top.title


def test_filter_alerts_by_band(db_session):
    """Verify filtering by risk band."""
    res_crit = list_alerts(band="critical", status=None, q=None, limit=50, cursor=None, db=db_session)
    for a in res_crit["items"]:
        assert a.band == "critical"

    res_low = list_alerts(band="low", status=None, q=None, limit=50, cursor=None, db=db_session)
    for a in res_low["items"]:
        assert a.band == "low"


def test_filter_alerts_by_keyword(db_session):
    """Verify search filter matches title, description, or CVE."""
    res = list_alerts(band=None, status=None, q="OpenSSL", limit=50, cursor=None, db=db_session)
    assert len(res["items"]) >= 1
    assert any("OpenSSL" in a.title for a in res["items"])


def test_alert_detail_factors_and_evidence(db_session):
    """Verify complete alert detail returns verified evidence, factor breakdown, and recommendations."""
    # Find top alert
    res = list_alerts(band=None, status=None, q=None, limit=10, cursor=None, db=db_session)
    top_id = res["items"][0].id

    detail = get_alert_detail(top_id, db=db_session)
    assert detail.id == top_id
    assert detail.formula_version == "1.0.0"
    assert detail.score >= 80
    assert detail.band == "critical"

    # Verify score factor integrity: sum(values) == total score
    factors = detail.score_factors
    assert "severity" in factors
    assert "exploit" in factors
    assert "asset_criticality" in factors
    assert "confidence" in factors
    assert "freshness" in factors

    factor_sum = sum(f["value"] for f in factors.values())
    assert factor_sum == detail.score, f"Displayed factor sum {factor_sum} does not equal score {detail.score}"

    # Verify matched assets presence
    assert len(detail.affected_assets) > 0
    top_asset = detail.affected_assets[0]
    assert top_asset.criticality == "critical"
    assert top_asset.match_status in ("exact", "candidate")

    # Verify evidence and recommendations
    assert len(detail.evidence) > 0
    assert detail.evidence[0].source != ""
    assert len(detail.recommendations) > 0
    assert any("patch" in r.lower() or "verify" in r.lower() for r in detail.recommendations)


def test_analyst_status_update_and_audit_trail(db_session):
    """Verify state transitions and audit logging upon analyst triage."""
    res = list_alerts(band=None, status=None, q=None, limit=10, cursor=None, db=db_session)
    alert_id = res["items"][0].id

    # Update status to acknowledged
    payload = AlertStatusUpdate(status="acknowledged", note="Verified with SecOps on-call")
    update_res = update_alert_status(alert_id, payload, db=db_session)

    assert update_res["status"] == "acknowledged"
    assert update_res["note"] == "Verified with SecOps on-call"

    # Confirm persistence in DB
    refreshed = get_alert_detail(alert_id, db=db_session)
    assert refreshed.status == "acknowledged"
    assert refreshed.acknowledged_at is not None

    # Check audit event
    audit = db_session.query(AuditEventModel).filter_by(alert_id=alert_id).first()
    assert audit is not None
    assert audit.action == "status_change_to_acknowledged"
    assert audit.actor == "analyst"
    assert audit.note == "Verified with SecOps on-call"


def test_invalid_status_rejection(db_session):
    """Verify invalid status transition raises HTTP 400."""
    res = list_alerts(band=None, status=None, q=None, limit=10, cursor=None, db=db_session)
    alert_id = res["items"][0].id

    with pytest.raises(HTTPException) as exc:
        update_alert_status(alert_id, AlertStatusUpdate(status="invalid_state"), db=db_session)
    assert exc.value.status_code == 400


def test_nonexistent_alert_returns_404(db_session):
    """Verify querying non-existent alert returns HTTP 404."""
    with pytest.raises(HTTPException) as exc:
        get_alert_detail(99999, db=db_session)
    assert exc.value.status_code == 404


def test_dashboard_summary_metrics(db_session):
    """Verify aggregated metrics for the executive dashboard."""
    summary = get_dashboard_summary(db=db_session)
    assert summary.total_alerts >= 5
    assert summary.monitored_assets >= 4
    assert summary.active_sources >= 1
    assert "critical" in summary.counts_by_band
    assert summary.is_demo is True


def test_ingestion_idempotence(db_session):
    """Verify re-running ingestion does not generate duplicate advisories or alerts."""
    initial_alerts = list_alerts(band=None, status=None, q=None, limit=50, cursor=None, db=db_session)
    initial_count = initial_alerts["total"]

    # Trigger second ingestion run
    req = IngestionRequest(source_id="demo_fixture", mode="demo")
    run_res = trigger_ingestion(req, db=db_session)

    assert run_res.status == "success"

    post_alerts = list_alerts(band=None, status=None, q=None, limit=50, cursor=None, db=db_session)
    assert post_alerts["total"] == initial_count, "Ingestion run created duplicate records!"
