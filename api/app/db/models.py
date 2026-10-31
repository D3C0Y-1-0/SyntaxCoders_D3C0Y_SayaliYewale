from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from .session import Base


def utcnow():
    return datetime.utcnow()


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    kind = Column(String(50), nullable=False)  # fixture, cisa_kev, nvd
    base_url = Column(String(255), nullable=True)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    advisories = relationship("Advisory", back_populates="source", cascade="all, delete-orphan")
    ingestion_runs = relationship("IngestionRun", back_populates="source", cascade="all, delete-orphan")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False, index=True)
    product = Column(String(150), nullable=False, index=True)
    vendor = Column(String(150), nullable=True)
    version = Column(String(50), nullable=True)
    criticality = Column(String(20), nullable=False, default="medium", index=True)  # critical, high, medium, low
    environment = Column(String(50), nullable=False, default="demo")
    owner = Column(String(150), nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    matches = relationship("AssetMatch", back_populates="asset", cascade="all, delete-orphan")


class Advisory(Base):
    __tablename__ = "advisories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False, index=True)
    external_id = Column(String(100), nullable=False)
    cve_id = Column(String(50), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    published_at = Column(DateTime, nullable=False, index=True)
    modified_at = Column(DateTime, nullable=True)
    severity = Column(String(20), nullable=False, default="UNKNOWN", index=True)
    cvss = Column(Float, nullable=True)
    exploited = Column(Boolean, default=False, nullable=False, index=True)
    affected_products_json = Column(Text, nullable=False, default="[]")
    source_url = Column(String(500), nullable=True)
    raw_hash = Column(String(64), nullable=True)
    fetched_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("source_id", "external_id", name="uq_advisory_source_external"),
        Index("ix_advisory_pub_sev", "published_at", "severity"),
    )

    source = relationship("Source", back_populates="advisories")
    matches = relationship("AssetMatch", back_populates="advisory", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="advisory", cascade="all, delete-orphan")


class AssetMatch(Base):
    __tablename__ = "asset_matches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    advisory_id = Column(Integer, ForeignKey("advisories.id"), nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    match_status = Column(String(20), nullable=False)  # exact, candidate, none
    match_reason = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("advisory_id", "asset_id", name="uq_advisory_asset_match"),
    )

    advisory = relationship("Advisory", back_populates="matches")
    asset = relationship("Asset", back_populates="matches")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True, index=True)  # e.g., "al_001"
    advisory_id = Column(Integer, ForeignKey("advisories.id"), nullable=False, index=True)
    score = Column(Integer, nullable=False, index=True)
    band = Column(String(20), nullable=False, index=True)  # critical, high, medium, low
    score_factors_json = Column(Text, nullable=False, default="{}")
    summary = Column(Text, nullable=False)
    ai_provider = Column(String(50), nullable=True)
    ai_model = Column(String(50), nullable=True)
    status = Column(String(30), nullable=False, default="new", index=True)  # new, acknowledged, resolved, etc.
    generated_at = Column(DateTime, default=utcnow, nullable=False, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    advisory = relationship("Advisory", back_populates="alerts")
    audit_events = relationship("AuditEvent", back_populates="alert", cascade="all, delete-orphan")


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True, index=True)
    started_at = Column(DateTime, default=utcnow, nullable=False)
    finished_at = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False, default="running")  # running, success, failed, partial
    records_seen = Column(Integer, default=0, nullable=False)
    records_changed = Column(Integer, default=0, nullable=False)
    error_summary = Column(Text, nullable=True)

    source = relationship("Source", back_populates="ingestion_runs")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_id = Column(String(50), ForeignKey("alerts.id"), nullable=False, index=True)
    actor = Column(String(100), nullable=False, default="analyst")
    action = Column(String(50), nullable=False)  # status_change, acknowledge, resolve
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    alert = relationship("Alert", back_populates="audit_events")

