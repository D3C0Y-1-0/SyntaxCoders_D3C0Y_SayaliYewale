from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from .enums import MatchStatus


class AssetMatchBase(BaseModel):
    advisory_id: int
    asset_id: int
    match_status: MatchStatus
    match_reason: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class AssetMatchResponse(AssetMatchBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class AffectedAssetDetail(BaseModel):
    asset_id: int
    asset: str
    product: Optional[str] = None
    version: Optional[str] = None
    criticality: str
    match: str
    confidence: float
    match_reason: str
