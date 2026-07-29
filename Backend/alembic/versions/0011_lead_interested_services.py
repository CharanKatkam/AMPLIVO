"""Add interested_services JSON column to leads

Revision ID: 0011
Revises: 0010
Create Date: 2026-07-23

The Sales Dashboard's "Interested Services" picker on the Lead Detail page
only ever wrote to client-side Zustand state (lost on refresh) because Lead
had nowhere to persist it. Stores the picked service names as a JSON array.
"""
from alembic import op
import sqlalchemy as sa

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("interested_services", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("leads", "interested_services")
