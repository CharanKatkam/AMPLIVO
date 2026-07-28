# Authentication & Authorization Report

**Date:** 2026-07-28
**Scope:** Authentication and RBAC only, backend. No application logic outside the auth boundary was changed — every edit either adds/tightens a `Depends(...)` guard on an existing route or adds an RBAC role; no business logic, schemas, or response shapes changed.

## 1. Authentication — audited, no defects found

| Requirement | Status | Where |
|---|---|---|
| JWT authentication | ✅ Already correct | `app/utils/jwt.py` — HS256, `sub`/`type`/`iat`/`exp`/`jti` claims, type-checked on decode |
| Refresh tokens | ✅ Already correct | `app/services/auth_service.py` — hashed at rest (SHA-256, never stored plaintext), single-use with rotation-on-refresh, revoked on logout |
| Token expiration | ✅ Already correct | Access: `ACCESS_TOKEN_EXPIRE_MINUTES` (30 min default); refresh: `REFRESH_TOKEN_EXPIRE_DAYS` (7 days); enforced by `jwt.decode`'s `exp` check, mapped to `TokenExpiredException` (401) |
| Password hashing | ✅ Already correct | `app/utils/password.py` — bcrypt via passlib, configurable cost (`BCRYPT_ROUNDS`) |
| Login | ✅ Already correct | Account lockout after `MAX_FAILED_LOGIN_ATTEMPTS`, audit logging, new-device detection |
| Logout | ✅ Already correct | Revokes the refresh token + its session, closes login-history row |
| Token refresh | ✅ Already correct | Rotation: presented refresh token is revoked before the replacement pair is issued, so a replayed old token is rejected |

Nothing in this layer needed a fix. Time was spent verifying it, not rewriting it.

## 2. RBAC — 8 roles

`app/dependencies/rbac.py`:
- `require_roles(*slugs)` — a dependency factory; 403s (`error_code: "forbidden"`) unless the caller's role slug is in the allowlist. `admin`/`super_admin` always pass regardless of the specific allowlist.
- `STAFF_ROLE_SLUGS` — **new**, every internal role except `client`. Added for the several gaps below where a route just needed "any staff, not the external client role," with no single owning department.

### Role reference

| Role slug | Seed status | Notes |
|---|---|---|
| `admin` | seeded, demo user exists | Always passes every `require_roles` check |
| `crm` | seeded, demo user exists | Post-sale account management: approves/verifies finance payments, manages contact-form/consultation-request leads |
| `sales` | seeded, demo user exists | Pre-sale pipeline: leads, meetings, client/company records, advance invoicing |
| `hr` | seeded, demo user exists | Careers/recruitment module, user activate/deactivate |
| `employee` | seeded, demo user exists | Generic internal staff baseline; currently also covers marketing-titled staff (see below) |
| `finance` | seeded, demo user exists | Invoices/payments/expenses core CRUD |
| `marketing` | **seeded this pass, no demo user assigned** | See "Marketing role" below |
| `client` | seeded, demo user exists | Portal user, tenant-scoped to their own company via `get_current_client_id` — never in `STAFF_ROLE_SLUGS` |

### RBAC matrix

`✓` = full access · `own` = own-record-only via tenant scoping · `staff` = any non-client role · blank = not reachable by that role

