"""SQLAlchemy ORM models for the Influencers module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Influencer(Base):
    __tablename__ = "influencers"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(Text, nullable=True)
    niche: Mapped[str | None] = mapped_column(Text, nullable=True)
    platform: Mapped[str] = mapped_column(Text, nullable=False) # instagram, youtube, tiktok
    profile_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    followers_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    engagement_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active") # active, inactive, blacklisted
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    campaigns: Mapped[list["InfluencerCampaign"]] = relationship(back_populates="influencer", cascade="all, delete-orphan")
    contracts: Mapped[list["InfluencerContract"]] = relationship(back_populates="influencer", cascade="all, delete-orphan")


class InfluencerCampaign(Base):
    __tablename__ = "influencer_campaigns"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    influencer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("influencers.id", ondelete="CASCADE"), nullable=False)
    campaign_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="negotiation") # negotiation, contracted, live, completed
    deliverables: Mapped[str | None] = mapped_column(Text, nullable=True)
    budget: Mapped[float | None] = mapped_column(Float, nullable=True)
    publish_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    influencer: Mapped["Influencer"] = relationship(back_populates="campaigns")


class InfluencerContract(Base):
    __tablename__ = "influencer_contracts"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    influencer_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("influencers.id", ondelete="CASCADE"), nullable=False)
    campaign_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("influencer_campaigns.id", ondelete="SET NULL"), nullable=True)
    document_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="draft") # draft, signed, expired
    signed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    influencer: Mapped["Influencer"] = relationship(back_populates="contracts")
