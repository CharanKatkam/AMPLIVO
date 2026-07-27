"""Normalize lead status vocabulary, add converted_project_id

Revision ID: 0019
Revises: 0018
Create Date: 2026-07-27

`Lead.status` has been a free-text column with no enforced vocabulary,
and different call sites disagreed on casing (`consultation_requests`/
`contact_forms` services hardcoded `"New"`, the model's own Python default
was `"new"`). This backfills the two known-equivalent legacy values to the
new canonical `NEW_LEAD`/`MEETING_SCHEDULED` constants (app/core/
lead_pipeline.py) and leaves any other existing value untouched (e.g. a
lead sitting in a temperature-classification value like "Hot" is not
guessable as a pipeline stage, so it is left alone rather than guessed at).

`converted_project_id` lets any lead-reading UI jump straight to the
project it became, once the automatic advance-payment-triggered flow (or
the existing manual /leads/{id}/convert path) creates one - mirroring the
already-existing `converted_client_id` column.
"""
from alembic import op
import sqlalchemy as sa

revision = "0019"
down_revision = "0018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE leads SET status = 'NEW_LEAD' WHERE status IN ('New', 'new')")
    op.execute("UPDATE leads SET status = 'MEETING_SCHEDULED' WHERE status = 'Meeting Scheduled'")

    op.add_column(
        "leads",
        sa.Column("converted_project_id", sa.Uuid(as_uuid=True), sa.ForeignKey("projects.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_leads_converted_project_id", "leads", ["converted_project_id"])


def downgrade() -> None:
    op.drop_index("ix_leads_converted_project_id", table_name="leads")
    op.drop_column("leads", "converted_project_id")
    # Status backfill is intentionally not reversed - 'NEW_LEAD'/'MEETING_SCHEDULED'
    # are still valid, meaningful values on their own.
