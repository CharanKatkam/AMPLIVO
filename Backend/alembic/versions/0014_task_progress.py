"""Add progress column to tasks

Revision ID: 0014
Revises: 0013
Create Date: 2026-07-23

The Employee Dashboard's "Update Progress" button on My Tasks silently
no-opped: BaseRepository.update() only sets attributes the model already
has, and Task had no `progress` column, so the value was dropped every
time. This adds the missing column.
"""
from alembic import op
import sqlalchemy as sa

revision = "0014"
down_revision = "0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("progress", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("tasks", "progress")
