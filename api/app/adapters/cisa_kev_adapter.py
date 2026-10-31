import httpx
import asyncio
from typing import List, Dict, Any, Optional
from .base import BaseAdvisoryAdapter
from ..core.config import settings
from ..core.logging import logger


class CisaKevAdapter(BaseAdvisoryAdapter):
    def __init__(
        self,
        feed_url: Optional[str] = None,
        timeout: Optional[float] = None,
        max_retries: int = 2,
    ):
        self.feed_url = feed_url or settings.CISA_KEV_FEED_URL
        self.timeout = timeout or settings.FEED_REQUEST_TIMEOUT_SECONDS
        self.max_retries = max_retries

    @property
    def name(self) -> str:
        return "CISA Known Exploited Vulnerabilities"

    @property
    def kind(self) -> str:
        return "cisa_kev"

    def fetch_advisories(self) -> List[Dict[str, Any]]:
        headers = {"User-Agent": "SentinelScope-EarlyWarning/1.0"}
        last_error = None

        for attempt in range(1, self.max_retries + 1):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    resp = client.get(self.feed_url, headers=headers)
                    resp.raise_for_status()
                    payload = resp.json()

                    vulnerabilities = payload.get("vulnerabilities", [])
                    logger.info(f"Retrieved {len(vulnerabilities)} vulnerabilities from CISA KEV")

                    normalized: List[Dict[str, Any]] = []
                    # Limit to the most recent 50 entries to keep hackathon demo snappy
                    for item in vulnerabilities[:50]:
                        cve = item.get("cveID", "")
                        vendor = item.get("vendorProject", "")
                        product = item.get("product", "")
                        desc = item.get("shortDescription", "")
                        date_added = item.get("dateAdded", "")

                        normalized.append({
                            "external_id": f"CISA-{cve}",
                            "cve_id": cve,
                            "title": f"Known Exploited: {vendor} {product}",
                            "description": desc,
                            "published_at": f"{date_added}T00:00:00Z" if date_added else "2026-01-01T00:00:00Z",
                            "severity": "HIGH",
                            "cvss": 8.0,
                            "exploited": True,
                            "affected_products": [
                                {
                                    "vendor": vendor,
                                    "product": product,
                                    "version_range": "*",
                                }
                            ],
                            "source_url": f"https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext={cve}",
                        })
                    return normalized

            except (httpx.RequestError, httpx.HTTPStatusError, Exception) as exc:
                last_error = exc
                logger.warning(f"CISA KEV fetch attempt {attempt}/{self.max_retries} failed: {exc}")
                if attempt < self.max_retries:
                    import time
                    time.sleep(1.0)

        logger.error(f"Failed to fetch CISA KEV feed after {self.max_retries} retries: {last_error}")
        raise RuntimeError(f"CISA KEV upstream unavailable: {last_error}")
