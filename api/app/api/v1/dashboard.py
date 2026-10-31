from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...schemas.dashboard import DashboardSummaryResponse
from ...services.alert_service import AlertService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return AlertService.get_dashboard_summary(db)

