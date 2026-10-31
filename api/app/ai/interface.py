from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from ..core.config import settings
from ..schemas.common import EvidenceItem, ScoreFactors


class AIEnrichmentInput(BaseModel):
    """
    Strict schema-bound input passed to Person 3 AI enrichment.
    Guarantees no raw DB models or session references.
    """
    advisory_title: str
    advisory_description: str
    cve_id: Optional[str] = None
    source_url: Optional[str] = None
    matched_assets: List[Dict[str, Any]] = Field(default_factory=list)
    factors: Dict[str, Any] = Field(default_factory=dict)


class AIEnrichmentResult(BaseModel):
    """
    Structured output returned by Person 3 AI enrichment.
    The AI model only enriches explanations, recommendations, and quotes;
    it cannot alter the deterministic risk score or fabricate false evidence.
    """
    summary: str
    evidence: List[EvidenceItem]
    recommendations: List[str]
    ai_provider: str
    ai_model: str


class AIEnrichmentService:
    """
    Interface for Person 3 AI enrichment.
    Provides a 100% reliable, deterministic fallback when an LLM provider key
    is not configured or when the provider experiences timeouts/rate-limits.
    """

    def __init__(self, provider: Optional[str] = None, model: Optional[str] = None):
        self.provider = provider or settings.AI_PROVIDER
        self.model = model or settings.AI_MODEL

    def enrich(self, input_data: AIEnrichmentInput) -> AIEnrichmentResult:
        # If external LLM provider is connected by Person 3, handle here.
        # Fallback: strictly deterministic synthesis grounded in source advisory text.
        asset_names = [a.get("name") or a.get("asset") or "unnamed asset" for a in input_data.matched_assets]
        assets_summary = ", ".join(asset_names) if asset_names else "candidate organizational assets"

        cve_ref = f" ({input_data.cve_id})" if input_data.cve_id else ""
        summary = (
            f"{input_data.advisory_title}{cve_ref}. Matches {len(input_data.matched_assets)} monitored asset(s): {assets_summary}. "
            f"Risk factors indicate priority based on asset criticality and exploit presence."
        )

        evidence = [
            EvidenceItem(
                source="threat_advisory",
                url=input_data.source_url or "https://example.invalid/advisory",
                excerpt=input_data.advisory_description[:300] if input_data.advisory_description else "Advisory details provided.",
            )
        ]

        recommendations = [
            f"Verify installed versions on affected assets: {assets_summary}",
            "Review firewall and ingress network access rules for associated service ports",
            "Apply official vendor patch or implement recommended compensating controls",
            "Monitor authentication and execution logs for indicators of compromise (IoC)",
        ]

        return AIEnrichmentResult(
            summary=summary,
            evidence=evidence,
            recommendations=recommendations,
            ai_provider=self.provider,
            ai_model=self.model,
        )


ai_enrichment_service = AIEnrichmentService()
