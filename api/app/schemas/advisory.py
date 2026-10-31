from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from .enums import Severity


class AffectedProduct(BaseModel):
    vendor: Optional[str] = None
    product: str
    version_range: Optional[str] = None


class AdvisoryBase(BaseModel):
    external_id: str
    cve_id: Optional[str] = None
    title: str
    description: str
    published_at: datetime
    severity: Severity = Severity.UNKNOWN
    cvss: Optional[float] = None
    exploited: bool = False
    affected_products: List[Dict[str, Any]] = Field(default_factory=list)
    source_url: Optional[str] = None


class AdvisoryCreate(AdvisoryBase):
    source_id: int
    raw_hash: Optional[str] = None


class AdvisoryResponse(AdvisoryBase):
    id: int
    source_id: int
    fetched_at: datetime
    model_config = ConfigDict(from_attributes=True)


Advisory = AdvisoryResponse
