from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...schemas.alert import (
    AlertListResponse,
    AlertDetailResponse,
    AlertStatusUpdateRequest,
    AlertStatusUpdateResponse,
)
from ...services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=AlertListResponse)
def list_alerts(
    band: Optional[str] = Query(None, description="Filter by risk band (critical, high, medium, low)"),
    status: Optional[str] = Query(None, description="Filter by alert status"),
    q: Optional[str] = Query(None, description="Search term for title, CVE, or description"),
    limit: int = Query(50, ge=1, le=100, description="Page limit"),
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    db: Session = Depends(get_db),
):
    result = AlertService.list_alerts(db, band=band, status=status, q=q, limit=limit, cursor=cursor)
    return result


@router.get("/{id}", response_model=AlertDetailResponse)
def get_alert_detail(
    id: str,
    db: Session = Depends(get_db),
):
    return AlertService.get_alert_detail(db, alert_id=id)


@router.patch("/{id}/status", response_model=AlertStatusUpdateResponse)
def update_alert_status(
    id: str,
    payload: AlertStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    updated = AlertService.update_alert_status(
        db,
        alert_id=id,
        new_status=payload.status,
        note=payload.note,
        actor="analyst",
    )
    return AlertStatusUpdateResponse(
        id=updated.id,
        status=payload.status,
        updated_at=updated.updated_at,
    )

