"""Fix leads.contact_name schema drift: make it nullable

Revision ID: 0008
Revises: 0007
Create Date: 2026-07-23

The `Lead` model and LeadCreate/LeadUpdate schemas have always declared
contact_name as optional (nullable=True), but the live table had a NOT NULL
constraint left over from before migration 0005 - creating a lead without a
contact_name raised a NotNullViolationError (500) even though every other
layer of the app treats the field as optional. This brings the table in
line with the model, which was already correct.
"""
from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE leads ALTER COLUMN contact_name DROP NOT NULL")


def downgrade() -> None:
    op.execute("UPDATE leads SET contact_name = '' WHERE contact_name IS NULL")
    op.execute("ALTER TABLE leads ALTER COLUMN contact_name SET NOT NULL")