| Module | Admin | CRM | Sales | HR | Employee | Finance | Marketing | Client |
|---|---|---|---|---|---|---|---|---|
| Leads | ✓ | | ✓ | | | | | |
| CRM (clients/contacts/addresses/docs) | ✓ | | ✓ | | | | | own |
| Meetings | ✓ | | ✓ | | | | | |
| Finance (invoices/payments/expenses core) | ✓ | approve/verify steps | create advance invoice | | | ✓ | | view/pay own |
| Careers (recruitment) | ✓ | | | ✓ | | | | |
| Users — directory read | ✓ | staff | staff | staff | staff | staff | staff | |
| Users — activate/deactivate | ✓ | | | ✓ | | | | |
| Users — roles/permissions/branches/departments/teams/designations write | ✓ | | | | | | | |
| Settings (system) | ✓ | | | | | | | |
| Approval policies | ✓ | | | | | | | |
| Approval requests/decisions | ✓ | staff | staff | staff | staff | staff | staff | |
| Contact-form / consultation-request leads | ✓ | ✓ | ✓ | | | | | submit (public) |
| Case studies / FAQs / Portfolio / Testimonials — publish | ✓ | | | | ✓ | | ✓ | |
| Case studies / FAQs / Portfolio / Testimonials — read | public | public | public | public | public | public | public | public |
| Marketing automation | ✓ | | | | ✓ | | ✓ | |
| Client portal / invoices, proposals, support tickets (own) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | own |
| Tasks, timesheets, notifications, messaging, analytics, CMS, websites, SEO, social, paid ads, influencers, creative, content calendar, file manager, support tickets | ✓ | any authenticated staff role (no per-role restriction; not client-facing) | | | | | | |

The last row is a deliberate design point, not a gap: those modules were already fully authenticated (every route already had `Depends(get_current_user)` — confirmed by direct inspection, not assumed) and have no natural single owning department, so any internal role can use them. They were audited and are not part of the fixes below.

### Marketing role: seeded, deliberately not assigned to a demo user

`frontend/src/services/authService.ts`'s `VALID_ROLES` list is `['admin', 'client', 'sales', 'hr', 'employee', 'crm']` — it does not include `finance` (pre-existing, already true before this pass) or the new `marketing`. Its `mapRole()` silently falls back to `'admin'` for any role name it doesn't recognize. Assigning a demo user to `role_slug="marketing"` would have made them appear as **admin** in the frontend UI — worse than the current state, and a frontend change outside this backend-only pass's scope.

Given that, the marketing-content routes (case studies, FAQs, portfolio, testimonials, marketing automation) are gated with `require_roles("marketing", "employee")`, not `"marketing"` alone — `employee` is kept because the current seed data still puts marketing-titled staff (Performance Marketer, SEO Specialist, etc.) on `role_slug="employee"`, and locking them out via API access to their own job's content would be a real regression for a paper-thin RBAC win. **Recommendation, not done here:** add `finance` and `marketing` to the frontend's `VALID_ROLES`, then move those demo users to `role_slug="marketing"` and narrow the guard back to `require_roles("marketing")` alone.

## 3. Gaps found and fixed

Audited every route in all 35 `app/modules/*/routes.py` + auth routes for missing/insufficient authorization (methodology: exhaustive, not sampled — every `@router.get/post/put/patch/delete`, checked for an auth dependency and, where relevant, a role gate).

### Zero authentication at all (mutating and/or PII-exposing)

