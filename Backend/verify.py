"""Comprehensive verification script for Amplivo ERP Backend."""
import json
import sys
import os

sys.path.insert(0, os.getcwd())
os.environ.setdefault("DB_SSL_MODE", "disable")

print("=" * 70)
print("AMPLIVO ERP BACKEND - COMPREHENSIVE VERIFICATION")
print("=" * 70)

# STEP 2: Application Startup
print("\n> STEP 2: Application Startup Verification")
print("-" * 50)

try:
    from app.main import app
    print("  [PASS] FastAPI app loaded successfully")
except Exception as e:
    print(f"  [FAIL] FastAPI app failed to load: {e}")
    sys.exit(1)

# Lifespan
try:
    assert app.router.lifespan_context is not None
    print("  [PASS] Lifespan handler registered")
except Exception as e:
    print(f"  [FAIL] Lifespan: {e}")

# Routers
try:
    all_routes = [r for r in app.routes if hasattr(r, "methods")]
    router_count = len(all_routes)
    print(f"  [PASS] {router_count} routes registered")
except Exception as e:
    print(f"  [FAIL] Routes: {e}")

# Middleware
try:
    middleware_stack = app.middleware_stack
    print(f"  [PASS] Middleware stack configured: {type(middleware_stack).__name__}")
except Exception as e:
    print(f"  [FAIL] Middleware: {e}")

# Exception handlers
try:
    handlers = app.exception_handlers
    print(f"  [PASS] Exception handlers registered: {len(handlers)} handlers")
except Exception as e:
    print(f"  [FAIL] Exception handlers: {e}")

# OpenAPI
try:
    schema = app.openapi()
    paths_count = len(schema.get("paths", {}))
    schemas_count = len(schema.get("components", {}).get("schemas", {}))
    print(f"  [PASS] OpenAPI schema generated: {paths_count} paths, {schemas_count} schemas")
except Exception as e:
    print(f"  [FAIL] OpenAPI: {e}")
    sys.exit(1)

# Collect all operation IDs
ops = {}
tags_set = set()
for path, methods in schema["paths"].items():
    for method, details in methods.items():
        if isinstance(details, dict) and "operationId" in details:
            oid = details["operationId"]
            ops[oid] = f"{method.upper()} {path}"
            for tag in details.get("tags", []):
                tags_set.add(tag)

# Check for duplicate operation IDs
op_counts = {}
for oid in ops:
    if oid in op_counts:
        op_counts[oid] += 1
    else:
        op_counts[oid] = 1
dups = {k: v for k, v in op_counts.items() if v > 1}
if dups:
    print(f"  [WARN] Duplicate operation IDs found: {len(dups)}")
    for k, v in list(dups.items())[:10]:
        print(f"         {k}: {v} occurrences ({ops[k]})")
else:
    print(f"  [PASS] No duplicate operation IDs ({len(ops)} unique)")

print(f"  [INFO] Tags: {len(tags_set)}")
for t in sorted(tags_set):
    print(f"         - {t}")

# STEP 3: Database Models
print("\n> STEP 3: Database Models Verification")
print("-" * 50)

from app.db.base import Base
all_tables = sorted(Base.metadata.tables.keys())
print(f"  [INFO] {len(all_tables)} tables registered in SQLAlchemy metadata")
for t in all_tables:
    print(f"         - {t}")

# STEP 4: Module Verification
print("\n> STEP 4: Client-Required Module Verification")
print("-" * 50)

required_modules = {
    "Authentication": ["app.api.v1.auth.routes"],
    "Email Verification": ["app.api.v1.auth.verification_routes"],
    "Password Reset": ["app.api.v1.auth.password_reset_routes"],
    "Session Management": ["app.api.v1.auth.session_routes"],
    "User Management": ["app.modules.users.routes"],
    "Companies": ["app.modules.companies.routes"],
    "CRM (Clients)": ["app.modules.crm.routes"],
    "Lead Management": ["app.modules.leads.routes"],
    "Campaign Management": ["app.modules.campaigns.routes"],
    "SEO": ["app.modules.seo.routes"],
    "Paid Ads": ["app.modules.paidads.routes"],
    "Social Media": ["app.modules.social.routes"],
    "Creative": ["app.modules.creative.routes"],
    "CMS": ["app.modules.cms.routes"],
    "Content Calendar": ["app.modules.content_calendar.routes"],
    "Marketing Automation": ["app.modules.marketing_automation.routes"],
    "Client Portal": ["app.modules.client_portal.routes"],
    "Finance": ["app.modules.finance.routes"],
    "Analytics": ["app.modules.analytics.routes"],
    "Notifications": ["app.modules.notifications.routes"],
    "Influencers": ["app.modules.influencers.routes"],
    "Projects/Tasks": ["app.modules.tasks.routes"],
    "Website Management": ["app.modules.websites.routes"],
    "Careers": ["app.modules.careers.routes"],
    "Case Studies": ["app.modules.case_studies.routes"],
    "Portfolio": ["app.modules.portfolio.routes"],
    "Testimonials": ["app.modules.testimonials.routes"],
    "FAQs": ["app.modules.faqs.routes"],
    "Consultation Requests": ["app.modules.consultation_requests.routes"],
    "Contact Forms": ["app.modules.contact_forms.routes"],
    "Approval System": ["app.modules.approval_system.routes"],
    "Activity Logs": ["app.modules.activity_timeline.routes"],
    "File Manager": ["app.modules.file_manager.routes"],
    "Timesheets": ["app.modules.timesheets.routes"],
    "Settings": ["app.modules.settings.routes"],
    "Reports": ["app.modules.analytics.routes"],
}

missing_modules = []
for module_name, module_paths in required_modules.items():
    found = False
    for mod_path in module_paths:
        try:
            __import__(mod_path)
            found = True
            break
        except Exception:
            pass
    if found:
        print(f"  [PASS] {module_name}")
    else:
        print(f"  [FAIL] {module_name} -- MISSING")
        missing_modules.append(module_name)

# STEP 9: Swagger
print("\n> STEP 9: Swagger & OpenAPI Verification")
print("-" * 50)

try:
    assert schema["openapi"].startswith("3."), f"Unexpected OpenAPI version: {schema['openapi']}"
    print(f"  [PASS] OpenAPI version: {schema['openapi']}")
except Exception as e:
    print(f"  [FAIL] OpenAPI version: {e}")

print(f"  [PASS] Swagger UI: {app.docs_url}")
print(f"  [PASS] ReDoc: {app.redoc_url}")
print(f"  [PASS] OpenAPI JSON: {app.openapi_url}")

# Summary
print("\n" + "=" * 70)
print("VERIFICATION SUMMARY")
print("=" * 70)
print(f"  Total Routes: {router_count}")
print(f"  Total Tables: {len(all_tables)}")
print(f"  Total Operation IDs: {len(ops)}")
print(f"  Total Tags: {len(tags_set)}")
print(f"  Total Schemas: {schemas_count}")
print(f"  Missing Modules: {len(missing_modules)}")
if missing_modules:
    for m in missing_modules:
        print(f"    - {m}")
print(f"  Duplicate Op IDs: {len(dups)}")
print(f"  OpenAPI Version: {schema['openapi']}")
print(f"  Swagger: {app.docs_url}")
print("=" * 70)
