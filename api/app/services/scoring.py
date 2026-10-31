from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from ..schemas.enums import RiskBand, Severity, Criticality
from ..schemas.common import ScoreFactors


class RiskScoringInput(BaseModel):
    """
    Structured input provided to Person 3's risk scoring engine.
    No raw DB models or session references.
    """
    severity: Optional[str] = None
    cvss: Optional[float] = None
    exploited: bool = False
    matched_asset_criticalities: List[str] = Field(default_factory=list)
    matched_confidences: List[float] = Field(default_factory=list)
    published_at: Optional[datetime] = None


class RiskScoringOutput(BaseModel):
    """
    Structured output returned by Person 3's risk scoring engine.
    Guarantees factor breakdown for transparent UI explainability.
    """
    score: int = Field(..., ge=0, le=100)
    band: RiskBand
    factors: ScoreFactors
    formula_version: str = "v1-weighted-transparent"


class BaseScoringEngine(ABC):
    """
    Interface owned by Person 3.
    Person 3 can supply, override, or calibrate this class without touching ingestion or database code.
    """
    @abstractmethod
    def calculate_score(self, input_data: RiskScoringInput) -> RiskScoringOutput:
        pass


class DefaultPerson3ScoringEngine(BaseScoringEngine):
    """
    Canonical reference implementation of Person 3's risk scoring formula:
    score = clamp(0..100, severity(0-25) + exploit(0-30) + asset_criticality(0-20) + confidence(0-15) + freshness(0-10))
    """

    def calculate_severity_points(self, severity: Optional[str], cvss: Optional[float] = None) -> int:
        if cvss is not None and cvss > 0:
            return min(25, max(0, round((cvss / 10.0) * 25)))

        sev = (severity or "").upper()
        if "CRIT" in sev:
            return 25
        if "HIGH" in sev:
            return 18
        if "MED" in sev:
            return 10
        if "LOW" in sev:
            return 3
        return 0

    def calculate_criticality_points(self, criticality: Optional[str]) -> int:
        crit = (criticality or "").lower()
        if crit == "critical":
            return 20
        if crit == "high":
            return 15
        if crit == "medium":
            return 10
        if crit == "low":
            return 5
        return 0

    def calculate_freshness_points(self, published_at: Optional[datetime]) -> int:
        if not published_at:
            return 0
        now = datetime.utcnow()
        diff = now - published_at
        days = diff.total_seconds() / 86400.0

        if days < 7:
            return 10
        elif days < 30:
            return 7
        elif days < 90:
            return 4
        elif days < 365:
            return 2
        return 1

    def determine_band(self, score: int) -> RiskBand:
        if score >= 80:
            return RiskBand.CRITICAL
        elif score >= 60:
            return RiskBand.HIGH
        elif score >= 35:
            return RiskBand.MEDIUM
        return RiskBand.LOW

    def calculate_score(self, input_data: RiskScoringInput) -> RiskScoringOutput:
        sev_pts = self.calculate_severity_points(input_data.severity, input_data.cvss)
        exploit_pts = 30 if input_data.exploited else 0

        max_crit_pts = 0
        for c in input_data.matched_asset_criticalities:
            pts = self.calculate_criticality_points(c)
            if pts > max_crit_pts:
                max_crit_pts = pts

        max_conf = max(input_data.matched_confidences) if input_data.matched_confidences else 0.0
        conf_pts = min(15, max(0, round(max_conf * 15)))

        freshness_pts = self.calculate_freshness_points(input_data.published_at)

        total = sev_pts + exploit_pts + max_crit_pts + conf_pts + freshness_pts
        final_score = min(100, max(0, total))
        band = self.determine_band(final_score)

        return RiskScoringOutput(
            score=final_score,
            band=band,
            factors=ScoreFactors(
                severity=sev_pts,
                exploit=exploit_pts,
                asset_criticality=max_crit_pts,
                confidence=conf_pts,
                freshness=freshness_pts,
            ),
            formula_version="v1-weighted-transparent",
        )


# Global scoring engine instance (Person 3 interface)
_scoring_engine_instance: BaseScoringEngine = DefaultPerson3ScoringEngine()


def set_scoring_engine(engine: BaseScoringEngine):
    """Allows Person 3 to inject their custom calibrated scoring engine."""
    global _scoring_engine_instance
    _scoring_engine_instance = engine


def get_scoring_engine() -> BaseScoringEngine:
    return _scoring_engine_instance


# Helper function wrapping the scoring engine
def calculate_risk_score(
    severity: Optional[str],
    cvss: Optional[float],
    exploited: bool,
    matched_asset_criticalities: List[str],
    matched_confidences: List[float],
    published_at: Optional[datetime],
) -> Dict[str, Any]:
    engine = get_scoring_engine()
    input_data = RiskScoringInput(
        severity=severity,
        cvss=cvss,
        exploited=exploited,
        matched_asset_criticalities=matched_asset_criticalities,
        matched_confidences=matched_confidences,
        published_at=published_at,
    )
    res = engine.calculate_score(input_data)
    return {
        "score": res.score,
        "band": res.band,
        "factors": res.factors,
        "formula_version": res.formula_version,
    }


def calculate_risk_band(score: int) -> RiskBand:
    if score >= 80:
        return RiskBand.CRITICAL
    elif score >= 60:
        return RiskBand.HIGH
    elif score >= 35:
        return RiskBand.MEDIUM
    return RiskBand.LOW
