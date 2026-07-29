"""Check actual DB schema for key tables."""
import asyncio
import os
os.environ["DB_SSL_MODE"] = "disable"

from app.db.session import engine
from sqlalchemy import text

TABLES_TO_CHECK = [
    "users", "roles", "user_roles", "permissions", "role_permissions",
    "refresh_tokens", "user_sessions", "audit_logs",
    "clients", "leads", "campaigns", "tasks", "projects",
    "invoices", "settings", "notifications",
    "seo_projects", "seo_keywords", "seo_rankings",
    "social_accounts", "social_posts", "post_analytics",
    "blogs", "blog_categories",
    "creative_projects", "creative_assets",
    "influencers", "influencer_campaigns",
    "websites", "landing_pages", "website_pages",
    "video_projects", "media_library",
    "reports", "analytics",
    "services", "expenses", "payments",
    "teams", "departments", "designations", "branches",
]

async def check():
    async with engine.connect() as conn:
        for table in TABLES_TO_CHECK:
            result = await conn.execute(text(
                f"SELECT column_name, data_type, is_nullable "
                f"FROM information_schema.columns "
                f"WHERE table_name = '{table}' AND table_schema = 'public' "
                f"ORDER BY ordinal_position"
            ))
            rows = result.fetchall()
            if rows:
                print(f"\n=== {table} ({len(rows)} columns) ===")
                for row in rows:
                    nullable = "NULL" if row[2] == "YES" else "NOT NULL"
                    print(f"  {row[0]}: {row[1]} ({nullable})")

asyncio.run(check())
