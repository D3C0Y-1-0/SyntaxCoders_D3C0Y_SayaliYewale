from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...db.models import IngestionRun, Source
from ...schemas.ingestion import IngestionTriggerRequest, IngestionRunResponse
from ...adapters.fixture_adapter import FixtureAdvisoryAdapter
from ...adapters.cisa_kev_adapter import CisaKevAdapter
from ...services.ingestion_service import IngestionService
from ...core.errors import NotFoundError, ValidationError

router = APIRouter(prefix="/ingestions", tags=["ingestion"])


@router.post("", response_model=IngestionRunResponse)
def trigger_ingestion(
    payload: IngestionTriggerRequest,
    db: Session = Depends(get_db),
):
    if payload.mode == "public":
        adapter = CisaKevAdapter()
    elif payload.mode == "fixture":
        adapter = FixtureAdvisoryAdapter()
    else:
        raise ValidationError(f"Unknown ingestion mode '{payload.mode}'. Allowed modes: 'fixture', 'public'")

    run = IngestionService.run_ingestion(db, adapter)
    return IngestionRunResponse(
        run_id=run.id,
        source_id=run.source_id,
        status=run.status,
        records_seen=run.records_seen,
        records_changed=run.records_changed,
        error_summary=run.error_summary,
        started_at=run.started_at,
        finished_at=run.finished_at,
    )


@router.get("/{run_id}", response_model=IngestionRunResponse)
def get_ingestion_run(
    run_id: int,
    db: Session = Depends(get_db),
):
    run = db.query(IngestionRun).filter(IngestionRun.id == run_id).first()
    if not run:
        raise NotFoundError(f"Ingestion run with id {run_id} not found")

    return IngestionRunResponse(
        run_id=run.id,
        source_id=run.source_id,
        status=run.status,
        records_seen=run.records_seen,
        records_changed=run.records_changed,
        error_summary=run.error_summary,
        started_at=run.started_at,
        finished_at=run.finished_at,
    )
