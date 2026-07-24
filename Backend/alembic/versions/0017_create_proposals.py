"""Create proposals table

Revision ID: 0017
Revises: 0016
Create Date: 2026-07-24

The CRM Portal's requested workflow (Lead -> Qualified -> Client -> Opportunity
-> Proposal -> Campaign -> Project -> ...) had no backend representation at all
for the "Proposal" step. "Opportunity" reuses the existing Lead.status /
SalesPipeline stage concept (no schema change needed there). This adds one
minimal table for Proposal so the step can be exercised for real instead of
being entirely absent.
"""
from alembic import op
import sqlalchemy as sa

revision = "0017"
down_revision = "0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "proposals",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("client_id", sa.Uuid(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("amount", sa.Float(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_proposals_client_id", "proposals", ["client_id"])


def downgrade() -> None:
    op.drop_index("ix_proposals_client_id", table_name="proposals")
    op.drop_table("proposals")
