"""Add missing auth columns to Supabase DB using individual statements."""
import asyncio
import os
os.environ["DB_SSL_MODE"] = "disable"

from app.db.session import engine
from sqlalchemy import text

# Each statement is independent and uses IF NOT EXISTS where possible
STATEMENTS = [
    # === USERS TABLE ===
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255) NOT NULL DEFAULT ''",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'internal'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE RESTRICT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS reporting_manager_id UUID REFERENCES users(id) ON DELETE SET NULL",
    # Fill username from email
    "UPDATE users SET username = email WHERE username IS NULL",
    # Fill full_name from first_name/last_name
    "UPDATE users SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL OR full_name = ''",
    # Indexes
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username)",
    "CREATE INDEX IF NOT EXISTS ix_users_role_id ON users (role_id)",
    "CREATE INDEX IF NOT EXISTS ix_users_department_id ON users (department_id)",
    "CREATE INDEX IF NOT EXISTS ix_users_branch_id ON users (branch_id)",
    "CREATE INDEX IF NOT EXISTS ix_users_reporting_manager_id ON users (reporting_manager_id)",
    "CREATE INDEX IF NOT EXISTS ix_users_is_deleted ON users (is_deleted)",
    
    # === ROLES TABLE ===
    "ALTER TABLE roles ADD COLUMN IF NOT EXISTS slug TEXT",
    "ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false",
    "UPDATE roles SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_roles_slug ON roles (slug)",
    
    # === PERMISSIONS TABLE ===
    "ALTER TABLE permissions ADD COLUMN IF NOT EXISTS module TEXT",
    "ALTER TABLE permissions ADD COLUMN IF NOT EXISTS slug TEXT",
    "UPDATE permissions SET module = COALESCE(module_name, 'unknown') WHERE module IS NULL",
    "UPDATE permissions SET slug = LOWER(COALESCE(code, module || '-' || name)) WHERE slug IS NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_permissions_slug ON permissions (slug)",
    
    # === ROLE_PERMISSIONS TABLE ===
    "ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ DEFAULT NOW()",
    
    # === BRANCHES TABLE ===
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS name TEXT",
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS code TEXT",
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS address TEXT",
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_sales_office BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata'",
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true",
    "ALTER TABLE branches ADD COLUMN IF NOT EXISTS branch_manager_id UUID REFERENCES users(id) ON DELETE SET NULL",
    "UPDATE branches SET name = branch_name WHERE name IS NULL",
    "UPDATE branches SET code = branch_code WHERE code IS NULL",
    "UPDATE branches SET is_headquarters = is_head_office WHERE is_head_office IS NOT NULL AND is_headquarters = false",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_branches_code ON branches (code)",
    
    # === DEPARTMENTS TABLE ===
    "ALTER TABLE departments ADD COLUMN IF NOT EXISTS slug TEXT",
    "ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_user_id UUID REFERENCES users(id) ON DELETE SET NULL",
    "UPDATE departments SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_departments_slug ON departments (slug)",
    
    # === TEAMS TABLE ===
    "ALTER TABLE teams ADD COLUMN IF NOT EXISTS name TEXT",
    "ALTER TABLE teams ADD COLUMN IF NOT EXISTS code TEXT",
    "ALTER TABLE teams ADD COLUMN IF NOT EXISTS slug TEXT",
    "ALTER TABLE teams ADD COLUMN IF NOT EXISTS lead_user_id UUID REFERENCES users(id) ON DELETE SET NULL",
    "UPDATE teams SET name = team_name WHERE name IS NULL",
    "UPDATE teams SET code = team_code WHERE code IS NULL",
    "UPDATE teams SET slug = LOWER(REPLACE(COALESCE(team_name, 'team'), ' ', '-')) WHERE slug IS NULL",
    
    # === DESIGNATIONS TABLE ===
    "ALTER TABLE designations ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true",
    
    # === LEADS TABLE ===
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS title TEXT",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20)",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS industry VARCHAR(100)",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close_date DATE",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_client BOOLEAN DEFAULT false",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_client_id UUID REFERENCES clients(id) ON DELETE SET NULL",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS status VARCHAR(50)",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium'",
    "UPDATE leads SET title = COALESCE(contact_name, company_name, 'Untitled Lead') WHERE title IS NULL",
    "UPDATE leads SET status = 'new' WHERE status IS NULL",
    
    # === CAMPAIGNS TABLE ===
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS name TEXT",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS type TEXT",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS objective TEXT",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS spent_amount NUMERIC NOT NULL DEFAULT 0",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_audience TEXT",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS description TEXT",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id) ON DELETE SET NULL",
    "UPDATE campaigns SET name = campaign_name WHERE name IS NULL",
    "UPDATE campaigns SET type = campaign_type WHERE type IS NULL",
    
    # === TASKS TABLE ===
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id UUID",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_code VARCHAR(50)",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50)",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours NUMERIC",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ",
    
    # === CLIENTS TABLE ===
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_code VARCHAR(50)",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS display_name TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20)",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT DEFAULT 'regular'",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT",
    "ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true",
    
    # === INVOICES TABLE ===
    "ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL",
    "ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT",
    
    # === SETTINGS TABLE ===
    "ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL",
    
    # === PASSWORD RESET TOKENS TABLE ===
    """CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
    )""",
]

async def run_migration():
    success = 0
    warn = 0
    async with engine.begin() as conn:
        for stmt in STATEMENTS:
            stmt = stmt.strip()
            if not stmt:
                continue
            try:
                await conn.execute(text(stmt))
                success += 1
            except Exception as e:
                warn += 1
                first_line = stmt.split('\n')[0][:100]
                print(f"  SKIP: {first_line} -> {e}")

    print(f"\nDone: {success} applied, {warn} skipped (already exist or not applicable)")

asyncio.run(run_migration())
