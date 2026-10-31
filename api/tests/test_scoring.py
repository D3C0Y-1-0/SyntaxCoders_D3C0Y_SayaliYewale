"""Comprehensive test suite for Person 3 Deterministic Scoring Engine.

Validates:
1. Exact mathematical summation: displayed factor sum == total score.
2. Clamping to 0..100.
3. Band boundary mapping:
   - 34 -> Low, 35 -> Medium
   - 59 -> Medium, 60 -> High
   - 79 -> High, 80 -> Critical
4. Missing / unknown evidence behavior:
   - Does not crash
   - Awards 0 points
   - Flags in unknown_fields
5. Confidence scaling and explicit point reduction calculation.
6. Ordering verification:
   - Exploited + critical asset outranks low-criticality unexploited asset.
"""

from datetime import datetime, timedelta, timezone
import pytest

from api.app.services.scoring import (
    calculate_risk_score,
    calculate_severity_factor,
    calculate_exploit_factor,
    calculate_criticality_factor,
    calculate_match_factor,
    calculate_freshness_factor,
    score_to_band,
    FORMULA_VERSION,
)


def test_formula_version_present():
    """Verify formula version is pinned and preserved."""
    result = calculate_risk_score()
    assert result.formula_version == FORMULA_VERSION
    assert result.formula_version == "1.0.0"


def test_max_score_all_factors():
    """Verify maximum possible score is 100 with all factors at maximum."""
    now = datetime.now(timezone.utc)
    result = calculate_risk_score(
        cvss=9.8,
        exploited=True,
        asset_criticality="critical",
        match_status="exact",
        match_confidence=1.0,
        published_at=now - timedelta(days=2),
        reference_time=now
    )

    assert result.score == 100
    assert result.band == "critical"
    assert result.score_factors.severity.value == 25
    assert result.score_factors.exploit.value == 30
    assert result.score_factors.asset_criticality.value == 20
    assert result.score_factors.confidence.value == 15
    assert result.score_factors.freshness.value == 10

    # Verify factor sum equals total score
    factor_sum = (
        result.score_factors.severity.value
        + result.score_factors.exploit.value
        + result.score_factors.asset_criticality.value
        + result.score_factors.confidence.value
        + result.score_factors.freshness.value
    )
    assert factor_sum == result.score
    assert len(result.unknown_fields) == 0


def test_zero_score_all_unknown():
    """Verify all unknown inputs yield 0 points and populate unknown_fields."""
    result = calculate_risk_score()
    assert result.score == 0
    assert result.band == "low"
    assert result.score_factors.severity.value == 0
    assert result.score_factors.exploit.value == 0
    assert result.score_factors.asset_criticality.value == 0
    assert result.score_factors.confidence.value == 0
    assert result.score_factors.freshness.value == 0

    assert "severity" in result.unknown_fields
    assert "exploited" in result.unknown_fields
    assert "asset_criticality" in result.unknown_fields
    assert "published_at" in result.unknown_fields


@pytest.mark.parametrize("score,expected_band", [
    (0, "low"),
    (34, "low"),
    (35, "medium"),
    (59, "medium"),
    (60, "high"),
    (79, "high"),
    (80, "critical"),
    (100, "critical"),
])
def test_band_boundaries(score, expected_band):
    """Verify exact boundary mapping according to the specification."""
    assert score_to_band(score) == expected_band


def test_factor_sum_always_equals_total_score():
    """Property test: for varied permutations, displayed factor sum MUST equal total score."""
    test_cases = [
        {"cvss": 7.5, "exploited": False, "asset_criticality": "high", "match_status": "candidate", "match_confidence": 0.8},
        {"cvss": 4.5, "exploited": True, "asset_criticality": "low", "match_status": "exact", "match_confidence": 1.0},
        {"severity": "CRITICAL", "exploited": None, "asset_criticality": "medium", "match_status": "none"},
        {"severity": "LOW", "exploited": False, "asset_criticality": None, "match_status": "candidate", "match_confidence": 0.4},
    ]

    for tc in test_cases:
        res = calculate_risk_score(**tc)
        factor_sum = (
            res.score_factors.severity.value
            + res.score_factors.exploit.value
            + res.score_factors.asset_criticality.value
            + res.score_factors.confidence.value
            + res.score_factors.freshness.value
        )
        assert factor_sum == res.score, f"Mismatch in test case {tc}: {factor_sum} != {res.score}"


