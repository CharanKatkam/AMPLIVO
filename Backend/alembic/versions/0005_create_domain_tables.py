"""Create all domain module tables

Revision ID: 0005
Revises: 0004
Create Date: 2026-07-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Users / RBAC tables ──────────────────────────────────────────────
    op.create_table(
        "roles",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, unique=True),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "permissions",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("module", sa.Text(), nullable=False),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("module", "action", name="uq_permissions_module_action"),
    )

    op.create_table(
        "role_permissions",
        sa.Column("role_id", PG_UUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("permission_id", PG_UUID(as_uuid=True), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("granted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "branches",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("code", sa.Text(), nullable=False, unique=True),
        sa.Column("city", sa.Text(), nullable=False),
        sa.Column("state", sa.Text(), nullable=True),
        sa.Column("country", sa.Text(), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("is_headquarters", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_sales_office", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("timezone", sa.Text(), nullable=False, server_default="Asia/Kolkata"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "departments",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, unique=True),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("head_user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "teams",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("department_id", PG_UUID(as_uuid=True), sa.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("lead_user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "designations",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "user_profiles",
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("full_name", sa.Text(), nullable=False),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("designation", sa.Text(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("gender", sa.Text(), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("date_of_joining", sa.Date(), nullable=True),
        sa.Column("timezone", sa.Text(), nullable=False, server_default="Asia/Kolkata"),
        sa.Column("linkedin_url", sa.Text(), nullable=True),
        sa.Column("emergency_contact_name", sa.Text(), nullable=True),
        sa.Column("emergency_contact_phone", sa.Text(), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── CRM ──────────────────────────────────────────────────────────────
    op.create_table(
        "clients",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("company_name", sa.Text(), nullable=False),
        sa.Column("display_name", sa.Text(), nullable=True),
        sa.Column("industry", sa.Text(), nullable=True),
        sa.Column("website", sa.Text(), nullable=True),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("gst_number", sa.Text(), nullable=True),
        sa.Column("pan_number", sa.Text(), nullable=True),
        sa.Column("client_type", sa.Text(), nullable=True, server_default="regular"),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("assigned_to", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("branch_id", PG_UUID(as_uuid=True), sa.ForeignKey("branches.id", ondelete="SET NULL"), nullable=True),
        sa.Column("onboarding_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "client_contacts",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("designation", sa.Text(), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "client_addresses",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("address_type", sa.Text(), nullable=False, server_default="billing"),
        sa.Column("address_line_1", sa.Text(), nullable=False),
        sa.Column("address_line_2", sa.Text(), nullable=True),
        sa.Column("city", sa.Text(), nullable=False),
        sa.Column("state", sa.Text(), nullable=True),
        sa.Column("country", sa.Text(), nullable=False, server_default="India"),
        sa.Column("postal_code", sa.Text(), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "client_documents",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("document_type", sa.Text(), nullable=True),
        sa.Column("file_url", sa.Text(), nullable=True),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("uploaded_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "client_notes",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Leads ────────────────────────────────────────────────────────────
    op.create_table(
        "lead_sources",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, unique=True),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "leads",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("company_name", sa.Text(), nullable=True),
        sa.Column("contact_name", sa.Text(), nullable=True),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("source_id", PG_UUID(as_uuid=True), sa.ForeignKey("lead_sources.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="new"),
        sa.Column("priority", sa.Text(), nullable=False, server_default="medium"),
        sa.Column("estimated_value", sa.Float(), nullable=True),
        sa.Column("assigned_to", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("converted_client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("converted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "lead_activities",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("lead_id", PG_UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("activity_type", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("performed_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "lead_followups",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("lead_id", PG_UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("followup_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("followup_type", sa.Text(), nullable=False, server_default="call"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("assigned_to", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "sales_pipeline",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("stage", sa.Text(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("probability", sa.Float(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Campaigns ────────────────────────────────────────────────────────
    op.create_table(
        "campaigns",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("budget", sa.Float(), nullable=True),
        sa.Column("spent_amount", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("target_audience", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("manager_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "campaign_platforms",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("platform_name", sa.Text(), nullable=False),
        sa.Column("account_id", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("budget_allocation", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "campaign_assets",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("asset_type", sa.Text(), nullable=False),
        sa.Column("file_url", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("uploaded_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "campaign_metrics",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("clicks", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("conversions", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("spend", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── SEO ──────────────────────────────────────────────────────────────
    op.create_table(
        "seo_projects",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("target_url", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("manager_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "seo_keywords",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", PG_UUID(as_uuid=True), sa.ForeignKey("seo_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("keyword", sa.Text(), nullable=False),
        sa.Column("search_volume", sa.Integer(), nullable=True),
        sa.Column("difficulty", sa.Float(), nullable=True),
        sa.Column("current_rank", sa.Integer(), nullable=True),
        sa.Column("target_rank", sa.Integer(), nullable=True),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "seo_audits",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", PG_UUID(as_uuid=True), sa.ForeignKey("seo_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("audit_date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("health_score", sa.Float(), nullable=True),
        sa.Column("errors_count", sa.Integer(), nullable=True),
        sa.Column("warnings_count", sa.Integer(), nullable=True),
        sa.Column("notices_count", sa.Integer(), nullable=True),
        sa.Column("report_url", sa.Text(), nullable=True),
        sa.Column("conducted_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "seo_backlinks",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", PG_UUID(as_uuid=True), sa.ForeignKey("seo_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("target_url", sa.Text(), nullable=False),
        sa.Column("domain_authority", sa.Integer(), nullable=True),
        sa.Column("is_dofollow", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("discovered_at", sa.Date(), nullable=True),
    )

    # ── Paid Ads ─────────────────────────────────────────────────────────
    op.create_table(
        "ad_campaigns",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("platform", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("daily_budget", sa.Float(), nullable=True),
        sa.Column("total_budget", sa.Float(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("manager_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "ad_groups",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("ad_campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("bid_amount", sa.Float(), nullable=True),
        sa.Column("target_audience", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "ad_metrics",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("ad_campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("clicks", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("conversions", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("spend", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("cpc", sa.Float(), nullable=True),
        sa.Column("roas", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Social ───────────────────────────────────────────────────────────
    op.create_table(
        "social_profiles",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("platform", sa.Text(), nullable=False),
        sa.Column("profile_name", sa.Text(), nullable=False),
        sa.Column("profile_url", sa.Text(), nullable=True),
        sa.Column("access_token", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "social_posts",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("profile_id", PG_UUID(as_uuid=True), sa.ForeignKey("social_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("media_urls", sa.Text(), nullable=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("author_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "social_metrics",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("post_id", PG_UUID(as_uuid=True), sa.ForeignKey("social_posts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("likes", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("comments", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("shares", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("clicks", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Creative ─────────────────────────────────────────────────────────
    op.create_table(
        "creative_projects",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="briefing"),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("manager_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "creative_assets",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", PG_UUID(as_uuid=True), sa.ForeignKey("creative_projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("asset_type", sa.Text(), nullable=False),
        sa.Column("file_url", sa.Text(), nullable=True),
        sa.Column("version", sa.Text(), nullable=False, server_default="v1"),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("designer_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "creative_feedback",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("asset_id", PG_UUID(as_uuid=True), sa.ForeignKey("creative_assets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_resolved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── CMS ──────────────────────────────────────────────────────────────
    op.create_table(
        "content_categories",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, unique=True),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "content_items",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("content_type", sa.Text(), nullable=False, server_default="post"),
        sa.Column("category_id", PG_UUID(as_uuid=True), sa.ForeignKey("content_categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("author_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Notifications ────────────────────────────────────────────────────
    op.create_table(
        "notification_templates",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, unique=True),
        sa.Column("channel", sa.Text(), nullable=False),
        sa.Column("subject", sa.Text(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "notifications",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("template_id", PG_UUID(as_uuid=True), sa.ForeignKey("notification_templates.id", ondelete="SET NULL"), nullable=True),
        sa.Column("channel", sa.Text(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="sent"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Finance ──────────────────────────────────────────────────────────
    op.create_table(
        "invoices",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("invoice_number", sa.Text(), nullable=False, unique=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("issue_date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("subtotal", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("tax_total", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("total_amount", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("currency", sa.Text(), nullable=False, server_default="USD"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "invoice_items",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("invoice_id", PG_UUID(as_uuid=True), sa.ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False, server_default=sa.text("1.0")),
        sa.Column("unit_price", sa.Float(), nullable=False),
        sa.Column("tax_rate", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("total", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "payments",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("invoice_id", PG_UUID(as_uuid=True), sa.ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("payment_method", sa.Text(), nullable=False),
        sa.Column("reference_number", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="completed"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "expenses",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("category", sa.Text(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.Text(), nullable=False, server_default="USD"),
        sa.Column("expense_date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("receipt_url", sa.Text(), nullable=True),
        sa.Column("logged_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Analytics ────────────────────────────────────────────────────────
    op.create_table(
        "dashboards",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_shared", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("layout_config", sa.Text(), nullable=True),
        sa.Column("owner_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "reports",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("report_type", sa.Text(), nullable=False),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=True),
        sa.Column("parameters", sa.Text(), nullable=True),
        sa.Column("generated_file_url", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("generated_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "data_integrations",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=True),
        sa.Column("provider_name", sa.Text(), nullable=False),
        sa.Column("credentials_json", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("last_sync", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Influencers ──────────────────────────────────────────────────────
    op.create_table(
        "influencers",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("niche", sa.Text(), nullable=True),
        sa.Column("platform", sa.Text(), nullable=False),
        sa.Column("profile_url", sa.Text(), nullable=True),
        sa.Column("followers_count", sa.Integer(), nullable=True),
        sa.Column("engagement_rate", sa.Float(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "influencer_campaigns",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("influencer_id", PG_UUID(as_uuid=True), sa.ForeignKey("influencers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="negotiation"),
        sa.Column("deliverables", sa.Text(), nullable=True),
        sa.Column("budget", sa.Float(), nullable=True),
        sa.Column("publish_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "influencer_contracts",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("influencer_id", PG_UUID(as_uuid=True), sa.ForeignKey("influencers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("campaign_id", PG_UUID(as_uuid=True), sa.ForeignKey("influencer_campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("document_url", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("signed_date", sa.Date(), nullable=True),
        sa.Column("valid_until", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Websites ─────────────────────────────────────────────────────────
    op.create_table(
        "websites",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("domain", sa.Text(), nullable=False, unique=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("platform", sa.Text(), nullable=True),
        sa.Column("hosting_provider", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("manager_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "website_pages",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("website_id", PG_UUID(as_uuid=True), sa.ForeignKey("websites.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("url_path", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="published"),
        sa.Column("seo_title", sa.Text(), nullable=True),
        sa.Column("seo_description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "website_metrics",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("website_id", PG_UUID(as_uuid=True), sa.ForeignKey("websites.id", ondelete="CASCADE"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False, server_default=sa.func.current_date()),
        sa.Column("visitors", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("page_views", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("bounce_rate", sa.Integer(), nullable=True),
        sa.Column("avg_session_duration", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Tasks / Projects ─────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("manager_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "tasks",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("project_id", PG_UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="todo"),
        sa.Column("priority", sa.Text(), nullable=False, server_default="medium"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("assigned_to", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "task_comments",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("task_id", PG_UUID(as_uuid=True), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "task_attachments",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("task_id", PG_UUID(as_uuid=True), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_name", sa.Text(), nullable=False),
        sa.Column("file_url", sa.Text(), nullable=False),
        sa.Column("uploaded_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Client Portal ────────────────────────────────────────────────────
    op.create_table(
        "portal_settings",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("custom_domain", sa.Text(), nullable=True),
        sa.Column("theme_color", sa.Text(), nullable=True),
        sa.Column("logo_url", sa.Text(), nullable=True),
        sa.Column("features_enabled", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "portal_announcements",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("author_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "portal_resources",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("file_url", sa.Text(), nullable=False),
        sa.Column("resource_type", sa.Text(), nullable=False),
        sa.Column("uploaded_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Settings ─────────────────────────────────────────────────────────
    op.create_table(
        "system_settings",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("key", sa.Text(), nullable=False, unique=True),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("updated_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "user_preferences",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("theme", sa.Text(), nullable=False, server_default="light"),
        sa.Column("language", sa.Text(), nullable=False, server_default="en"),
        sa.Column("timezone", sa.Text(), nullable=False, server_default="UTC"),
        sa.Column("email_notifications", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("in_app_notifications", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── NEW MODULES ──────────────────────────────────────────────────────
    # ── Case Studies ─────────────────────────────────────────────────────
    op.create_table(
        "case_studies",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("industry", sa.Text(), nullable=True),
        sa.Column("challenge", sa.Text(), nullable=True),
        sa.Column("solution", sa.Text(), nullable=True),
        sa.Column("results", sa.Text(), nullable=True),
        sa.Column("cover_image_url", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("author_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "case_study_metrics",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("case_study_id", PG_UUID(as_uuid=True), sa.ForeignKey("case_studies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("label", sa.Text(), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )

    # ── Portfolio ────────────────────────────────────────────────────────
    op.create_table(
        "portfolio_items",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.Text(), nullable=True),
        sa.Column("cover_image_url", sa.Text(), nullable=True),
        sa.Column("live_url", sa.Text(), nullable=True),
        sa.Column("technologies", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("author_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Testimonials ─────────────────────────────────────────────────────
    op.create_table(
        "testimonials",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("client_name", sa.Text(), nullable=False),
        sa.Column("client_title", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── FAQs ─────────────────────────────────────────────────────────────
    op.create_table(
        "faq_categories",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False, unique=True),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "faqs",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("category_id", PG_UUID(as_uuid=True), sa.ForeignKey("faq_categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Careers ──────────────────────────────────────────────────────────
    op.create_table(
        "job_openings",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("department_id", PG_UUID(as_uuid=True), sa.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True),
        sa.Column("location", sa.Text(), nullable=True),
        sa.Column("employment_type", sa.Text(), nullable=False, server_default="full_time"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("requirements", sa.Text(), nullable=True),
        sa.Column("salary_range", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="open"),
        sa.Column("posted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "job_applications",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("job_opening_id", PG_UUID(as_uuid=True), sa.ForeignKey("job_openings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("applicant_name", sa.Text(), nullable=False),
        sa.Column("applicant_email", sa.Text(), nullable=False),
        sa.Column("applicant_phone", sa.Text(), nullable=True),
        sa.Column("resume_url", sa.Text(), nullable=True),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="submitted"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Contact Forms ────────────────────────────────────────────────────
    op.create_table(
        "contact_submissions",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("company", sa.Text(), nullable=True),
        sa.Column("subject", sa.Text(), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("source", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="new"),
        sa.Column("assigned_to", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("converted_lead_id", PG_UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Consultation Requests ────────────────────────────────────────────
    op.create_table(
        "consultation_requests",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("company", sa.Text(), nullable=True),
        sa.Column("service_interest", sa.Text(), nullable=True),
        sa.Column("budget_range", sa.Text(), nullable=True),
        sa.Column("preferred_date", sa.Date(), nullable=True),
        sa.Column("preferred_time", sa.Text(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("assigned_to", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Marketing Automation ─────────────────────────────────────────────
    op.create_table(
        "automation_workflows",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("trigger_type", sa.Text(), nullable=False),
        sa.Column("trigger_config", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("client_id", PG_UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "automation_actions",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("workflow_id", PG_UUID(as_uuid=True), sa.ForeignKey("automation_workflows.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action_type", sa.Text(), nullable=False),
        sa.Column("action_config", sa.Text(), nullable=True),
        sa.Column("delay_seconds", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "automation_logs",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("workflow_id", PG_UUID(as_uuid=True), sa.ForeignKey("automation_workflows.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action_id", PG_UUID(as_uuid=True), sa.ForeignKey("automation_actions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("lead_id", PG_UUID(as_uuid=True), sa.ForeignKey("leads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("executed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Approval System ──────────────────────────────────────────────────
    op.create_table(
        "approval_policies",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("module", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("required_approvers", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "approval_requests",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("policy_id", PG_UUID(as_uuid=True), sa.ForeignKey("approval_policies.id", ondelete="SET NULL"), nullable=True),
        sa.Column("entity_type", sa.Text(), nullable=False),
        sa.Column("entity_id", PG_UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("requested_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "approval_decisions",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", PG_UUID(as_uuid=True), sa.ForeignKey("approval_requests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("approver_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("decision", sa.Text(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("decided_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Activity Timeline ────────────────────────────────────────────────
    op.create_table(
        "activity_logs",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("entity_type", sa.Text(), nullable=False),
        sa.Column("entity_id", PG_UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metadata", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── File Manager ─────────────────────────────────────────────────────
    op.create_table(
        "file_folders",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("parent_id", PG_UUID(as_uuid=True), sa.ForeignKey("file_folders.id", ondelete="CASCADE"), nullable=True),
        sa.Column("created_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "files",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("original_name", sa.Text(), nullable=False),
        sa.Column("mime_type", sa.Text(), nullable=True),
        sa.Column("size", sa.Integer(), nullable=True),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("folder_id", PG_UUID(as_uuid=True), sa.ForeignKey("file_folders.id", ondelete="SET NULL"), nullable=True),
        sa.Column("uploaded_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Companies (Org management) ──────────────────────────────────────
    op.create_table(
        "companies",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("registration_number", sa.Text(), nullable=True),
        sa.Column("tax_id", sa.Text(), nullable=True),
        sa.Column("industry", sa.Text(), nullable=True),
        sa.Column("website", sa.Text(), nullable=True),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("logo_url", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # ── Timesheets ───────────────────────────────────────────────────────
    op.create_table(
        "timesheets",
        sa.Column("id", PG_UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("task_id", PG_UUID(as_uuid=True), sa.ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True),
        sa.Column("project_id", PG_UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="SET NULL"), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("hours", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="submitted"),
        sa.Column("approved_by", PG_UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("timesheets")
    op.drop_table("companies")
    op.drop_table("files")
    op.drop_table("file_folders")
    op.drop_table("activity_logs")
    op.drop_table("approval_decisions")
    op.drop_table("approval_requests")
    op.drop_table("approval_policies")
    op.drop_table("automation_logs")
    op.drop_table("automation_actions")
    op.drop_table("automation_workflows")
    op.drop_table("consultation_requests")
    op.drop_table("contact_submissions")
    op.drop_table("job_applications")
    op.drop_table("job_openings")
    op.drop_table("faqs")
    op.drop_table("faq_categories")
    op.drop_table("testimonials")
    op.drop_table("portfolio_items")
    op.drop_table("case_study_metrics")
    op.drop_table("case_studies")
    op.drop_table("user_preferences")
    op.drop_table("system_settings")
    op.drop_table("portal_resources")
    op.drop_table("portal_announcements")
    op.drop_table("portal_settings")
    op.drop_table("task_attachments")
    op.drop_table("task_comments")
    op.drop_table("tasks")
    op.drop_table("projects")
    op.drop_table("website_metrics")
    op.drop_table("website_pages")
    op.drop_table("websites")
    op.drop_table("influencer_contracts")
    op.drop_table("influencer_campaigns")
    op.drop_table("influencers")
    op.drop_table("data_integrations")
    op.drop_table("reports")
    op.drop_table("dashboards")
    op.drop_table("expenses")
    op.drop_table("payments")
    op.drop_table("invoice_items")
    op.drop_table("invoices")
    op.drop_table("notifications")
    op.drop_table("notification_templates")
    op.drop_table("content_items")
    op.drop_table("content_categories")
    op.drop_table("creative_feedback")
    op.drop_table("creative_assets")
    op.drop_table("creative_projects")
    op.drop_table("social_metrics")
    op.drop_table("social_posts")
    op.drop_table("social_profiles")
    op.drop_table("ad_metrics")
    op.drop_table("ad_groups")
    op.drop_table("ad_campaigns")
    op.drop_table("seo_backlinks")
    op.drop_table("seo_audits")
    op.drop_table("seo_keywords")
    op.drop_table("seo_projects")
    op.drop_table("campaign_metrics")
    op.drop_table("campaign_assets")
    op.drop_table("campaign_platforms")
    op.drop_table("campaigns")
    op.drop_table("sales_pipeline")
    op.drop_table("lead_followups")
    op.drop_table("lead_activities")
    op.drop_table("leads")
    op.drop_table("lead_sources")
    op.drop_table("client_notes")
    op.drop_table("client_documents")
    op.drop_table("client_addresses")
    op.drop_table("client_contacts")
    op.drop_table("clients")
    op.drop_table("user_profiles")
    op.drop_table("designations")
    op.drop_table("teams")
    op.drop_table("departments")
    op.drop_table("branches")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")
