import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from ..db.models import Alert, Advisory, AssetMatch, Asset, Source, AuditEvent
from ..schemas.enums import AlertStatus, RiskBand, MatchStatus
from ..schemas.common import ScoreFactors, EvidenceItem
from ..schemas.match import AffectedAssetDetail
from ..schemas.alert import AlertListItem, AlertDetailResponse
from ..schemas.dashboard import DashboardSummaryResponse, DashboardCounts, SourceFreshness
from ..core.errors import NotFoundError, ValidationError


class AlertService:
    @staticmethod
    def list_alerts(
        db: Session,
        band: Optional[str] = None,
        status: Optional[str] = None,
        q: Optional[str] = None,
        limit: int = 50,
        cursor: Optional[str] = None,
    ) -> Dict[str, Any]:
        query = db.query(Alert).join(Advisory, Alert.advisory_id == Advisory.id)

        if band:
            valid_bands = [b.value for b in RiskBand]
            if band.lower() not in valid_bands:
                raise ValidationError(f"Invalid band '{band}'. Expected one of {valid_bands}")
            query = query.filter(Alert.band == band.lower())

        if status:
            valid_statuses = [s.value for s in AlertStatus]
            if status.lower() not in valid_statuses:
                raise ValidationError(f"Invalid status '{status}'. Expected one of {valid_statuses}")
            query = query.filter(Alert.status == status.lower())

        if q:
            term = f"%{q.strip()}%"
            query = query.filter(
                (Alert.id.ilike(term))
                | (Advisory.title.ilike(term))
                | (Advisory.cve_id.ilike(term))
                | (Alert.summary.ilike(term))
            )

        total = query.count()
        limit = min(max(1, limit), 100)
        
        # Order by score desc, then generated_at desc
        alerts = query.order_by(desc(Alert.score), desc(Alert.generated_at)).limit(limit).all()

        items = []
        for a in alerts:
            adv = a.advisory
            
            # Fetch matched assets for full frontend context without N+1 roundtrips
            matches = (
                db.query(AssetMatch, Asset)
                .join(Asset, AssetMatch.asset_id == Asset.id)
                .filter(
                    AssetMatch.advisory_id == adv.id,
                    AssetMatch.match_status.in_([MatchStatus.CANDIDATE.value, MatchStatus.EXACT.value]),
                )
                .all()
            )

            affected_assets = [
                AffectedAssetDetail(
                    asset_id=asset.id,
                    asset=asset.name,
                    product=asset.product,
                    version=asset.version,
                    criticality=asset.criticality,
                    match=match.match_status,
                    confidence=match.confidence,
                    match_reason=match.match_reason,
                )
                for match, asset in matches
            ]

            factors_dict = json.loads(a.score_factors_json or "{}")
            factors = ScoreFactors(**factors_dict)

            recs = [
                f"Verify installed software version across matched asset(s)",
                "Apply vendor security update or temporary compensating controls",
                "Review firewall rules and ingress access to service ports",
            ]

            items.append(
                AlertListItem(
                    id=a.id,
                    cve_id=adv.cve_id,
                    title=adv.title,
                    severity=adv.severity,
                    score=a.score,
                    band=RiskBand(a.band),
                    status=AlertStatus(a.status),
                    published_at=adv.published_at,
                    generated_at=a.generated_at,
                    exploited=adv.exploited,
                    source_url=adv.source_url,
                    asset_count=len(affected_assets),
                    affected_assets=affected_assets,
                    factors=factors,
                    recommendations=recs,
                    summary=a.summary,
                )
            )

        return {"items": items, "total": total, "next_cursor": None}

    @staticmethod
    def get_alert_detail(db: Session, alert_id: str) -> AlertDetailResponse:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise NotFoundError(f"Alert with id '{alert_id}' was not found")

        advisory = alert.advisory

        # Retrieve matched assets
        matches = (
            db.query(AssetMatch, Asset)
            .join(Asset, AssetMatch.asset_id == Asset.id)
            .filter(
                AssetMatch.advisory_id == advisory.id,
                AssetMatch.match_status.in_([MatchStatus.CANDIDATE.value, MatchStatus.EXACT.value]),
            )
            .all()
        )

        affected_assets: List[AffectedAssetDetail] = []
        for match, asset in matches:
            affected_assets.append(
                AffectedAssetDetail(
                    asset_id=asset.id,
                    asset=asset.name,
                    product=asset.product,
                    version=asset.version,
                    criticality=asset.criticality,
                    match=match.match_status,
                    confidence=match.confidence,
                    match_reason=match.match_reason,
                )
            )

        factors_dict = json.loads(alert.score_factors_json or "{}")
        factors = ScoreFactors(**factors_dict)

        evidence = [
            EvidenceItem(
                source="advisory_feed",
                url=advisory.source_url or "https://example.invalid/advisory",
                excerpt=advisory.description,
            )
        ]

        recommendations = [
            f"Verify version installed across {len(affected_assets)} matched asset(s)",
            "Check network perimeter to restrict ingress access to impacted services",
            "Apply vendor security update or temporary remediation controls",
        ]

        return AlertDetailResponse(
            id=alert.id,
            advisory_id=alert.advisory_id,
            score=alert.score,
            band=RiskBand(alert.band),
            status=AlertStatus(alert.status),
            title=advisory.title,
            summary=alert.summary,
            affected_assets=affected_assets,
            factors=factors,
            evidence=evidence,
            recommendations=recommendations,
            ai_provider=alert.ai_provider,
            ai_model=alert.ai_model,
            generated_at=alert.generated_at,
            acknowledged_at=alert.acknowledged_at,
        )

    @staticmethod
    def update_alert_status(
        db: Session,
        alert_id: str,
        new_status: AlertStatus,
        note: Optional[str] = None,
        actor: str = "analyst",
    ) -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            raise NotFoundError(f"Alert with id '{alert_id}' was not found")

        alert.status = new_status.value
        alert.updated_at = datetime.utcnow()
        if new_status in (AlertStatus.ACKNOWLEDGED, AlertStatus.INVESTIGATING, AlertStatus.RESOLVED):
            if not alert.acknowledged_at:
                alert.acknowledged_at = datetime.utcnow()

        audit = AuditEvent(
            alert_id=alert.id,
            actor=actor,
            action=f"status_changed_to_{new_status.value}",
            note=note,
            created_at=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def get_dashboard_summary(db: Session) -> DashboardSummaryResponse:
        total_alerts = db.query(Alert).count()
        total_assets = db.query(Asset).count()

        matched_assets_count = (
            db.query(AssetMatch.asset_id)
            .filter(AssetMatch.match_status.in_([MatchStatus.CANDIDATE.value, MatchStatus.EXACT.value]))
            .distinct()
            .count()
        )

        by_band = {
            RiskBand.CRITICAL.value: db.query(Alert).filter(Alert.band == RiskBand.CRITICAL.value).count(),
            RiskBand.HIGH.value: db.query(Alert).filter(Alert.band == RiskBand.HIGH.value).count(),
            RiskBand.MEDIUM.value: db.query(Alert).filter(Alert.band == RiskBand.MEDIUM.value).count(),
            RiskBand.LOW.value: db.query(Alert).filter(Alert.band == RiskBand.LOW.value).count(),
        }

        by_status = {
            s.value: db.query(Alert).filter(Alert.status == s.value).count()
            for s in AlertStatus
        }

        recent = AlertService.list_alerts(db, limit=5)["items"]

        sources = []
        for s in db.query(Source).all():
            last_run = (
                db.query(Advisory)
                .filter(Advisory.source_id == s.id)
                .order_by(desc(Advisory.fetched_at))
                .first()
            )
            sources.append(
                SourceFreshness(
                    source_name=s.name,
                    last_fetched_at=last_run.fetched_at if last_run else None,
                    status="active" if s.enabled else "disabled",
                )
            )

        return DashboardSummaryResponse(
            counts=DashboardCounts(
                by_band=by_band,
                by_status=by_status,
                total_alerts=total_alerts,
                total_assets=total_assets,
                matched_assets_count=matched_assets_count,
            ),
            recent_alerts=recent,
            sources=sources,
            updated_at=datetime.utcnow(),
        )

