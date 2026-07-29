"""Create interviews and offers tables

Revision ID: 0013
Revises: 0012
Create Date: 2026-07-23

The HR Dashboard's Interviews/Offers pages previously kept everything in
client-side Zustand state only (lost on refresh, no backend at all — the
Offer page was structurally unreachable since nothing ever called addOffer).
This introduces real tables backing those existing pages.
"""
from alembic import op
import sqlalchemy as sa

revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "interviews",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("application_id", sa.Uuid(as_uuid=True), sa.ForeignKey("job_applications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("interviewer", sa.Text(), nullable=True),
        sa.Column("interview_type", sa.Text(), nullable=False, server_default="technical"),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("meeting_link", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="scheduled"),
        sa.Column("feedback", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_interviews_application_id", "interviews", ["application_id"])

    op.create_table(
        "offers",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("application_id", sa.Uuid(as_uuid=True), sa.ForeignKey("job_applications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("salary", sa.Text(), nullable=True),
        sa.Column("joining_date", sa.Date(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="generated"),
        sa.Column("offer_letter_url", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_offers_application_id", "offers", ["application_id"])


def downgrade() -> None:
    op.drop_index("ix_offers_application_id", table_name="offers")
    op.drop_table("offers")
    op.drop_index("ix_interviews_application_id", table_name="interviews")
    op.drop_table("interviews")
