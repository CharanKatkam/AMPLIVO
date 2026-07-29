"""Quick smoke test for all new module endpoints."""
import asyncio
import os
os.environ["DB_SSL_MODE"] = "disable"

from httpx import AsyncClient, ASGITransport
from app.main import app

transport = ASGITransport(app=app)
headers = {"Authorization": "Bearer dummy_token_for_testing"}

# Test all new module endpoints (GET list only - no DB writes)
ENDPOINTS = [
    "/api/v1/approvals",
    "/api/v1/approvals/policies",
    "/api/v1/automation",
    "/api/v1/careers",
    "/api/v1/companies",
    "/api/v1/consultation-requests",
    "/api/v1/contact-submissions",
    "/api/v1/content-calendar",
    "/api/v1/faqs/categories/list",
    "/api/v1/faqs",
    "/api/v1/files",
    "/api/v1/files/folders",
    "/api/v1/portfolio",
    "/api/v1/testimonials",
    "/api/v1/timesheets",
    "/api/v1/activity-logs",
    "/api/v1/case-studies",
    "/api/v1/analytics/dashboards",
    "/api/v1/analytics/reports",
    "/api/v1/analytics/integrations",
    "/api/v1/settings/system",
    "/api/v1/settings/user/me",
    "/api/v1/social/profiles",
    "/api/v1/social/posts",
    "/api/v1/seo/projects",
    "/api/v1/cms/categories",
    "/api/v1/paid-ads/campaigns",
    "/api/v1/influencers",
    "/api/v1/websites",
    "/api/v1/creative/projects",
    "/api/v1/leads",
    "/api/v1/crm/clients",
    "/api/v1/finance/invoices",
    "/api/v1/finance/expenses",
    "/api/v1/projects",
    "/api/v1/tasks",
    "/api/v1/users/roles",
    "/api/v1/users/branches",
    "/api/v1/users/departments",
    "/api/v1/notifications",
    "/health",
    "/health/database",
    "/api/v1/docs",
]

async def run():
    pass_count = 0
    auth_count = 0
    fail_count = 0
    err_count = 0

    async with AsyncClient(transport=transport, base_url="http://testserver", timeout=10) as client:
        for url in ENDPOINTS:
            try:
                r = await client.get(url, headers=headers)
                status = r.status_code
                if status in (200, 201):
                    pass_count += 1
                    print(f"  OK  {status} {url}")
                elif status in (401, 403):
                    auth_count += 1
                    print(f"  AUTH {status} {url}")
                elif status >= 500:
                    err_count += 1
                    body = r.text[:200] if r.text else ""
                    print(f"  ERR {status} {url} | {body}")
                else:
                    fail_count += 1
                    print(f"  FAIL {status} {url}")
            except Exception as e:
                err_count += 1
                print(f"  ERR {url} | {type(e).__name__}: {e}")

    print(f"\n{'='*60}")
    print(f"  PASS (2xx):     {pass_count}")
    print(f"  AUTH (401/403): {auth_count}")
    print(f"  FAIL (4xx):     {fail_count}")
    print(f"  ERR (5xx/err):  {err_count}")
    print(f"  TOTAL:          {pass_count + auth_count + fail_count + err_count}")
    print(f"{'='*60}")

asyncio.run(run())
