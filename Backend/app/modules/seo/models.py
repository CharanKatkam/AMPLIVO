"""SQLAlchemy ORM models for the SEO module."""
from __future__ import annotations
import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class SeoProject(Base):
    __tablename__ = "seo_projects"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    client_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    target_url: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active")
    manager_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    keywords: Mapped[list["SeoKeyword"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    audits: Mapped[list["SeoAudit"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    backlinks: Mapped[list["SeoBacklink"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class SeoKeyword(Base):
    __tablename__ = "seo_keywords"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("seo_projects.id", ondelete="CASCADE"), nullable=False)
    keyword: Mapped[str] = mapped_column(Text, nullable=False)
    search_volume: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    url: Mapped[str | None] = mapped_column(Text, nullable=True) # Target URL for this keyword
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    project: Mapped["SeoProject"] = relationship(back_populates="keywords")


class SeoAudit(Base):
    __tablename__ = "seo_audits"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("seo_projects.id", ondelete="CASCADE"), nullable=False)
    audit_date: Mapped[date] = mapped_column(Date, nullable=False, default=func.current_date())
    health_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    errors_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    warnings_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notices_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    report_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    conducted_by: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["SeoProject"] = relationship(back_populates="audits")


class SeoBacklink(Base):
    __tablename__ = "seo_backlinks"
    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("seo_projects.id", ondelete="CASCADE"), nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    target_url: Mapped[str] = mapped_column(Text, nullable=False)
    domain_authority: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_dofollow: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active") # active, lost, requested
    discovered_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    project: Mapped["SeoProject"] = relationship(back_populates="backlinks")
