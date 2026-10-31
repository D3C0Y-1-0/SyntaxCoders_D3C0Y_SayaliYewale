import json
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..db.models import Source, Advisory, Asset, AssetMatch, Alert, IngestionRun
from ..adapters.base import BaseAdvisoryAdapter
from ..services.normalization import normalize_severity, parse_utc_timestamp, compute_payload_hash
from ..services.matcher import match_advisory_to_asset
from ..services.scoring import calculate_risk_score
from ..ai.interface import ai_enrichment_service
from ..core.logging import logger
from ..schemas.enums import IngestionStatus, MatchStatus, AlertStatus


class IngestionService:
    @staticmethod
    def get_or_create_source(db: Session, name: str, kind: str, base_url: Optional[str] = None) -> Source:
        source = db.query(Source).filter(Source.name == name).first()
        if not source:
            source = Source(name=name, kind=kind, base_url=base_url, enabled=True)
            db.add(source)
            db.commit()
            db.refresh(source)
        return source

    @classmethod
    def run_ingestion(cls, db: Session, adapter: BaseAdvisoryAdapter) -> IngestionRun:
        source = cls.get_or_create_source(db, name=adapter.name, kind=adapter.kind)
        
        run = IngestionRun(
            source_id=source.id,
            started_at=datetime.utcnow(),
            status=IngestionStatus.RUNNING.value,
            records_seen=0,
            records_changed=0,
        )
        db.add(run)
        db.commit()
        db.refresh(run)

        try:
            raw_items = adapter.fetch_advisories()
            seen_count = len(raw_items)
            changed_count = 0

            # Preload all assets in memory for matching
            assets = db.query(Asset).all()

            for item in raw_items:
                ext_id = str(item.get("external_id"))
                raw_hash = compute_payload_hash(item)

                existing_adv = (
                    db.query(Advisory)
                    .filter(Advisory.source_id == source.id, Advisory.external_id == ext_id)
                    .first()
                )

                affected_prods = item.get("affected_products", [])
                affected_json = json.dumps(affected_prods)

                published_at = parse_utc_timestamp(item.get("published_at"))
                cvss_val = float(item["cvss"]) if item.get("cvss") is not None else None
                severity_val = normalize_severity(item.get("severity"), cvss_val).value
                exploited_val = bool(item.get("exploited", False))

                if existing_adv:
                    # Idempotent check: if raw hash matches, record hasn't changed
                    if existing_adv.raw_hash == raw_hash:
                        advisory_obj = existing_adv
                    else:
                        existing_adv.title = item.get("title", existing_adv.title)
                        existing_adv.description = item.get("description", existing_adv.description)
                        existing_adv.cve_id = item.get("cve_id", existing_adv.cve_id)
                        existing_adv.published_at = published_at
                        existing_adv.severity = severity_val
                        existing_adv.cvss = cvss_val
                        existing_adv.exploited = exploited_val
                        existing_adv.affected_products_json = affected_json
                        existing_adv.source_url = item.get("source_url", existing_adv.source_url)
                        existing_adv.raw_hash = raw_hash
                        existing_adv.fetched_at = datetime.utcnow()
                        advisory_obj = existing_adv
                        changed_count += 1
                else:
                    advisory_obj = Advisory(
                        source_id=source.id,
                        external_id=ext_id,
                        cve_id=item.get("cve_id"),
                        title=item.get("title", f"Advisory {ext_id}"),
                        description=item.get("description", ""),
                        published_at=published_at,
                        severity=severity_val,
                        cvss=cvss_val,
                        exploited=exploited_val,
                        affected_products_json=affected_json,
                        source_url=item.get("source_url"),
                        raw_hash=raw_hash,
                        fetched_at=datetime.utcnow(),
                    )
                    db.add(advisory_obj)
                    db.flush()
                    changed_count += 1

                # Matching phase against organization assets
                matched_assets_data = []
                matched_criticalities = []
                matched_confidences = []

                for asset in assets:
                    status, reason, confidence = match_advisory_to_asset(
                        advisory_affected_products=affected_prods,
                        asset_product=asset.product,
                        asset_vendor=asset.vendor,
                        asset_version=asset.version,
                    )

                    existing_match = (
                        db.query(AssetMatch)
                        .filter(AssetMatch.advisory_id == advisory_obj.id, AssetMatch.asset_id == asset.id)
                        .first()
                    )

                    if existing_match:
                        existing_match.match_status = status.value
                        existing_match.match_reason = reason
                        existing_match.confidence = confidence
                    else:
                        new_match = AssetMatch(
                            advisory_id=advisory_obj.id,
                            asset_id=asset.id,
                            match_status=status.value,
                            match_reason=reason,
                            confidence=confidence,
                        )
                        db.add(new_match)

                    if status in (MatchStatus.CANDIDATE, MatchStatus.EXACT):
                        matched_assets_data.append({
                            "asset_id": asset.id,
                            "name": asset.name,
                            "product": asset.product,
                            "version": asset.version,
                            "criticality": asset.criticality,
                            "match": status.value,
                            "confidence": confidence,
                            "match_reason": reason,
                        })
                        matched_criticalities.append(asset.criticality)
                        matched_confidences.append(confidence)

                # Generate or update Alert if any asset is matched or if high severity
                if matched_assets_data:
                    scoring_res = calculate_risk_score(
                        severity=advisory_obj.severity,
                        cvss=advisory_obj.cvss,
                        exploited=advisory_obj.exploited,
                        matched_asset_criticalities=matched_criticalities,
                        matched_confidences=matched_confidences,
                        published_at=advisory_obj.published_at,
                    )

                    score = scoring_res["score"]
                    band = scoring_res["band"].value
                    factors = scoring_res["factors"].model_dump()

                    # Call Person 3 AI enrichment interface with clean structured input
                    from ..ai.interface import AIEnrichmentInput
                    ai_input = AIEnrichmentInput(
                        advisory_title=advisory_obj.title,
                        advisory_description=advisory_obj.description,
                        cve_id=advisory_obj.cve_id,
                        source_url=advisory_obj.source_url,
                        matched_assets=matched_assets_data,
                        factors=factors,
                    )
                    enrichment = ai_enrichment_service.enrich(ai_input)

                    alert_id = f"al_{advisory_obj.id:03d}"
                    existing_alert = db.query(Alert).filter(Alert.id == alert_id).first()

                    if existing_alert:
                        existing_alert.score = score
                        existing_alert.band = band
                        existing_alert.score_factors_json = json.dumps(factors)
                        existing_alert.summary = enrichment.summary
                        existing_alert.ai_provider = enrichment.ai_provider
                        existing_alert.ai_model = enrichment.ai_model
                    else:
                        new_alert = Alert(
                            id=alert_id,
                            advisory_id=advisory_obj.id,
                            score=score,
                            band=band,
                            score_factors_json=json.dumps(factors),
                            summary=enrichment.summary,
                            ai_provider=enrichment.ai_provider,
                            ai_model=enrichment.ai_model,
                            status=AlertStatus.NEW.value,
                            generated_at=datetime.utcnow(),
                        )
                        db.add(new_alert)

            run.records_seen = seen_count
            run.records_changed = changed_count
            run.status = IngestionStatus.SUCCESS.value
            run.finished_at = datetime.utcnow()
            db.commit()
            db.refresh(run)
            return run

        except Exception as e:
            db.rollback()
            logger.error(f"Ingestion run failed: {e}", exc_info=True)
            run.status = IngestionStatus.FAILED.value
            run.error_summary = str(e)
            run.finished_at = datetime.utcnow()
            db.commit()
            db.refresh(run)
            return run
