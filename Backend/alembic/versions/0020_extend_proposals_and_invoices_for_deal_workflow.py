"""Let proposals/invoices attach to a Lead pre-conversion; add invoice_type

Revision ID: 0020
Revises: 0019
Create Date: 2026-07-27

Both `proposals` and `invoices` were FK'd to `client_id` only, which meant
a Proposal/Invoice could only ever be created after a Client row already
existed - i.e. after Sales had already run the full lead-conversion flow.
That contradicts the required workflow, where a proposal (and its 25%
advance invoice) happens at the Lead stage, well before any Client/User
account exists. This makes `client_id` nullable and adds a nullable
`lead_id` sibling column on both tables (a row must have at least one of
the two - enforced with a CHECK constraint, safe here since every existing
row already has `client_id` set).

`invoice_type` distinguishes a one-off/standard invoice from the new
advance (25%) / final (75%) pipeline invoices tied to a lead's deal. It
backfills to 'standard' for the 2 existing rows, which is the correct
historical meaning (they predate this workflow entirely).

`proposal_id`/`project_id`/`task_submission_id` on invoices let the
finance module reference exactly which proposal an advance invoice came
from, and which project/task-submission a final invoice was generated
against - both currently unrepresentable (finance/service.py has no
cross-module linkage to leads/tasks at all today).
"""
from alembic import op
import sqlalchemy as sa

revision = "0020"
down_revision = "0019"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── proposals ──
    op.alter_column("proposals", "client_id", nullable=True)
    op.add_column(
        "proposals",
        sa.Column("lead_id", sa.Uuid(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column("proposals", sa.Column("decision_notes", sa.Text(), nullable=True))
    op.create_index("ix_proposals_lead_id", "proposals", ["lead_id"])
    op.create_check_constraint(
        "ck_proposals_lead_or_client", "proposals", "lead_id IS NOT NULL OR client_id IS NOT NULL"
    )

    # ── invoices ──
    op.alter_column("invoices", "client_id", nullable=True)
    op.add_column(
        "invoices",
        sa.Column("lead_id", sa.Uuid(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column(
        "invoices",
        sa.Column("proposal_id", sa.Uuid(as_uuid=True), sa.ForeignKey("proposals.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column(
        "invoices",
        sa.Column("project_id", sa.Uuid(as_uuid=True), sa.ForeignKey("projects.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column(
        "invoices",
        sa.Column("task_submission_id", sa.Uuid(as_uuid=True), sa.ForeignKey("task_submissions.id", ondelete="SET NULL"), nullable=True),
    )
    op.add_column("invoices", sa.Column("invoice_type", sa.Text(), nullable=True))
    op.execute("UPDATE invoices SET invoice_type = 'standard' WHERE invoice_type IS NULL")
    op.alter_column("invoices", "invoice_type", nullable=False)
    op.create_index("ix_invoices_lead_id", "invoices", ["lead_id"])
    op.create_check_constraint(
        "ck_invoices_lead_or_client", "invoices", "lead_id IS NOT NULL OR client_id IS NOT NULL"
    )


def downgrade() -> None:
    op.drop_constraint("ck_invoices_lead_or_client", "invoices", type_="check")
    op.drop_index("ix_invoices_lead_id", table_name="invoices")
    op.drop_column("invoices", "invoice_type")
    op.drop_column("invoices", "task_submission_id")
    op.drop_column("invoices", "project_id")
    op.drop_column("invoices", "proposal_id")
    op.drop_column("invoices", "lead_id")
    op.alter_column("invoices", "client_id", nullable=False)

    op.drop_constraint("ck_proposals_lead_or_client", "proposals", type_="check")
    op.drop_index("ix_proposals_lead_id", table_name="proposals")
    op.drop_column("proposals", "decision_notes")
    op.drop_column("proposals", "lead_id")
    op.alter_column("proposals", "client_id", nullable=False)
