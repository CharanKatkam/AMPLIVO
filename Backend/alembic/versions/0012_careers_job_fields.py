"""Add vacancies/work_mode/skills_required to job_openings + candidate detail fields to job_applications

Revision ID: 0012
Revises: 0011
Create Date: 2026-07-23

The HR Dashboard's JobForm already collects Vacancies and Work Mode, and the
Application detail page already displays skills/education/work_history/
portfolio, but job_openings/job_applications had no columns for any of it —
those were only ever fabricated in mock fixtures. Only adding the fields the
existing forms/pages actually use (no speculative schema beyond that).
"""
from alembic import op
import sqlalchemy as sa

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("job_openings", sa.Column("work_mode", sa.Text(), nullable=True))
    op.add_column("job_openings", sa.Column("vacancies", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("job_openings", sa.Column("skills_required", sa.JSON(), nullable=True))

    op.add_column("job_applications", sa.Column("portfolio_url", sa.Text(), nullable=True))
    op.add_column("job_applications", sa.Column("skills", sa.JSON(), nullable=True))
    op.add_column("job_applications", sa.Column("education", sa.JSON(), nullable=True))
    op.add_column("job_applications", sa.Column("work_history", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("job_applications", "work_history")
    op.drop_column("job_applications", "education")
    op.drop_column("job_applications", "skills")
    op.drop_column("job_applications", "portfolio_url")

    op.drop_column("job_openings", "skills_required")
    op.drop_column("job_openings", "vacancies")
    op.drop_column("job_openings", "work_mode")
