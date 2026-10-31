"""AI Provider Interface, Substring Evidence Verification, and Fallback Orchestration."""

from abc import ABC, abstractmethod
import json
import logging
from typing import Optional, List, Dict, Any, Tuple

from api.app.core.config import settings
from api.app.schemas.advisory import Advisory
from api.app.ai.schema import AIEnrichmentResult, EvidenceSpan
from api.app.ai.prompts import SYSTEM_PROMPT, build_extraction_prompt, sanitize_advisory_text
from api.app.ai.fallback import deterministic_fallback_extraction

logger = logging.getLogger(__name__)


def verify_evidence_spans(source_text: str, spans: List[EvidenceSpan]) -> Tuple[List[EvidenceSpan], List[str]]:
    """Strictly verify that every claimed quote in evidence_spans is a literal substring of the source text.
    
    Returns (valid_spans, validation_notes).
    """
    valid_spans: List[EvidenceSpan] = []
    notes: List[str] = []

    # Normalize whitespace for flexible matching
    normalized_source = " ".join(source_text.split())

    for idx, span in enumerate(spans):
        quote = span.exact_quote.strip()
        if not quote:
            notes.append(f"Span #{idx} rejected: empty quote")
            continue

        normalized_quote = " ".join(quote.split())
        
        # Check literal presence in either original or normalized text
        if quote in source_text:
            start_pos = source_text.find(quote)
            span.start_char = start_pos
            span.end_char = start_pos + len(quote)
            valid_spans.append(span)
            notes.append(f"Span [{span.field}] verified verbatim (offset {start_pos}..{span.end_char})")
        elif normalized_quote in normalized_source:
            start_pos = normalized_source.find(normalized_quote)
            span.start_char = start_pos
            span.end_char = start_pos + len(normalized_quote)
            valid_spans.append(span)
            notes.append(f"Span [{span.field}] verified with normalized whitespace")
        else:
            notes.append(f"Span [{span.field}] REJECTED: quote not found in source text (unsupported claim): '{quote[:40]}...'")

    return valid_spans, notes


class BaseAIProvider(ABC):
    """Abstract interface for AI enrichment providers."""
    
    @abstractmethod
    def enrich(self, title: str, description: str, source_url: str = "") -> AIEnrichmentResult:
        """Analyze advisory text and return validated structured extraction."""
        pass


class MockAIProvider(BaseAIProvider):
    """Deterministic mock provider for offline testing, demos, and simulated failures."""
    
    def __init__(self, mode: str = "success"):
        self.mode = mode  # "success", "timeout", "malformed", "hallucinated_quote"

    def enrich(self, title: str, description: str, source_url: str = "") -> AIEnrichmentResult:
        if self.mode == "timeout":
            raise TimeoutError("Simulated LLM provider timeout after 4.0s")
        elif self.mode == "malformed":
            # Simulate invalid JSON response
            raise ValueError("LLM returned non-JSON response: <html>Error 502 Bad Gateway</html>")
        elif self.mode == "hallucinated_quote":
            # Returns an evidence quote that is fabricated and does NOT exist in the source text
            return AIEnrichmentResult(
                summary="Fabricated summary claiming critical zero-day impact.",
                cve_ids=["CVE-2026-99999"],
                affected_products=["FictionalProduct"],
                affected_versions=["1.0.0"],
                exploit_claim="active_exploitation",
                mitigation_claim="Immediately disconnect the entire network.",
                evidence_spans=[
                    EvidenceSpan(
                        field="exploit",
                        exact_quote="This sentence never appeared in the original advisory text anywhere."
                    )
                ],
                is_fallback=False,
                provider="mock",
                model="mock-hallucinator",
                status="success"
            )
        
        # Default success mode: extracts verifiable span from text
        first_sentence = description.split(".")[0] if description else title
        quote_text = first_sentence if first_sentence in description else title
        
        return AIEnrichmentResult(
            summary=f"Analysis of {title}: Advisory describes potential vulnerability requiring administrator review and timely patch application.",
            cve_ids=[],
            affected_products=[],
            affected_versions=[],
            exploit_claim="unknown",
            mitigation_claim="Review vendor advisory for patch availability.",
            evidence_spans=[
                EvidenceSpan(
                    field="general",
                    exact_quote=quote_text
                )
            ] if quote_text else [],
            is_fallback=False,
            provider="mock",
            model="sentinelscope-mock-v1",
            status="success"
        )


