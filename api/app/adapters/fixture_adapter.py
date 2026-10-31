import json
import os
from typing import List, Dict, Any
from .base import BaseAdvisoryAdapter
from ..core.logging import logger


class FixtureAdvisoryAdapter(BaseAdvisoryAdapter):
    def __init__(self, fixture_path: str = "data/demo/fixture_advisories.json"):
        self.fixture_path = fixture_path

    @property
    def name(self) -> str:
        return "Demo Fixture Source"

    @property
    def kind(self) -> str:
        return "fixture"

    def fetch_advisories(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.fixture_path):
            with open(self.fixture_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                logger.info(f"Loaded {len(data)} advisories from {self.fixture_path}")
                return data

        # Fallback inline demo records if file not found
        logger.warning(f"Fixture file not found at {self.fixture_path}, returning built-in demo records")
        return [
            {
                "external_id": "DEMO-ADV-2026-001",
                "cve_id": "CVE-2026-4011",
                "title": "[DEMO FIXTURE] Remote Code Execution in ExampleServer HTTP Core",
                "description": "DEMO DATA: A critical remote code execution vulnerability was identified in ExampleServer HTTP Core versions 4.0 through 4.3.",
                "published_at": "2026-10-28T09:15:00Z",
                "severity": "CRITICAL",
                "cvss": 9.8,
                "exploited": True,
                "affected_products": [
                    {
                        "vendor": "ExampleCorp",
                        "product": "ExampleServer",
                        "version_range": ">=4.0.0, <=4.3.0",
                    }
                ],
                "source_url": "https://example.invalid/advisories/DEMO-ADV-2026-001",
            }
        ]
