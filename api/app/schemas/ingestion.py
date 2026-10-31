from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from .enums import IngestionStatus


class IngestionTriggerRequest(BaseModel):
    source_id: Optional[int] = None
    mode: str = "fixture"  # "fixture" or "public"


class IngestionRunResponse(BaseModel):
    run_id: int
    source_id: Optional[int] = None
    status: IngestionStatus
    records_seen: int = 0
    records_changed: int = 0
    error_summary: Optional[str] = None
    started_at: datetime
    finished_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
