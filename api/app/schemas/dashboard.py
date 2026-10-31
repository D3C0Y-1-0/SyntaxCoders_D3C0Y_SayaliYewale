from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel
from .alert import AlertListItem


class DashboardCounts(BaseModel):
    by_band: Dict[str, int]
    by_status: Dict[str, int]
    total_alerts: int
    total_assets: int
    matched_assets_count: int


class SourceFreshness(BaseModel):
    source_name: str
    last_fetched_at: Optional[datetime] = None
    status: str


class DashboardSummaryResponse(BaseModel):
    counts: DashboardCounts
    recent_alerts: List[AlertListItem]
    sources: List[SourceFreshness]
    updated_at: datetime

