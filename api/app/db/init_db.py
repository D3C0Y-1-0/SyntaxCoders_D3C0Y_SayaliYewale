import os
import json
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from .session import Base, engine, SessionLocal
from .models import Asset, Source, Advisory, AssetMatch, Alert, IngestionRun, AuditEvent
from ..adapters.fixture_adapter import FixtureAdvisoryAdapter
from ..services.ingestion_service import IngestionService
from ..core.logging import logger


def init_db():
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")


def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    logger.info("Database reset completed.")


def seed_demo_data(db: Optional[Session] = None) -> dict:
    own_session = False
    if db is None:
        db = SessionLocal()
        own_session = True

    try:
        init_db()

        # 1. Seed Assets from data/demo/fixture_assets.json
        assets_path = "data/demo/fixture_assets.json"
        assets_created = 0
        if os.path.exists(assets_path):
            with open(assets_path, "r", encoding="utf-8") as f:
                asset_rows = json.load(f)
                for row in asset_rows:
                    existing = db.query(Asset).filter(Asset.name == row["name"]).first()
                    if not existing:
                        asset = Asset(
                            name=row["name"],
                            product=row["product"],
                            vendor=row.get("vendor"),
                            version=row.get("version"),
                            criticality=row.get("criticality", "medium"),
                            environment=row.get("environment", "demo"),
                            owner=row.get("owner"),
                            updated_at=datetime.utcnow(),
                        )
                        db.add(asset)
                        assets_created += 1
            db.commit()

        # 2. Seed Advisories and Trigger Ingestion via FixtureAdapter
        adapter = FixtureAdvisoryAdapter()
        run = IngestionService.run_ingestion(db, adapter)

        logger.info(f"Seed completed: {assets_created} new assets, run status={run.status}")
        return {
            "status": "success",
            "assets_seeded": assets_created,
            "ingestion_run_id": run.id,
            "records_seen": run.records_seen,
            "records_changed": run.records_changed,
        }
    finally:
        if own_session:
            db.close()
