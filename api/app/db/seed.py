"""Database Seeding and Reset Logic.

Ensures repeatable demo states. All synthetic data is visibly identified with is_demo=True.
"""

from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
from sqlalchemy.orm import Session

from api.app.db.session import engine, Base, SessionLocal
from api.app.db.models import (
    SourceModel,
    AssetModel,
    AdvisoryModel,
    AssetMatchModel,
    AlertModel,
    IngestionRunModel,
    AuditEventModel,
)
from api.app.services.alert_service import AlertService


def reset_database():
    """Drop and recreate all database tables."""
    engine.dispose()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_database(db: Session, force_reset: bool = True):
    """Seed sources, demo assets, advisories, matches, and alerts."""
    if force_reset:
        reset_database()

    now = datetime.now(timezone.utc)

    # 1. Sources
    sources_data = [
        {"id": "demo_fixture", "name": "Curated Demo Fixture Feed", "kind": "fixture", "base_url": "https://example.invalid/feed", "enabled": True},
        {"id": "cisa_kev", "name": "CISA Known Exploited Vulnerabilities Catalog", "kind": "catalog", "base_url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "enabled": True},
        {"id": "nvd", "name": "National Vulnerability Database", "kind": "feed", "base_url": "https://nvd.nist.gov", "enabled": True},
    ]
    for s in sources_data:
        if not db.query(SourceModel).filter_by(id=s["id"]).first():
            db.add(SourceModel(**s))
    db.commit()

    # 2. Assets
    demo_assets_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "demo" / "assets.json"
    if demo_assets_path.exists():
        with open(demo_assets_path, "r", encoding="utf-8") as f:
            assets_data = json.load(f)
    else:
        assets_data = []

    for a in assets_data:
        existing = db.query(AssetModel).filter_by(name=a["name"]).first()
        if not existing:
            db.add(AssetModel(
                name=a["name"],
                product=a["product"],
                vendor=a.get("vendor"),
                version=a.get("version"),
                criticality=a["criticality"],
                environment=a.get("environment", "demo"),
                owner=a.get("owner"),
                is_demo=True
            ))
    db.commit()

    # 3. Advisories
    demo_adv_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "demo" / "advisories.json"
    if demo_adv_path.exists():
        with open(demo_adv_path, "r", encoding="utf-8") as f:
            adv_data = json.load(f)
    else:
        adv_data = []

    service = AlertService(db)
    for adv in adv_data:
        days_ago = adv.get("days_ago")
        pub_at = (now - timedelta(days=days_ago)) if days_ago is not None else None

        existing_adv = db.query(AdvisoryModel).filter_by(
            source_id=adv["source_id"],
            external_id=adv["external_id"]
        ).first()

        if not existing_adv:
            model = AdvisoryModel(
                source_id=adv["source_id"],
                external_id=adv["external_id"],
                cve_id=adv.get("cve_id"),
                title=adv["title"],
                description=adv["description"],
                published_at=pub_at,
                severity=adv.get("severity"),
                cvss=adv.get("cvss"),
                exploited=adv.get("exploited"),
                affected_products_json=json.dumps(adv.get("affected_products", [])),
                source_url=adv.get("source_url"),
                is_demo=True
            )
            db.add(model)
            db.commit()
            db.refresh(model)

            # Generate match, scoring, and alert
            service.process_advisory_alert(model)

    # 4. Ingestion Run Log
    run = IngestionRunModel(
        source_id="demo_fixture",
        started_at=now,
        finished_at=now,
        status="success",
        records_seen=len(adv_data),
        records_changed=len(adv_data)
    )
    db.add(run)
    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db, force_reset=True)
        print("Database initialized and demo fixtures seeded successfully.")
    finally:
        db.close()