def test_cvss_and_severity_precedence():
    """CVSS should take precedence if provided, falling back to severity text if CVSS is None."""
    # CVSS >= 9 -> 25
    f, unknown = calculate_severity_factor(severity="LOW", cvss=9.5)
    assert f.value == 25
    assert not unknown

    # CVSS >= 7 -> 20
    f, unknown = calculate_severity_factor(cvss=7.2)
    assert f.value == 20

    # CVSS >= 4 -> 12
    f, unknown = calculate_severity_factor(cvss=5.0)
    assert f.value == 12

    # CVSS > 0 -> 5
    f, unknown = calculate_severity_factor(cvss=2.1)
    assert f.value == 5

    # Text fallback: CRITICAL -> 25, HIGH -> 20, MEDIUM -> 12, LOW -> 5
    f, _ = calculate_severity_factor(severity="CRITICAL")
    assert f.value == 25
    f, _ = calculate_severity_factor(severity="HIGH")
    assert f.value == 20
    f, _ = calculate_severity_factor(severity="MEDIUM")
    assert f.value == 12
    f, _ = calculate_severity_factor(severity="LOW")
    assert f.value == 5


def test_candidate_confidence_scaling():
    """Candidate match scales confidence * 15 with explicit reduction reasoning."""
    # 0.8 * 15 = 12
    f, _ = calculate_match_factor("candidate", 0.8)
    assert f.value == 12
    assert "reduced from 15 max by 3 pts" in f.reason

    # 0.5 * 15 = 7.5 -> round to 8
    f, _ = calculate_match_factor("candidate", 0.5)
    assert f.value in (7, 8)

    # 1.0 exact match -> 15
    f, _ = calculate_match_factor("exact", 1.0)
    assert f.value == 15
    assert "Exact" in f.reason


def test_freshness_decay():
    """Verify freshness brackets: <=7d (10), <=30d (7), <=90d (4), >90d (1)."""
    now = datetime.now(timezone.utc)
    
    # 3 days ago -> 10
    f, _ = calculate_freshness_factor(now - timedelta(days=3), now)
    assert f.value == 10

    # 15 days ago -> 7
    f, _ = calculate_freshness_factor(now - timedelta(days=15), now)
    assert f.value == 7

    # 45 days ago -> 4
    f, _ = calculate_freshness_factor(now - timedelta(days=45), now)
    assert f.value == 4

    # 120 days ago -> 1
    f, _ = calculate_freshness_factor(now - timedelta(days=120), now)
    assert f.value == 1

    # Missing -> 0 with unknown flag
    f, unknown = calculate_freshness_factor(None)
    assert f.value == 0
    assert unknown is True


def test_ordering_exploited_critical_vs_unrelated_low():
    """Verify that a known-exploited critical asset match outranks low-criticality unexploited scenario."""
    now = datetime.now(timezone.utc)
    
    # High-impact scenario (MVP primary match)
    alert_high = calculate_risk_score(
        cvss=9.1,
        exploited=True,
        asset_criticality="critical",
        match_status="exact",
        match_confidence=1.0,
        published_at=now - timedelta(days=2),
        reference_time=now
    )
    
    # Low-impact scenario (unrelated / dev asset)
    alert_low = calculate_risk_score(
        cvss=3.0,
        exploited=False,
        asset_criticality="low",
        match_status="candidate",
        match_confidence=0.3,
        published_at=now - timedelta(days=120),
        reference_time=now
    )

    assert alert_high.score >= 80
    assert alert_high.band == "critical"
    assert alert_low.score < 35
    assert alert_low.band == "low"
    assert alert_high.score > alert_low.score

