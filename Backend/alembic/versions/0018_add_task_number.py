"""Add task_number to tasks

Revision ID: 0018
Revises: 0017
Create Date: 2026-07-27

Tasks only had a UUID `id` - the Employee Dashboard's Submit Work page had
no stable human-readable identifier to show, so a previous frontend
version fell back to hardcoded placeholders like "TASK-001" as the
<option value>, which the backend then rejected as an invalid UUID. This
adds a real, sequential task_number for display; `id` (UUID) remains the
only value ever sent back to the API.
"""
from alembic import op
import sqlalchemy as sa

revision = "0018"
down_revision = "0017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SEQUENCE IF NOT EXISTS tasks_task_number_seq")
    op.add_column("tasks", sa.Column("task_number", sa.Text(), nullable=True))
    op.execute(
        "UPDATE tasks SET task_number = 'TASK-' || LPAD(nextval('tasks_task_number_seq')::text, 4, '0') "
        "WHERE task_number IS NULL"
    )
    op.alter_column("tasks", "task_number", nullable=False)
    op.create_unique_constraint("uq_tasks_task_number", "tasks", ["task_number"])
    op.alter_column(
        "tasks",
        "task_number",
        server_default=sa.text("'TASK-' || LPAD(nextval('tasks_task_number_seq')::text, 4, '0')"),
    )


def downgrade() -> None:
    op.drop_constraint("uq_tasks_task_number", "tasks", type_="unique")
    op.drop_column("tasks", "task_number")
    op.execute("DROP SEQUENCE IF EXISTS tasks_task_number_seq")
