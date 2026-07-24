"""Link leads to a sales_pipeline stage

Revision ID: 0009
Revises: 0008
Create Date: 2026-07-23

`SalesPipeline` stages were a standalone lookup table with no FK from `Lead`,
so the pipeline was CRUD-able but functionally disconnected from actual
leads. Adds a nullable `pipeline_stage_id` FK on `leads`, kept alongside the
existing free-text `status` column for backward compatibility.
"""
from alembic import op
import sqlalchemy as sa

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "leads",
        sa.Column("pipeline_stage_id", sa.Uuid(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_leads_pipeline_stage_id",
        "leads",
        "sales_pipeline",
        ["pipeline_stage_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_leads_pipeline_stage_id", "leads", type_="foreignkey")
    op.drop_column("leads", "pipeline_stage_id")
