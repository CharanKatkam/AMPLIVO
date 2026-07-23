"""SQLAlchemy ORM models for the Paid Ads module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class AdCampaign(Base):
    __tablename__ = "ad_campaigns"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    platform: Mapped[str] = mapped_column(Text, nullable=False) # google, meta, linkedin, tiktok
    name: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active")
    daily_budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    manager_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    ad_groups: Mapped[list["AdGroup"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
    metrics: Mapped[list["AdMetric"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")

class AdGroup(Base):
    __tablename__ = "ad_groups"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("ad_campaigns.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active")
    bid_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    target_audience: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    campaign: Mapped["AdCampaign"] = relationship(back_populates="ad_groups")

class AdMetric(Base):
    __tablename__ = "ad_metrics"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("ad_campaigns.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, default=func.current_date())
    impressions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    clicks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    conversions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    spend: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cpc: Mapped[float | None] = mapped_column(Float, nullable=True) # cost per click
    roas: Mapped[float | None] = mapped_column(Float, nullable=True) # return on ad spend
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    campaign: Mapped["AdCampaign"] = relationship(back_populates="metrics")
