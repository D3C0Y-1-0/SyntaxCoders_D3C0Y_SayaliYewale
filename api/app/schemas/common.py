from typing import Optional, List, Any
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: str


class ErrorEnvelope(BaseModel):
    error: ErrorDetail


class EvidenceItem(BaseModel):
    source: str
    url: Optional[str] = None
    excerpt: str


class ScoreFactors(BaseModel):
    severity: int = Field(0, description="Severity factor (0-25)")
    exploit: int = Field(0, description="Known exploited factor (0-30)")
    asset_criticality: int = Field(0, description="Asset criticality factor (0-20)")
    confidence: int = Field(0, description="Match confidence factor (0-15)")
    freshness: int = Field(0, description="Freshness factor (0-10)")

