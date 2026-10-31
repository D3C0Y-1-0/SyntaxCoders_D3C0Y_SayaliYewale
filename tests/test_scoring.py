from datetime import datetime, timedelta
from api.app.services.scoring import calculate_risk_score, calculate_risk_band
from api.app.schemas.enums import RiskBand


def test_score_critical_band():
    # Critical advisory + exploited + high criticality asset + 0.95 confidence + fresh
    result = calculate_risk_score(
        severity="CRITICAL",
        cvss=9.8,
        exploited=True,
        matched_asset_criticalities=["high"],
        matched_confidences=[0.95],
        published_at=datetime.utcnow() - timedelta(days=2),
    )
    score = result["score"]
    band = result["band"]
    factors = result["factors"]

    # 25 (sev) + 30 (exploit) + 15 (high crit) + 14 (conf) + 10 (fresh) = 94
    assert score >= 80
    assert band == RiskBand.CRITICAL
    assert factors.severity == 25
    assert factors.exploit == 30
    assert factors.asset_criticality == 15
    assert factors.freshness == 10


def test_score_missing_evidence_not_safe():
    # Missing severity, no exploit, unknown asset criticality
    result = calculate_risk_score(
        severity="UNKNOWN",
        cvss=None,
        exploited=False,
        matched_asset_criticalities=[],
        matched_confidences=[],
        published_at=None,
    )
    assert result["score"] == 0
    assert result["band"] == RiskBand.LOW
    assert result["factors"].severity == 0
    assert result["factors"].exploit == 0
    assert result["factors"].asset_criticality == 0


def test_risk_band_boundaries():
    assert calculate_risk_band(100) == RiskBand.CRITICAL
    assert calculate_risk_band(80) == RiskBand.CRITICAL
    assert calculate_risk_band(79) == RiskBand.HIGH
    assert calculate_risk_band(60) == RiskBand.HIGH
    assert calculate_risk_band(59) == RiskBand.MEDIUM
    assert calculate_risk_band(35) == RiskBand.MEDIUM
    assert calculate_risk_band(34) == RiskBand.LOW
    assert calculate_risk_band(0) == RiskBand.LOW