class GeminiAIProvider(BaseAIProvider):
    """Gemini API provider with bounded timeouts and structured output."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash", timeout: float = 4.0):
        self.api_key = api_key
        self.model_name = model_name
        self.timeout = timeout

    def enrich(self, title: str, description: str, source_url: str = "") -> AIEnrichmentResult:
        if not self.api_key:
            raise ValueError("Gemini API key is not configured")

        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        prompt = build_extraction_prompt(title, description, source_url)

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(raw_text)

            return AIEnrichmentResult(
                summary=parsed.get("summary", "Summary unavailable"),
                cve_ids=parsed.get("cve_ids", []),
                affected_products=parsed.get("affected_products", []),
                affected_versions=parsed.get("affected_versions", []),
                exploit_claim=parsed.get("exploit_claim", "unknown"),
                mitigation_claim=parsed.get("mitigation_claim", "unknown"),
                evidence_spans=[
                    EvidenceSpan(**s) for s in parsed.get("evidence_spans", [])
                    if isinstance(s, dict) and "field" in s and "exact_quote" in s
                ],
                is_fallback=False,
                provider="gemini",
                model=self.model_name,
                status="success"
            )


class AIEnrichmentService:
    """Manages AI extraction with validation, at-most-one-retry, and guaranteed deterministic fallback."""

    def __init__(self, provider: Optional[BaseAIProvider] = None):
        self.provider = provider or self._get_configured_provider()

    def _get_configured_provider(self) -> BaseAIProvider:
        provider_type = settings.AI_PROVIDER.lower()
        if provider_type == "gemini" and settings.AI_API_KEY:
            return GeminiAIProvider(
                api_key=settings.AI_API_KEY,
                model_name=settings.AI_MODEL,
                timeout=settings.AI_TIMEOUT_SECONDS
            )
        elif provider_type == "mock":
            return MockAIProvider(mode="success")
        else:
            return MockAIProvider(mode="fallback")

    def summarize_and_extract(
        self,
        title: str,
        description: str,
        source_url: str = "",
        severity: Optional[str] = None,
        cvss: Optional[float] = None,
        known_products: Optional[List[str]] = None,
        known_cve: Optional[str] = None
    ) -> AIEnrichmentResult:
        """Execute enrichment pipeline with security sanitization, validation, and offline fallback."""
        raw_combined = f"{title}. {description}"

        # If provider is explicitly set to none or fallback, jump directly to deterministic fallback
        if settings.AI_PROVIDER.lower() in ("none", "fallback", "off"):
            return deterministic_fallback_extraction(
                title=title,
                description=description,
                severity=severity,
                cvss=cvss,
                known_products=known_products,
                known_cve=known_cve
            )

        attempts = 0
        max_retries = max(1, settings.AI_MAX_RETRIES)
        last_error = None

        while attempts <= max_retries:
            attempts += 1
            try:
                result = self.provider.enrich(title, description, source_url)

                # Substring validation of evidence spans against original untrusted source text
                valid_spans, notes = verify_evidence_spans(raw_combined, result.evidence_spans)
                result.evidence_spans = valid_spans
                result.validation_notes = notes

                # If all claimed evidence spans were rejected as hallucinations, fall back
                if not valid_spans and result.provider != "deterministic-rules":
                    logger.warning("All AI evidence spans failed substring validation. Falling back.")
                    fallback_res = deterministic_fallback_extraction(
                        title=title,
                        description=description,
                        severity=severity,
                        cvss=cvss,
                        known_products=known_products,
                        known_cve=known_cve
                    )
                    fallback_res.validation_notes.append("Triggered fallback: LLM claims failed verbatim source quote verification")
                    return fallback_res

                return result

            except Exception as e:
                last_error = e
                logger.warning(f"AI enrichment attempt {attempts} failed: {e}")
                if attempts > max_retries:
                    break

        # Fallback to deterministic rule-based extractor
        fallback = deterministic_fallback_extraction(
            title=title,
            description=description,
            severity=severity,
            cvss=cvss,
            known_products=known_products,
            known_cve=known_cve
        )
        fallback.validation_notes.append(f"Fell back to deterministic rules after provider error: {last_error}")
        return fallback
