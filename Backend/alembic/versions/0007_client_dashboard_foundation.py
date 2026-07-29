"""Client dashboard foundation: tenant scoping + support tickets + messaging

Revision ID: 0007
Revises: 0006
Create Date: 2026-07-22

Adds:
- users.client_id: links a client-portal user to their own company (clients row)
- leads.client_id: which client a lead was generated FOR (via their campaigns),
  distinct from converted_client_id (which client it became AFTER conversion)
- file_folders.client_id / files.client_id: tenant scoping for Documents/Files
- support_tickets / support_ticket_comments: client support tickets + contact requests
- conversations / messages: lightweight client <-> staff messaging
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Tenant-scoping columns ───────────────────────────────────────────
    op.add_column("users", sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True))
    op.create_index("ix_users_client_id", "users", ["client_id"])

    op.add_column("leads", sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True))
    op.create_index("ix_leads_client_id", "leads", ["client_id"])

    op.add_column("file_folders", sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True))
    op.create_index("ix_file_folders_client_id", "file_folders", ["client_id"])

    op.add_column("files", sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True))
    op.create_index("ix_files_client_id", "files", ["client_id"])

    # ── Support Tickets (also covers client-portal "Contact Requests") ──
    op.create_table(
        "support_tickets",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("subject", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.Text(), nullable=False, server_default="general"),
        sa.Column("priority", sa.Text(), nullable=False, server_default="medium"),
        sa.Column("status", sa.Text(), nullable=False, server_default="open"),
        sa.Column("created_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("assigned_to", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_support_tickets_client_id", "support_tickets", ["client_id"])

    op.create_table(
        "support_ticket_comments",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("ticket_id", PG_UUID(as_uuid=True), sa.ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Messaging ─────────────────────────────────────────────────────────
    op.create_table(
        "conversations",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=True),
        sa.Column("subject", sa.Text(), nullable=False, server_default="General"),
        sa.Column("is_closed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_conversations_client_id", "conversations", ["client_id"])

    op.create_table(
        "messages",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", PG_UUID(as_uuid=True), sa.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sender_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])


def downgrade() -> None:
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("support_ticket_comments")
    op.drop_table("support_tickets")
    op.drop_index("ix_files_client_id", table_name="files")
    op.drop_column("files", "client_id")
    op.drop_index("ix_file_folders_client_id", table_name="file_folders")
    op.drop_column("file_folders", "client_id")
    op.drop_index("ix_leads_client_id", table_name="leads")
    op.drop_column("leads", "client_id")
    op.drop_index("ix_users_client_id", table_name="users")
    op.drop_column("users", "client_id")