| Module | Routes | Fix |
|---|---|---|
| `case_studies`, `faqs`, `portfolio`, `testimonials` | POST/PUT/DELETE (reads stayed public - published site content) | `require_roles("marketing", "employee")` |
| `marketing_automation` | **Entire module** — GET/POST/PUT/DELETE all had zero auth | `require_roles("marketing", "employee")` on every route |
| `consultation_requests`, `contact_forms` | GET/PUT/DELETE (POST stayed public - the site's own lead-gen forms) — exposed submitted leads' PII (name/email/phone/message) to anyone unauthenticated | `require_roles("crm", "sales")` |

### Authenticated but no role gate on sensitive internal data

| Module | Routes | Before | After |
|---|---|---|---|
| `finance` | create/update/delete invoice, invoice items, payments, expenses; list-all-payments | any authenticated role, including `client` | `require_roles("finance")` |
| `finance` | `get_advance_invoice_for_lead` (no tenant scoping - IDOR risk, a client could look up any lead's invoice by id) | any authenticated role | `require_roles(*STAFF_ROLE_SLUGS)` |
| `users` | **`activate_user`/`deactivate_user`** — any authenticated user, any role, could deactivate or reactivate any account including admins | no role check at all | `require_roles("hr")` |
| `users` | directory reads (users, roles, permissions, branches, departments, teams, designations) | any authenticated role, including `client` | `require_roles(*STAFF_ROLE_SLUGS)` |
| `users` | `get_user_profile` — could read any user's profile PII by id; the sibling `PUT` already enforced self-or-admin, the `GET` didn't | no ownership check | mirrors the existing self-or-admin check on `upsert_user_profile` |
| `settings` | system settings reads | any authenticated role | `require_roles("admin")` (matches writes, already admin-only) |
| `approval_system` | **Entire module** — policy CRUD and request/decision workflow | any authenticated role, including `client`, could create/delete approval policies or approve/reject any request | policies: `require_roles("admin")`; requests/decisions: `require_roles(*STAFF_ROLE_SLUGS)` (see caveat below) |

**Caveat on `approval_system`:** there's no concept in this module of "policy X's designated approver role" — `STAFF_ROLE_SLUGS` on the request/decision routes is a baseline (blocks the external `client` role) not a full approval hierarchy. Deciding which specific staff role may approve which specific policy's requests is a business-logic decision for that module's owner, not something to invent at the RBAC layer — flagged here rather than guessed at.

### A bug this pass introduced and then caught: CSRF middleware blocking bearer requests

While verifying the finance/users fixes with automated tests, two pre-existing, previously-passing session tests (`test_logout_specific_session_by_id`, `test_logout_specific_session_not_owned_by_caller_returns_404`) started failing with 403. Root cause: the CSRF double-submit middleware added in a prior pass issues a `csrf_token` cookie on every safe `GET`. A client (real browser or `httpx.AsyncClient`, both persist cookies across requests) that made any prior GET would carry that cookie into its next unsafe request, and the middleware enforced the double-submit check purely on "is a `csrf_token` cookie present" — without checking whether the request was *actually* cookie-authenticated. Since this app's real frontend is bearer-only and was never taught about `X-CSRF-Token`, this would have 403'd every mutating request from any user who'd loaded so much as one page first — a full outage, not a partial gap.

Fixed in `app/middleware/csrf.py`: enforcement is now skipped whenever the request carries an `Authorization: Bearer` header, matching the middleware's own stated rationale (bearer auth is already CSRF-immune) instead of contradicting it. Regression test added: `test_bearer_request_with_stray_csrf_cookie_is_not_blocked`.

## 4. Verification

New test file `app/tests/test_rbac_route_guards.py` (37 tests) plus one new CSRF regression test. Pattern per fixed endpoint: assert 401/403 with no auth, assert 403 with a role that shouldn't have access, assert the correct role/staff-slug passes the gate (not always a full 2xx — for routes needing complex FK setup, "not 403" is sufficient proof the RBAC layer itself let it through).

```
Full suite: 156 passed, 30 failed, 188 warnings in 242.85s
```

The 30 failures are pre-existing and unrelated (confirmed via `git stash` against the unmodified code, same count and same test names both before and after this pass): a missing `status` column on the `AuditLog` model unrelated to auth, and an empty test-email-outbox issue in the email/password-reset test fixtures. Neither touched here, per "fix ONLY authentication and authorization."

## Files Changed

- `app/dependencies/rbac.py` — `STAFF_ROLE_SLUGS`
- `app/modules/case_studies/routes.py`, `faqs/routes.py`, `portfolio/routes.py`, `testimonials/routes.py` — auth added to writes
- `app/modules/marketing_automation/routes.py` — auth added to entire module
- `app/modules/consultation_requests/routes.py`, `contact_forms/routes.py` — auth added to reads/writes
- `app/modules/finance/routes.py` — role gates added to core CRUD + IDOR-risk lookup
- `app/modules/users/routes.py` — role gates on activate/deactivate + directory reads; ownership check added to profile read
- `app/modules/settings/routes.py` — role gate on system-settings reads
- `app/modules/approval_system/routes.py` — role gates added to entire module
- `app/scripts/seed_demo_data.py` — `Marketing` role added
- `app/middleware/csrf.py` — bearer-request exemption (bug fix, see §3)
- `app/tests/test_rbac_route_guards.py` — new, 37 tests
- `app/tests/test_csrf.py` — 1 new regression test
