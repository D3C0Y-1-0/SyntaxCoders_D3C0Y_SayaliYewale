"""Deterministic rule-based fallback extraction and templated summaries.

Used when:
- AI provider is not configured or disabled
- API key is missing
- Model call times out
- Model response is malformed JSON or fails evidence-span substring validation

Guarantees 100% offline uptime and auditability without relying on external LLM services.
"""

import re
from typing import List, Optional, Tuple
from api.app.ai.schema import AIEnrichmentResult, EvidenceSpan


CVE_REGEX = re.compile(r"\bCVE-\d{4}-\d{4,7}\b", re.IGNORECASE)

EXPLOIT_KEYWORDS = [
    "actively exploited",
    "exploited in the wild",
    "in-the-wild exploitation",
    "known exploited",
    "proof of concept",
    "zero-day",
    "0-day",
    "weaponized",
    "exploit code",
    "ransomware",
]

MITIGATION_KEYWORDS = [
    "upgrade to",
    "update to",
    "fixed in",
    "patch available",
    "vendor patch",
    "workaround",
    "mitigation",
    "recommended action",
    "apply the update",
]


def extract_matching_sentence(text: str, keywords: List[str]) -> Tuple[Optional[str], Optional[str]]:
    """Find the first sentence containing any keyword, returning (keyword, exact_sentence)."""
    # Split text into rough sentences
    sentences = re.split(r"(?<=[.!?])\s+", text)
    for sent in sentences:
        clean_sent = sent.strip()
        for kw in keywords:
            if re.search(rf"\b{re.escape(kw)}\b", clean_sent, re.IGNORECASE):
                # Ensure the returned sentence is a verbatim substring of text
                if clean_sent in text:
                    return kw, clean_sent
    return None, None


def deterministic_fallback_extraction(
    title: str,
    description: str,
    severity: Optional[str] = None,
    cvss: Optional[float] = None,
    known_products: Optional[List[str]] = None,
    known_cve: Optional[str] = None
) -> AIEnrichmentResult:
    """Generate deterministic extraction and templated summary with verifiable evidence quotes."""
    combined_text = f"{title}. {description}"

    # 1. Extract CVEs
    extracted_cves = list(set(CVE_REGEX.findall(combined_text)))
    if known_cve and known_cve not in extracted_cves:
        extracted_cves.insert(0, known_cve)

    # 2. Extract Evidence Spans
    evidence_spans: List[EvidenceSpan] = []

    # Exploit analysis
    kw_exploit, sent_exploit = extract_matching_sentence(combined_text, EXPLOIT_KEYWORDS)
    if sent_exploit:
        exploit_claim = "active_exploitation" if ("actively" in kw_exploit or "wild" in kw_exploit or "zero-day" in kw_exploit) else "poc_available"
        evidence_spans.append(EvidenceSpan(field="exploit", exact_quote=sent_exploit))
    else:
        exploit_claim = "none_reported"

    # Mitigation analysis
    kw_mit, sent_mit = extract_matching_sentence(combined_text, MITIGATION_KEYWORDS)
    if sent_mit:
        mitigation_claim = sent_mit
        evidence_spans.append(EvidenceSpan(field="mitigation", exact_quote=sent_mit))
    else:
        mitigation_claim = "No official mitigation text extracted from advisory; verify vendor release notes."

    # Products
    products = list(known_products or [])
    if not products:
        # Simple heuristic product extraction
        prod_matches = re.findall(r"(?:Apache|OpenSSL|Linux|Windows|Nginx|Kubernetes|Cisco|Fortinet|GitLab|PostgreSQL)\s*[\w.-]*", combined_text, re.IGNORECASE)
        products = list(dict.fromkeys(prod_matches))

    # 3. Formulate Deterministic Templated Summary
    primary_cve = extracted_cves[0] if extracted_cves else "Unassigned CVE"
    sev_str = severity or (f"CVSS {cvss:.1f}" if cvss else "unspecified severity")
    prod_str = ", ".join(products) if products else "specified software components"

    summary_parts = [
        f"Automated analysis of {primary_cve}: advisory indicates vulnerability in {prod_str} with {sev_str}.",
    ]

    if exploit_claim == "active_exploitation":
        summary_parts.append("Evidence indicates active exploitation in the wild; immediate patching prioritized.")
    elif exploit_claim == "poc_available":
        summary_parts.append("Proof-of-concept or exploit discussion identified; patch or isolate affected systems.")
    else:
        summary_parts.append("No active in-the-wild exploitation statements identified in source text.")

    if sent_mit:
        summary_parts.append(f"Remediation guidance: {sent_mit}")
    else:
        summary_parts.append("Remediation: Review vendor advisory and apply security patch upon validation.")

    full_summary = " ".join(summary_parts)

    return AIEnrichmentResult(
        summary=full_summary,
        cve_ids=extracted_cves,
        affected_products=products,
        affected_versions=[],
        exploit_claim=exploit_claim,
        mitigation_claim=mitigation_claim,
        evidence_spans=evidence_spans,
        is_fallback=True,
        provider="deterministic-rules",
        model="regex-keyword-v1",
        status="fallback",
        validation_notes=["Generated via rule-based deterministic extractor (offline-safe)"]
    )

