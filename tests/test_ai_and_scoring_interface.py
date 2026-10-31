from datetime import datetime, timedelta
from api.app.services.scoring import (
    BaseScoringEngine,
    RiskScoringInput,
    RiskScoringOutput,
    set_scoring_engine,
    get_scoring_engine,
    calculate_risk_score,
    DefaultPerson3ScoringEngine,
)
from api.app.schemas.enums import RiskBand
from api.app.schemas.common import ScoreFactors
from api.app.ai.interface import ai_enrichment_service, AIEnrichmentInput


class MockPerson3CustomScoringEngine(BaseScoringEngine):
    """Demonstrates that Person 3 can supply or modify scoring logic without touching backend."""
    def calculate_score(self, input_data: RiskScoringInput) -> RiskScoringOutput:
        # Custom formula owned by Person 3
        return RiskScoringOutput(
            score=77,
            band=RiskBand.HIGH,
            factors=ScoreFactors(
                severity=20,
                exploit=25,
                asset_criticality=15,
                confidence=10,
                freshness=7,
            ),
            formula_version="person-3-calibrated-v2",
        )


def test_person3_scoring_ownership_and_injection():
    # Save default engine
    default_engine = get_scoring_engine()

    try:
        # Person 3 injects their calibrated scoring engine
        set_scoring_engine(MockPerson3CustomScoringEngine())

        res = calculate_risk_score(
            severity="HIGH",
            cvss=8.0,
            exploited=True,
            matched_asset_criticalities=["high"],
            matched_confidences=[0.9],
            published_at=datetime.utcnow(),
        )

        assert res["score"] == 77
        assert res["band"] == RiskBand.HIGH
        assert res["formula_version"] == "person-3-calibrated-v2"
        assert res["factors"].severity == 20
        assert res["factors"].exploit == 25
    finally:
        # Restore default engine
        set_scoring_engine(default_engine)


def test_ai_enrichment_uses_structured_data_and_preserves_determinism():
    input_data = AIEnrichmentInput(
        advisory_title="Test Vulnerability in DemoServer",
        advisory_description="Detailed advisory text describing memory buffer overflow on port 443.",
        cve_id="CVE-2026-9999",
        source_url="https://example.invalid/cve-2026-9999",
        matched_assets=[
            {"name": "demo-host-01", "product": "DemoServer", "version": "1.0.0", "criticality": "high"}
        ],
        factors={"severity": 20, "exploit": 30},
    )

    result = ai_enrichment_service.enrich(input_data)

    # Verify structured output
    assert "Test Vulnerability in DemoServer" in result.summary
    assert "demo-host-01" in result.summary
    assert len(result.evidence) >= 1
    assert result.evidence[0].url == "https://example.invalid/cve-2026-9999"
    assert "Detailed advisory text" in result.evidence[0].excerpt
    assert len(result.recommendations) >= 1
    assert result.ai_provider == "deterministic_fallback"
    assert result.ai_model == "mock-v1"

