"""Synchronise Supabase public schema with ORM models.

Revision ID: 0006
Revises: 0005
Create Date: 2026-07-21

The Supabase database was originally created from an older DDL script that
does not match the current SQLAlchemy ORM models.  This migration drops and
recreates all 46 affected tables so their columns exactly match the ORM.

Tables that are referenced by foreign keys from *other* tables (like
``users``) are handled with ALTER TABLE to avoid cascading drops.
"""

from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


# ── Tables that only have EXTRA columns in the DB (ORM columns are all
#    present) — safe to just DROP the surplus columns. ──────────────────

_TABLES_WITH_EXTRA_COLS_ONLY = {
    "users": ["employee_code", "first_name", "last_login", "last_name"],
    "branches": ["branch_code", "branch_head_id", "branch_name"],
    "departments": ["department_code", "department_head_id", "department_name"],
    "designations": ["designation_code"],
    "roles": ["code", "is_active"],
    "teams": ["code", "team_code", "team_lead_id", "team_name"],
    "tasks": ["actual_hours", "campaign_id", "client_id", "completed_at",
              "completion_percentage", "estimated_hours", "start_date",
              "task_code", "task_type"],
    "clients": ["annual_revenue", "client_code", "company_size", "tax_id"],
    "leads": [],   # leads only MISSING 'notes' — handled below
    "campaigns": [],  # handled below
}


# ── Tables that have MISSING columns AND/OR completely wrong schemas
#    — must be dropped and recreated from correct DDL. ──────────────────

_TABLES_TO_RECREATE = [
    # Order matters: child tables before parent tables they reference,
    # and parent tables must be created before children that FK to them.
    # We'll drop children first, then parents, then recreate in correct order.

    # -- Activity & Timeline --
    "activity_logs",

    # -- Paid Ads --
    "ad_metrics",
    "ad_campaigns",

    # -- CRM children --
    "client_addresses",
    "client_contacts",
    "client_documents",
    "client_notes",

    # -- Case Studies --
    "case_studies",

    # -- Creative --
    "creative_assets",
    "creative_projects",

    # -- Finance --
    "invoice_items",
    "invoices",
    "expenses",
    "payments",

    # -- FAQs --
    "faqs",

    # -- Influencers --
    "influencer_campaigns",
    "influencers",

    # -- Leads children --
    "lead_activities",
    "lead_followups",
    "lead_sources",

    # -- Notifications --
    "notifications",

    # -- Auth tokens --
    "password_reset_tokens",

    # -- Permissions & Roles --
    "role_permissions",
    "permissions",

    # -- Reports --
    "reports",

    # -- Sales Pipeline --
    "sales_pipeline",

    # -- SEO --
    "seo_keywords",
    "seo_projects",

    # -- Social --
    "social_posts",

    # -- Tasks children --
    "task_attachments",
    "task_comments",

    # -- Testimonials --
    "testimonials",

    # -- User profiles & sessions --
    "user_profiles",
    "user_sessions",

    # -- Website pages --
    "website_pages",

    # -- Job applications --
    "job_applications",
]


# ── Correct CREATE TABLE DDL for each table (from create_tables.sql,
#    which matches the ORM models exactly). ─────────────────────────────

