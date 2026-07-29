"""Full API endpoint test after fixes."""
import sys
import os

sys.path.insert(0, os.getcwd())
os.environ.setdefault("DB_SSL_MODE", "disable")

from fastapi.testclient import TestClient
from app.main import app

print("=" * 70)
print("FULL API ENDPOINT TEST (POST-FIX)")
print("=" * 70)

client = TestClient(app, raise_server_exceptions=False)

passed = []
failed = []

def test(method, path, body=None, expected_codes=None):
    """Test an endpoint. expected_codes is a set of acceptable status codes."""
    if expected_codes is None:
        expected_codes = {200, 201, 401, 403, 422}
    try:
        if method == "GET":
            r = client.get(path)
        elif method == "POST":
            r = client.post(path, json=body)
        elif method == "PUT":
            r = client.put(path, json=body)
        elif method == "DELETE":
            r = client.delete(path)
        else:
            r = client.request(method, path, json=body)
        
        if r.status_code == 404:
            failed.append(f"{method} {path} -> 404 NOT FOUND")
            print(f"  [FAIL] {method} {path} -> 404 NOT FOUND")
        elif r.status_code in expected_codes:
            passed.append(f"{method} {path} -> {r.status_code}")
            print(f"  [PASS] {method} {path} -> {r.status_code}")
        else:
            failed.append(f"{method} {path} -> {r.status_code} (expected {expected_codes})")
            print(f"  [WARN] {method} {path} -> {r.status_code}")
    except Exception as e:
        failed.append(f"{method} {path} -> ERROR: {e}")
        print(f"  [FAIL] {method} {path} -> ERROR: {e}")

# ── Root & Health ────────────────────────────────────────────────────
print("\n> Root & Health Endpoints")
print("-" * 50)
test("GET", "/", expected_codes={307, 200})
test("GET", "/health")
test("GET", "/health/database", expected_codes={200, 503})
test("GET", "/api/v1/docs")
test("GET", "/api/v1/openapi.json")
test("GET", "/api/v1/redoc")

# ── Auth ─────────────────────────────────────────────────────────────
print("\n> Authentication Endpoints")
print("-" * 50)
test("POST", "/api/v1/auth/register", {"email": "test@test.com", "password": "Test1234!"})
test("POST", "/api/v1/auth/login", {"email": "test@test.com", "password": "Test1234!"})
test("POST", "/api/v1/auth/refresh", {"refresh_token": "fake"})
test("GET", "/api/v1/auth/me")
test("GET", "/api/v1/auth/sessions")
test("POST", "/api/v1/auth/verify-email", {"token": "fake"})

# ── Module GET list endpoints (correct URLs) ─────────────────────────
print("\n> Module Endpoints (GET list)")
print("-" * 50)

# User Management
test("GET", "/api/v1/users")
test("GET", "/api/v1/roles")
test("GET", "/api/v1/branches")
test("GET", "/api/v1/departments")
test("GET", "/api/v1/teams")
test("GET", "/api/v1/designations")

# CRM
test("GET", "/api/v1/clients")

# Leads
test("GET", "/api/v1/leads")
test("GET", "/api/v1/lead-sources")

# Campaigns
test("GET", "/api/v1/campaigns")

# SEO
test("GET", "/api/v1/seo/projects")

# Paid Ads (correct prefix)
test("GET", "/api/v1/paidads/ad-campaigns")

# Social
test("GET", "/api/v1/social/profiles")

# Creative
test("GET", "/api/v1/creative/projects")

# CMS
test("GET", "/api/v1/cms/categories")
test("GET", "/api/v1/cms/items")

# Websites
test("GET", "/api/v1/websites")

# Tasks
test("GET", "/api/v1/projects")

# Finance (correct prefix)
test("GET", "/api/v1/finance/invoices")
test("GET", "/api/v1/finance/expenses")

# Analytics
test("GET", "/api/v1/analytics/dashboards")

# Notifications
test("GET", "/api/v1/notifications/templates")

# Influencers
test("GET", "/api/v1/influencers")

# Client Portal (correct prefix)
test("GET", "/api/v1/portal/settings")

# Settings (correct prefix)
test("GET", "/api/v1/settings/system-settings")

# Companies
test("GET", "/api/v1/companies")

# Case Studies
test("GET", "/api/v1/case-studies")

# Portfolio
test("GET", "/api/v1/portfolio")

# Testimonials
test("GET", "/api/v1/testimonials")

# FAQs
test("GET", "/api/v1/faqs")

# Careers
test("GET", "/api/v1/careers")

# Contact Forms
test("GET", "/api/v1/contact-submissions")

# Consultation Requests
test("GET", "/api/v1/consultation-requests")

# Content Calendar
test("GET", "/api/v1/content-calendar")

# Marketing Automation
test("GET", "/api/v1/automation")

# Approval System
test("GET", "/api/v1/approvals")
test("GET", "/api/v1/approvals/policies")

# Activity Logs
test("GET", "/api/v1/activity-logs")

# File Manager
test("GET", "/api/v1/files")
test("GET", "/api/v1/files/folders")

# Timesheets
test("GET", "/api/v1/timesheets")

# ── POST endpoints (expect 403/422/500, not 404) ─────────────────────
print("\n> POST Endpoints (verify routes exist)")
print("-" * 50)
test("POST", "/api/v1/clients", {"company_name": "Test"})
test("POST", "/api/v1/leads", {"title": "Test"})
test("POST", "/api/v1/projects", {"name": "Test"})
test("POST", "/api/v1/case-studies", {"title": "Test", "slug": "test"})
test("POST", "/api/v1/portfolio", {"title": "Test", "slug": "test"})
test("POST", "/api/v1/testimonials", {"client_name": "Test", "content": "Great"})
test("POST", "/api/v1/faqs", {"question": "Q?", "answer": "A."})
test("POST", "/api/v1/companies", {"name": "Test Co"})
test("POST", "/api/v1/activity-logs", {"entity_type": "user", "action": "created"})
test("POST", "/api/v1/contact-submissions", {"name": "Test", "email": "t@t.com", "message": "Hello"})
test("POST", "/api/v1/consultation-requests", {"name": "Test", "email": "t@t.com"})
test("POST", "/api/v1/files", {"name": "test.txt", "original_name": "test.txt", "url": "http://example.com/test.txt"})
test("POST", "/api/v1/files/folders", {"name": "Test Folder"})

# ── Summary ──────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("API TEST RESULTS")
print("=" * 70)
total = len(passed) + len(failed)
print(f"  Total Tested: {total}")
print(f"  Passed: {len(passed)}")
print(f"  Failed: {len(failed)}")

if failed:
    print(f"\n  FAILED ENDPOINTS:")
    for f in failed:
        print(f"    {f}")

print("=" * 70)
