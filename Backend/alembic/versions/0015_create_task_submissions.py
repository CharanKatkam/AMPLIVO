"""Create task_submissions table

Revision ID: 0015
Revises: 0014
Create Date: 2026-07-23

The Employee Dashboard's "Submit Work" page and the CRM-review workflow
(approve / request changes / resubmit) previously lived entirely in
client-side Zustand state (submitToCRM/resubmitToCRM/approveSubmission
were either no-ops or never persisted). This introduces a real table
backing that existing workflow.
"""
from alembic import op
import sqlalchemy as sa

revision = "0015"
down_revision = "0014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "task_submissions",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("task_id", sa.Uuid(as_uuid=True), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("submitted_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("work_summary", sa.Text(), nullable=True),
        sa.Column("deliverable_type", sa.Text(), nullable=False, server_default="link"),
        sa.Column("external_url", sa.Text(), nullable=True),
        sa.Column("completion_percentage", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending_review"),
        sa.Column("reviewer_feedback", sa.Text(), nullable=True),
        sa.Column("reviewed_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_task_submissions_task_id", "task_submissions", ["task_id"])
    op.create_index("ix_task_submissions_submitted_by", "task_submissions", ["submitted_by"])


def downgrade() -> None:
    op.drop_index("ix_task_submissions_submitted_by", table_name="task_submissions")
    op.drop_index("ix_task_submissions_task_id", table_name="task_submissions")
    op.drop_table("task_submissions")