_CREATE_DDLS = {
    "activity_logs": """
CREATE TABLE activity_logs (
    id UUID NOT NULL,
    user_id UUID,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    description TEXT,
    metadata TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_activity_logs PRIMARY KEY (id),
    CONSTRAINT fk_activity_logs_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "ad_campaigns": """
CREATE TABLE ad_campaigns (
    id UUID NOT NULL,
    client_id UUID,
    platform TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    daily_budget FLOAT,
    total_budget FLOAT,
    start_date DATE,
    end_date DATE,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_ad_campaigns PRIMARY KEY (id),
    CONSTRAINT fk_ad_campaigns_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL,
    CONSTRAINT fk_ad_campaigns_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "ad_metrics": """
CREATE TABLE ad_metrics (
    id UUID NOT NULL,
    campaign_id UUID NOT NULL,
    date DATE NOT NULL,
    impressions INTEGER NOT NULL,
    clicks INTEGER NOT NULL,
    conversions INTEGER NOT NULL,
    spend FLOAT NOT NULL,
    cpc FLOAT,
    roas FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_ad_metrics PRIMARY KEY (id),
    CONSTRAINT fk_ad_metrics_campaign_id_ad_campaigns FOREIGN KEY(campaign_id) REFERENCES ad_campaigns (id) ON DELETE CASCADE
)""",

    "case_studies": """
CREATE TABLE case_studies (
    id UUID NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    client_id UUID,
    industry TEXT,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    cover_image_url TEXT,
    status TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_case_studies PRIMARY KEY (id),
    CONSTRAINT uq_case_studies_slug UNIQUE (slug),
    CONSTRAINT fk_case_studies_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL,
    CONSTRAINT fk_case_studies_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "client_addresses": """
CREATE TABLE client_addresses (
    id UUID NOT NULL,
    client_id UUID NOT NULL,
    address_type TEXT NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    country TEXT NOT NULL,
    postal_code TEXT,
    is_primary BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_client_addresses PRIMARY KEY (id),
    CONSTRAINT fk_client_addresses_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE
)""",

    "client_contacts": """
CREATE TABLE client_contacts (
    id UUID NOT NULL,
    client_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    designation TEXT,
    is_primary BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_client_contacts PRIMARY KEY (id),
    CONSTRAINT fk_client_contacts_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT fk_client_contacts_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "client_documents": """
CREATE TABLE client_documents (
    id UUID NOT NULL,
    client_id UUID NOT NULL,
    title TEXT NOT NULL,
    document_type TEXT,
    file_url TEXT,
    file_size INTEGER,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_client_documents PRIMARY KEY (id),
    CONSTRAINT fk_client_documents_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT fk_client_documents_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
)""",

    "client_notes": """
CREATE TABLE client_notes (
    id UUID NOT NULL,
    client_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_client_notes PRIMARY KEY (id),
    CONSTRAINT fk_client_notes_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT fk_client_notes_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
)""",

    "creative_assets": """
CREATE TABLE creative_assets (
    id UUID NOT NULL,
    project_id UUID NOT NULL,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    file_url TEXT,
    version TEXT NOT NULL,
    status TEXT NOT NULL,
    designer_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_creative_assets PRIMARY KEY (id),
    CONSTRAINT fk_creative_assets_project_id_creative_projects FOREIGN KEY(project_id) REFERENCES creative_projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_creative_assets_designer_id_users FOREIGN KEY(designer_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "creative_projects": """
CREATE TABLE creative_projects (
    id UUID NOT NULL,
    name TEXT NOT NULL,
    client_id UUID,
    campaign_id UUID,
    description TEXT,
    status TEXT NOT NULL,
    due_date DATE,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_creative_projects PRIMARY KEY (id),
    CONSTRAINT fk_creative_projects_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL,
    CONSTRAINT fk_creative_projects_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL,
    CONSTRAINT fk_creative_projects_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "expenses": """
CREATE TABLE expenses (
    id UUID NOT NULL,
    category TEXT NOT NULL,
    amount FLOAT NOT NULL,
    currency TEXT NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    receipt_url TEXT,
    logged_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_expenses PRIMARY KEY (id),
    CONSTRAINT fk_expenses_logged_by_users FOREIGN KEY(logged_by) REFERENCES users (id) ON DELETE SET NULL
)""",

    "faqs": """
CREATE TABLE faqs (
    id UUID NOT NULL,
    category_id UUID,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_faqs PRIMARY KEY (id),
    CONSTRAINT fk_faqs_category_id_faq_categories FOREIGN KEY(category_id) REFERENCES faq_categories (id) ON DELETE SET NULL
)""",

    "influencer_campaigns": """
CREATE TABLE influencer_campaigns (
    id UUID NOT NULL,
    influencer_id UUID NOT NULL,
    campaign_id UUID,
    status TEXT NOT NULL,
    deliverables TEXT,
    budget FLOAT,
    publish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_influencer_campaigns PRIMARY KEY (id),
    CONSTRAINT fk_influencer_campaigns_influencer_id_influencers FOREIGN KEY(influencer_id) REFERENCES influencers (id) ON DELETE CASCADE,
    CONSTRAINT fk_influencer_campaigns_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL
)""",

    "influencers": """
CREATE TABLE influencers (
    id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    niche TEXT,
    platform TEXT NOT NULL,
    profile_url TEXT,
    followers_count INTEGER,
    engagement_rate FLOAT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_influencers PRIMARY KEY (id)
)""",

    "invoice_items": """
CREATE TABLE invoice_items (
    id UUID NOT NULL,
    invoice_id UUID NOT NULL,
    description TEXT NOT NULL,
    quantity FLOAT NOT NULL,
    unit_price FLOAT NOT NULL,
    tax_rate FLOAT NOT NULL,
    total FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_invoice_items PRIMARY KEY (id),
    CONSTRAINT fk_invoice_items_invoice_id_invoices FOREIGN KEY(invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
)""",

    "invoices": """
CREATE TABLE invoices (
    id UUID NOT NULL,
    client_id UUID NOT NULL,
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal FLOAT NOT NULL,
    tax_total FLOAT NOT NULL,
    total_amount FLOAT NOT NULL,
    currency TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_invoices PRIMARY KEY (id),
    CONSTRAINT fk_invoices_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number)
)""",

    "job_applications": """
CREATE TABLE job_applications (
    id UUID NOT NULL,
    job_opening_id UUID NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_job_applications PRIMARY KEY (id),
    CONSTRAINT fk_job_applications_job_opening_id_job_openings FOREIGN KEY(job_opening_id) REFERENCES job_openings (id) ON DELETE CASCADE
)""",

    "lead_activities": """
CREATE TABLE lead_activities (
    id UUID NOT NULL,
    lead_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    performed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_lead_activities PRIMARY KEY (id),
    CONSTRAINT fk_lead_activities_lead_id_leads FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_lead_activities_performed_by_users FOREIGN KEY(performed_by) REFERENCES users (id) ON DELETE SET NULL
)""",

    "lead_followups": """
CREATE TABLE lead_followups (
    id UUID NOT NULL,
    lead_id UUID NOT NULL,
    followup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    followup_type TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_lead_followups PRIMARY KEY (id),
    CONSTRAINT fk_lead_followups_lead_id_leads FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE,
    CONSTRAINT fk_lead_followups_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL
)""",

    "lead_sources": """
CREATE TABLE lead_sources (
    id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_lead_sources PRIMARY KEY (id),
    CONSTRAINT uq_lead_sources_name UNIQUE (name),
    CONSTRAINT uq_lead_sources_slug UNIQUE (slug)
)""",

    "notifications": """
CREATE TABLE notifications (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    template_id UUID,
    channel TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_template_id_notification_templates FOREIGN KEY(template_id) REFERENCES notification_templates (id) ON DELETE SET NULL
)""",

    "password_reset_tokens": """
CREATE TABLE password_reset_tokens (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT fk_password_reset_tokens_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)""",

    "payments": """
CREATE TABLE payments (
    id UUID NOT NULL,
    invoice_id UUID NOT NULL,
    amount FLOAT NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT NOT NULL,
    reference_number TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_payments PRIMARY KEY (id),
    CONSTRAINT fk_payments_invoice_id_invoices FOREIGN KEY(invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
)""",

    "permissions": """
CREATE TABLE permissions (
    id UUID NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_permissions PRIMARY KEY (id),
    CONSTRAINT uq_permissions_module_action UNIQUE (module, action),
    CONSTRAINT uq_permissions_slug UNIQUE (slug)
)""",

    "role_permissions": """
CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role_id_roles FOREIGN KEY(role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission_id_permissions FOREIGN KEY(permission_id) REFERENCES permissions (id) ON DELETE CASCADE
)""",

    "reports": """
CREATE TABLE reports (
    id UUID NOT NULL,
    name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    client_id UUID,
    parameters TEXT,
    generated_file_url TEXT,
    status TEXT NOT NULL,
    generated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_reports PRIMARY KEY (id),
    CONSTRAINT fk_reports_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_generated_by_users FOREIGN KEY(generated_by) REFERENCES users (id) ON DELETE SET NULL
)""",

    "sales_pipeline": """
CREATE TABLE sales_pipeline (
    id UUID NOT NULL,
    name TEXT NOT NULL,
    stage TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    probability FLOAT,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_sales_pipeline PRIMARY KEY (id)
)""",

    "seo_keywords": """
CREATE TABLE seo_keywords (
    id UUID NOT NULL,
    project_id UUID NOT NULL,
    keyword TEXT NOT NULL,
    search_volume INTEGER,
    difficulty FLOAT,
    current_rank INTEGER,
    target_rank INTEGER,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_seo_keywords PRIMARY KEY (id),
    CONSTRAINT fk_seo_keywords_project_id_seo_projects FOREIGN KEY(project_id) REFERENCES seo_projects (id) ON DELETE CASCADE
)""",

    "seo_projects": """
CREATE TABLE seo_projects (
    id UUID NOT NULL,
    name TEXT NOT NULL,
    client_id UUID,
    target_url TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_seo_projects PRIMARY KEY (id),
    CONSTRAINT fk_seo_projects_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL,
    CONSTRAINT fk_seo_projects_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "social_posts": """
CREATE TABLE social_posts (
    id UUID NOT NULL,
    profile_id UUID NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    author_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_social_posts PRIMARY KEY (id),
    CONSTRAINT fk_social_posts_profile_id_social_profiles FOREIGN KEY(profile_id) REFERENCES social_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_social_posts_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "task_attachments": """
CREATE TABLE task_attachments (
    id UUID NOT NULL,
    task_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_task_attachments PRIMARY KEY (id),
    CONSTRAINT fk_task_attachments_task_id_tasks FOREIGN KEY(task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_attachments_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
)""",

    "task_comments": """
CREATE TABLE task_comments (
    id UUID NOT NULL,
    task_id UUID NOT NULL,
    content TEXT NOT NULL,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_task_comments PRIMARY KEY (id),
    CONSTRAINT fk_task_comments_task_id_tasks FOREIGN KEY(task_id) REFERENCES tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_comments_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
)""",

    "testimonials": """
CREATE TABLE testimonials (
    id UUID NOT NULL,
    client_id UUID,
    client_name TEXT NOT NULL,
    client_title TEXT,
    content TEXT NOT NULL,
    rating INTEGER,
    avatar_url TEXT,
    is_featured BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_testimonials PRIMARY KEY (id),
    CONSTRAINT fk_testimonials_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL
)""",

    "user_profiles": """
CREATE TABLE user_profiles (
    user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    designation TEXT,
    bio TEXT,
    gender TEXT,
    date_of_birth DATE,
    date_of_joining DATE,
    timezone TEXT NOT NULL,
    linkedin_url TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_user_profiles PRIMARY KEY (user_id),
    CONSTRAINT fk_user_profiles_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
)""",

    "user_sessions": """
CREATE TABLE user_sessions (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    refresh_token_id UUID,
    device_name VARCHAR(100),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_user_sessions PRIMARY KEY (id),
    CONSTRAINT fk_user_sessions_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_sessions_refresh_token_id_refresh_tokens FOREIGN KEY(refresh_token_id) REFERENCES refresh_tokens (id) ON DELETE SET NULL
)""",

    "case_study_metrics": """
CREATE TABLE case_study_metrics (
    id UUID NOT NULL,
    case_study_id UUID NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    CONSTRAINT pk_case_study_metrics PRIMARY KEY (id),
    CONSTRAINT fk_case_study_metrics_case_study_id_case_studies FOREIGN KEY(case_study_id) REFERENCES case_studies (id) ON DELETE CASCADE
)""",

    "website_pages": """
CREATE TABLE website_pages (
    id UUID NOT NULL,
    website_id UUID NOT NULL,
    title TEXT NOT NULL,
    url_path TEXT NOT NULL,
    status TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT pk_website_pages PRIMARY KEY (id),
    CONSTRAINT fk_website_pages_website_id_websites FOREIGN KEY(website_id) REFERENCES websites (id) ON DELETE CASCADE
)""",
}


def upgrade() -> None:
    # ── 1. Drop tables that need full recreation (children first) ──────
    # We must drop children that have FK refs to other tables being dropped.
    # Order: drop the most dependent tables first.

    # Drop order: children before parents, respecting FK dependencies.
    _drop_order = [
        # ad_metrics depends on ad_campaigns
        "ad_metrics",
        # creative_assets depends on creative_projects
        "creative_assets",
        # invoice_items depends on invoices
        "invoice_items",
        # payments depends on invoices
        "payments",
        # seo_keywords depends on seo_projects
        "seo_keywords",
        # social_metrics depends on social_posts (but social_metrics is OK)
        # influencer_campaigns depends on influencers
        "influencer_campaigns",
        # lead_activities depends on leads
        "lead_activities",
        # lead_followups depends on leads
        "lead_followups",
        # role_permissions depends on permissions
        "role_permissions",
        # task_attachments depends on tasks
        "task_attachments",
        # task_comments depends on tasks
        "task_comments",
        # case_study_metrics depends on case_studies
        # (case_study_metrics is OK, but we need to drop it before case_studies)
        "case_study_metrics",
        # Now the parent tables
        "activity_logs",
        "ad_campaigns",
        "case_studies",
        "client_addresses",
        "client_contacts",
        "client_documents",
        "client_notes",
        "creative_projects",
        "expenses",
        "faqs",
        "influencers",
        "invoices",
        "job_applications",
        "lead_sources",
        "notifications",
        "password_reset_tokens",
        "permissions",
        "reports",
        "sales_pipeline",
        "seo_projects",
        "social_posts",
        "testimonials",
        "user_profiles",
        "user_sessions",
        "website_pages",
    ]

    for table in _drop_order:
        op.execute(f"DROP TABLE IF EXISTS {table} CASCADE")

    # ── 2. Handle tables that only have extra columns (drop surplus) ───
    # users: drop employee_code, first_name, last_login, last_name
    for col in ["employee_code", "first_name", "last_login", "last_name"]:
        op.execute(f"ALTER TABLE users DROP COLUMN IF EXISTS {col}")

    # branches: drop old extra columns
    for col in ["branch_code", "branch_head_id", "branch_name"]:
        op.execute(f"ALTER TABLE branches DROP COLUMN IF EXISTS {col}")

    # departments: drop old extra columns
    for col in ["department_code", "department_head_id", "department_name"]:
        op.execute(f"ALTER TABLE departments DROP COLUMN IF EXISTS {col}")

    # designations: drop old extra columns
    for col in ["designation_code"]:
        op.execute(f"ALTER TABLE designations DROP COLUMN IF EXISTS {col}")

    # roles: drop old extra columns
    for col in ["code", "is_active"]:
        op.execute(f"ALTER TABLE roles DROP COLUMN IF EXISTS {col}")

    # teams: drop old extra columns
    for col in ["code", "team_code", "team_lead_id", "team_name"]:
        op.execute(f"ALTER TABLE teams DROP COLUMN IF EXISTS {col}")

    # tasks: drop old extra columns
    for col in ["actual_hours", "campaign_id", "client_id", "completed_at",
                 "completion_percentage", "estimated_hours", "start_date",
                 "task_code", "task_type"]:
        op.execute(f"ALTER TABLE tasks DROP COLUMN IF EXISTS {col}")

    # clients: drop old extra columns
    for col in ["annual_revenue", "client_code", "company_size", "tax_id"]:
        op.execute(f"ALTER TABLE clients DROP COLUMN IF EXISTS {col}")

    # leads: add missing 'notes' column
    op.execute("ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT")
    # leads: drop extra columns
    for col in ["client_id", "lead_code", "whatsapp"]:
        op.execute(f"ALTER TABLE leads DROP COLUMN IF EXISTS {col}")

    # campaigns: drop extra columns
    for col in ["campaign_code"]:
        op.execute(f"ALTER TABLE campaigns DROP COLUMN IF EXISTS {col}")

    # ── 3. Recreate all dropped tables with correct DDL ────────────────
    # Order: parents before children (reverse of drop order)
    _create_order = [
        # Parent tables first
        "permissions",
        "role_permissions",
        "password_reset_tokens",
        "user_sessions",
        "user_profiles",
        "activity_logs",
        "lead_sources",
        "notifications",
        "reports",
        "sales_pipeline",
        "seo_projects",
        "seo_keywords",
        "influencers",
        "influencer_campaigns",
        "ad_campaigns",
        "ad_metrics",
        "creative_projects",
        "creative_assets",
        "invoices",
        "invoice_items",
        "payments",
        "expenses",
        "faqs",
        "case_studies",
        "client_addresses",
        "client_contacts",
        "client_documents",
        "client_notes",
        "lead_activities",
        "lead_followups",
        "social_posts",
        "task_attachments",
        "task_comments",
        "job_applications",
        "testimonials",
        "website_pages",
    ]

    # Also recreate case_study_metrics since we dropped it
    _CREATE_DDLS["case_study_metrics"] = """
CREATE TABLE case_study_metrics (
    id UUID NOT NULL,
    case_study_id UUID NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    CONSTRAINT pk_case_study_metrics PRIMARY KEY (id),
    CONSTRAINT fk_case_study_metrics_case_study_id_case_studies FOREIGN KEY(case_study_id) REFERENCES case_studies (id) ON DELETE CASCADE
)"""

    _create_order.append("case_study_metrics")

    for table in _create_order:
        ddl = _CREATE_DDLS[table]
        op.execute(ddl)

    # ── 4. Stamp alembic_version ───────────────────────────────────────
    # Ensure the alembic_version table exists and has our revision
    op.execute("""
        CREATE TABLE IF NOT EXISTS alembic_version (
            version_num VARCHAR(32) NOT NULL,
            CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
        )
    """)
    op.execute("DELETE FROM alembic_version")
    op.execute(f"INSERT INTO alembic_version (version_num) VALUES ('{revision}')")


def downgrade() -> None:
    # Downgrade is not supported — this is a one-way schema sync.
    pass
