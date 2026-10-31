from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from .enums import Criticality


class AssetBase(BaseModel):
    name: str
    product: str
    vendor: Optional[str] = None
    version: Optional[str] = None
    criticality: Criticality = Criticality.MEDIUM
    environment: str = "demo"
    owner: Optional[str] = None


class AssetCreate(AssetBase):
    pass


class AssetResponse(AssetBase):
    id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AssetListResponse(BaseModel):
    items: List[AssetResponse]
    total: int


class AssetImportItem(AssetBase):
    pass


class AssetImportRequest(BaseModel):
    assets: List[AssetImportItem]


class AssetImportResult(BaseModel):
    created: int
    updated: int
    rejected: List[dict] = Field(default_factory=list)
