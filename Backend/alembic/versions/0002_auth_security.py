"""auth security: audit logs, login history, account lock, soft delete, device tracking

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-21 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users: failed-login tracking, account lock, last-seen, soft delete ---
    op.add_column(
        "users", sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column("users", sa.Column("last_failed_login", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("last_login_ip", sa.String(length=45), nullable=True))
    op.add_column("users", sa.Column("last_seen", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "users", sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false())
    )
    op.add_column("users", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("deleted_by", sa.Uuid(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_users_deleted_by_users", "users", "users", ["deleted_by"], ["id"], ondelete="SET NULL"
    )
    op.create_index("ix_users_is_deleted", "users", ["is_deleted"])

    # --- refresh_tokens: device tracking ---
    op.add_column("refresh_tokens", sa.Column("device_name", sa.String(length=100), nullable=True))
    op.add_column("refresh_tokens", sa.Column("browser", sa.String(length=100), nullable=True))
    op.add_column(
        "refresh_tokens", sa.Column("operating_system", sa.String(length=100), nullable=True)
    )
    op.add_column("refresh_tokens", sa.Column("last_used", sa.DateTime(timezone=True), nullable=True))

    # --- audit_logs ---
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("module", sa.String(length=50), nullable=False, server_default="auth"),
        sa.Column("endpoint", sa.String(length=255), nullable=False),
        sa.Column("request_method", sa.String(length=10), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.PrimaryKeyConstraint("id", name="pk_audit_logs"),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_audit_logs_user_id_users", ondelete="SET NULL"
        ),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])

    # --- login_history ---
    op.create_table(
        "login_history",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("login_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("logout_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("browser", sa.String(length=100), nullable=True),
        sa.Column("operating_system", sa.String(length=100), nullable=True),
        sa.Column("device", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("refresh_token_id", sa.Uuid(as_uuid=True), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.PrimaryKeyConstraint("id", name="pk_login_history"),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_login_history_user_id_users", ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["refresh_token_id"],
            ["refresh_tokens.id"],
            name="fk_login_history_refresh_token_id_refresh_tokens",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_login_history_user_id", "login_history", ["user_id"])
    op.create_index("ix_login_history_refresh_token_id", "login_history", ["refresh_token_id"])


def downgrade() -> None:
    op.drop_index("ix_login_history_refresh_token_id", table_name="login_history")
    op.drop_index("ix_login_history_user_id", table_name="login_history")
    op.drop_table("login_history")

    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_index("ix_audit_logs_action", table_name="audit_logs")
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_column("refresh_tokens", "last_used")
    op.drop_column("refresh_tokens", "operating_system")
    op.drop_column("refresh_tokens", "browser")
    op.drop_column("refresh_tokens", "device_name")

    op.drop_index("ix_users_is_deleted", table_name="users")
    op.drop_constraint("fk_users_deleted_by_users", "users", type_="foreignkey")
    op.drop_column("users", "deleted_by")
    op.drop_column("users", "deleted_at")
    op.drop_column("users", "is_deleted")
    op.drop_column("users", "last_seen")
    op.drop_column("users", "last_login_ip")
    op.drop_column("users", "locked_until")
    op.drop_column("users", "last_failed_login")
    op.drop_column("users", "failed_login_attempts")
