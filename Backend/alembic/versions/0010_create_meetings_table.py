"""Create meetings table

Revision ID: 0010
Revises: 0009
Create Date: 2026-07-23

The Sales Dashboard's Meetings/Calendar pages previously kept meetings in
client-side Zustand state only (lost on refresh, no backend at all). This
introduces a real `meetings` table backing those existing pages.
"""
from alembic import op
import sqlalchemy as sa

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meetings",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("lead_id", sa.Uuid(as_uuid=True), sa.ForeignKey("leads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("meeting_type", sa.Text(), nullable=False, server_default="video_call"),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("status", sa.Text(), nullable=False, server_default="scheduled"),
        sa.Column("agenda", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("follow_up_required", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("assigned_to", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_meetings_lead_id", "meetings", ["lead_id"])


def downgrade() -> None:
    op.drop_index("ix_meetings_lead_id", table_name="meetings")
    op.drop_table("meetings")
