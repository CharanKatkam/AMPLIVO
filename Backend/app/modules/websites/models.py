"""SQLAlchemy ORM models for the Websites module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Website(Base):
    __tablename__ = "websites"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    domain: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    platform: Mapped[str | None] = mapped_column(Text, nullable=True) # e.g., wordpress, shopify, custom
    hosting_provider: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active") # active, maintenance, development
    manager_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    pages: Mapped[list["WebsitePage"]] = relationship(back_populates="website", cascade="all, delete-orphan")
    metrics: Mapped[list["WebsiteMetric"]] = relationship(back_populates="website", cascade="all, delete-orphan")

class WebsitePage(Base):
    __tablename__ = "website_pages"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("websites.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    url_path: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="published")
    seo_title: Mapped[str | None] = mapped_column(Text, nullable=True)
    seo_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    website: Mapped["Website"] = relationship(back_populates="pages")

class WebsiteMetric(Base):
    __tablename__ = "website_metrics"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("websites.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, default=func.current_date())
    visitors: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    page_views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    bounce_rate: Mapped[int | None] = mapped_column(Integer, nullable=True) # stored as percentage (0-100)
    avg_session_duration: Mapped[int | None] = mapped_column(Integer, nullable=True) # in seconds
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    website: Mapped["Website"] = relationship(back_populates="metrics")
