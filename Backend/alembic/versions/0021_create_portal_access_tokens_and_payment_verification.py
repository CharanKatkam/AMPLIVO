"""Create portal_access_tokens; add two-step verification to payments

Revision ID: 0021
Revises: 0020
Create Date: 2026-07-27

The workflow requires a client to accept/reject/revise a proposal, and
later submit proof of payment, before any login/portal account exists for
them - so it needs an unauthenticated, token-based ("magic link") access
mechanism. This mirrors the existing `email_verification_tokens` /
`password_reset_tokens` pattern exactly (id, owner reference, unique
token_hash, expires_at, used-tracking, created_at) rather than inventing a
new primitive, but as one shared table (`resource_type`/`resource_id`)
since the same mechanism serves two different resource kinds (a proposal
decision, an invoice payment submission) and possibly more later - a
single generic table avoids duplicating token/expiry columns per resource
type. See app/utils/tokens.py for the token generation/hashing helper this
table is built to store the output of.

`payments` gets the two-step manual verification fields the spec's literal
"Finance verifies payment" then "CRM verifies payment" language requires -
today PaymentService.create_payment is a raw insert with no verification
concept at all.
"""
from alembic import op
import sqlalchemy as sa

revision = "0021"
down_revision = "0020"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "portal_access_tokens",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("resource_type", sa.Text(), nullable=False),
        sa.Column("resource_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("lead_id", sa.Uuid(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("token_hash", sa.String(255), nullable=False, unique=True),
        sa.Column("is_single_use", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_portal_access_tokens_token_hash", "portal_access_tokens", ["token_hash"], unique=True)
    op.create_index("ix_portal_access_tokens_resource", "portal_access_tokens", ["resource_type", "resource_id"])

    op.add_column("payments", sa.Column("finance_verified_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
    op.add_column("payments", sa.Column("finance_verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("payments", sa.Column("crm_verified_by", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
    op.add_column("payments", sa.Column("crm_verified_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("payments", sa.Column("submitted_by_client", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("payments", sa.Column("submitted_via_token_id", sa.Uuid(as_uuid=True), sa.ForeignKey("portal_access_tokens.id", ondelete="SET NULL"), nullable=True))


def downgrade() -> None:
    op.drop_column("payments", "submitted_via_token_id")
    op.drop_column("payments", "submitted_by_client")
    op.drop_column("payments", "crm_verified_at")
    op.drop_column("payments", "crm_verified_by")
    op.drop_column("payments", "finance_verified_at")
    op.drop_column("payments", "finance_verified_by")

    op.drop_index("ix_portal_access_tokens_resource", table_name="portal_access_tokens")
    op.drop_index("ix_portal_access_tokens_token_hash", table_name="portal_access_tokens")
    op.drop_table("portal_access_tokens")
