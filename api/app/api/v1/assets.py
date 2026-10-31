from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...db.models import Asset
from ...schemas.asset import (
    AssetListResponse,
    AssetResponse,
    AssetImportRequest,
    AssetImportResult,
)
from ...schemas.enums import Criticality

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=AssetListResponse)
def list_assets(
    q: Optional[str] = Query(None, description="Search by name, product, or vendor"),
    criticality: Optional[str] = Query(None, description="Filter by criticality"),
    db: Session = Depends(get_db),
):
    query = db.query(Asset)
    if criticality:
        query = query.filter(Asset.criticality == criticality.lower())
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            (Asset.name.ilike(term))
            | (Asset.product.ilike(term))
            | (Asset.vendor.ilike(term))
        )
    total = query.count()
    items = query.order_by(Asset.name.asc()).all()
    return AssetListResponse(
        items=[AssetResponse.model_validate(item) for item in items],
        total=total,
    )


@router.post("/import", response_model=AssetImportResult)
def import_assets(
    payload: AssetImportRequest,
    db: Session = Depends(get_db),
):
    created = 0
    updated = 0
    rejected = []

    for item in payload.assets:
        try:
            existing = db.query(Asset).filter(Asset.name == item.name).first()
            if existing:
                existing.product = item.product
                existing.vendor = item.vendor
                existing.version = item.version
                existing.criticality = item.criticality.value
                existing.environment = item.environment
                existing.owner = item.owner
                existing.updated_at = datetime.utcnow()
                updated += 1
            else:
                new_asset = Asset(
                    name=item.name,
                    product=item.product,
                    vendor=item.vendor,
                    version=item.version,
                    criticality=item.criticality.value,
                    environment=item.environment,
                    owner=item.owner,
                    updated_at=datetime.utcnow(),
                )
                db.add(new_asset)
                created += 1
        except Exception as e:
            rejected.append({"name": item.name, "error": str(e)})

    db.commit()
    return AssetImportResult(created=created, updated=updated, rejected=rejected)

