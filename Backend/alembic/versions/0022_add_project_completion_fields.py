"""Add completed_at to projects

Revision ID: 0022
Revises: 0021
Create Date: 2026-07-27

No project-completion/archival concept existed anywhere (Project.status
was free text default "active" with no /complete endpoint and no
completion timestamp). This adds the timestamp; `status='completed'` is
set at the application layer (ProjectService.complete_project) rather
than via a new column/enum, keeping the existing status column's meaning
unchanged for every other value it already holds in real data
("active", "Planning", "In Progress", ...).
"""
from alembic import op
import sqlalchemy as sa

revision = "0022"
down_revision = "0021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("projects", "completed_at")
