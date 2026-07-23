"""Smoke test with correct URLs."""
import asyncio, os
os.environ["DB_SSL_MODE"] = "disable"

from httpx import AsyncClient, ASGITransport
from app.main import app

transport = ASGITransport(app=app)

async def test():
    async with AsyncClient(transport=transport, base_url="http://testserver", timeout=30) as client:
        tests = [
            ("GET", "/"),
            ("GET", "/health"),
            ("GET", "/health/database"),
            ("GET", "/api/v1/docs"),
            ("POST", "/api/v1/auth/login", {}),
            ("POST", "/api/v1/auth/register", {}),
            ("GET", "/api/v1/clients"),
            ("POST", "/api/v1/clients", {}),
            ("GET", "/api/v1/leads/leads"),
            ("GET", "/api/v1/campaigns/campaigns"),
            ("GET", "/api/v1/tasks/tasks"),
            ("GET", "/api/v1/seo/projects"),
            ("GET", "/api/v1/social/profiles"),
            ("GET", "/api/v1/creative/projects"),
            ("GET", "/api/v1/influencers/influencers"),
            ("GET", "/api/v1/websites/projects"),
            ("GET", "/api/v1/case-studies"),
            ("GET", "/api/v1/portfolio"),
            ("GET", "/api/v1/testimonials"),
            ("GET", "/api/v1/faqs"),
            ("GET", "/api/v1/careers"),
            ("GET", "/api/v1/contact-submissions"),
            ("GET", "/api/v1/consultation-requests"),
            ("GET", "/api/v1/content-calendar"),
            ("GET", "/api/v1/automation"),
            ("GET", "/api/v1/approvals"),
            ("GET", "/api/v1/activity-logs"),
            ("GET", "/api/v1/files"),
            ("GET", "/api/v1/companies"),
            ("GET", "/api/v1/timesheets"),
            ("GET", "/api/v1/users/users"),
            ("GET", "/api/v1/notifications"),
            ("GET", "/api/v1/analytics/dashboard"),
            ("GET", "/api/v1/finance/invoices"),
            ("GET", "/api/v1/settings/system-settings"),
        ]
        
        ok = 0
        auth = 0
        fail = 0
        err = 0
        for method, path, *body in tests:
            body = body[0] if body else None
            try:
                if method == "GET":
                    r = await client.get(path, headers={"Authorization": "Bearer fake"})
                else:
                    r = await client.post(path, json=body, headers={"Authorization": "Bearer fake"})
                s = r.status_code
                if s in (200, 201):
                    tag = "OK "
                    ok += 1
                elif s in (401, 403):
                    tag = "AUTH"
                    auth += 1
                elif s == 422:
                    tag = "422"
                    auth += 1
                elif s in (404,):
                    tag = "404 "
                    fail += 1
                elif s >= 500:
                    tag = "5XX"
                    err += 1
                    print(f"  [{tag}] {method} {path} -> {s}: {r.text[:200]}")
                else:
                    tag = str(s)
                    fail += 1
                print(f"  [{tag}] {method} {path} -> {s}")
            except Exception as e:
                print(f"  [ERR] {method} {path} -> {type(e).__name__}")
                err += 1

        print(f"\n=== SUMMARY: {ok} OK, {auth} AUTH, {fail} FAIL, {err} ERR ===")

asyncio.run(test())
