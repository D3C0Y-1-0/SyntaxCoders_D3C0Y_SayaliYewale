from typing import List, Dict, Any
from api.app.adapters.base import BaseAdvisoryAdapter
from api.app.adapters.fixture_adapter import FixtureAdvisoryAdapter
from api.app.services.ingestion_service import IngestionService
from api.app.db.models import Advisory, Alert, IngestionRun


class FailingAdapter(BaseAdvisoryAdapter):
    @property
    def name(self) -> str:
        return "Simulated Broken Adapter"

    @property
    def kind(self) -> str:
        return "broken_mock"

    def fetch_advisories(self) -> List[Dict[str, Any]]:
        raise ConnectionError("Simulated feed network timeout 503")


def test_fixture_ingestion_and_idempotency(db_session):
    adapter = FixtureAdvisoryAdapter()
    
    # First ingestion
    run1 = IngestionService.run_ingestion(db_session, adapter)
    assert run1.status == "success"
    assert run1.records_seen == 2

    advisories_count = db_session.query(Advisory).count()
    assert advisories_count >= 2

    alerts_count = db_session.query(Alert).count()
    assert alerts_count >= 1

    # Second run: Idempotency check
    run2 = IngestionService.run_ingestion(db_session, adapter)
    assert run2.status == "success"
    assert run2.records_seen == 2
    assert run2.records_changed == 0
    # Advisory and alert counts remain identical
    assert db_session.query(Advisory).count() == advisories_count
    assert db_session.query(Alert).count() == alerts_count


def test_ingestion_failure_resilience(db_session):
    initial_alerts_count = db_session.query(Alert).count()
    
    broken_adapter = FailingAdapter()
    run = IngestionService.run_ingestion(db_session, broken_adapter)

    # Ingestion run records the failure cleanly
    assert run.status == "failed"
    assert "Simulated feed network timeout 503" in run.error_summary

    # Prior records are completely intact
    assert db_session.query(Alert).count() == initial_alerts_count

