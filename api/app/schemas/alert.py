from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from .enums import RiskBand, AlertStatus, Severity
from .common import EvidenceItem, ScoreFactors
from .match import AffectedAssetDetail


class AlertListItem(BaseModel):
    id: str
    cve_id: Optional[str] = None
    title: str
    severity: Severity = Severity.UNKNOWN
    score: int = Field(..., ge=0, le=100)
    band: RiskBand
    status: AlertStatus
    published_at: Optional[datetime] = None
    generated_at: datetime
    exploited: bool = False
    source_url: Optional[str] = None
    asset_count: int = 0
    affected_assets: List[AffectedAssetDetail] = Field(default_factory=list)
    factors: ScoreFactors
    recommendations: List[str] = Field(default_factory=list)
    summary: str = ""
    model_config = ConfigDict(from_attributes=True)


class AlertListResponse(BaseModel):
    items: List[AlertListItem]
    total: int
    next_cursor: Optional[str] = None


class AlertDetailResponse(BaseModel):
    id: str
    advisory_id: int
    score: int = Field(..., ge=0, le=100)
    band: RiskBand
    status: AlertStatus
    title: str
    summary: str
    affected_assets: List[AffectedAssetDetail] = Field(default_factory=list)
    factors: ScoreFactors
    evidence: List[EvidenceItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    ai_provider: Optional[str] = None
    ai_model: Optional[str] = None
    generated_at: datetime
    acknowledged_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class AlertStatusUpdateRequest(BaseModel):
    status: AlertStatus
    note: Optional[str] = None


class AlertStatusUpdateResponse(BaseModel):
    id: str
    status: AlertStatus
    updated_at: datetime
