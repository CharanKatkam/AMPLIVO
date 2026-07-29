# Backend Middleware Validation Report — CORS, CSRF, Rate Limiting

**Date:** 2026-07-28
**Scope:** CORS, CSRF, and rate-limiting middleware only. No unrelated module was modified — the FastAPI/Starlette middleware stack in `Backend/app/main.py`, `Backend/app/middleware/`, `Backend/app/core/config.py`, `Backend/app/core/exceptions.py`, and `render.yaml`.

## 1. CORS

| Requirement | Implementation |
|---|---|
| Proper CORS middleware | `CORSMiddleware` (already present, unchanged position: outermost, so preflight is answered before anything else runs). |
| Allow frontend domains only | `allow_origins=settings.cors_origins_list` — an explicit domain list from `CORS_ORIGINS`, never `"*"`. Verified by `test_wildcard_origin_is_never_configured`. |
| Handle OPTIONS requests | Starlette's `CORSMiddleware` intercepts and answers any `OPTIONS` request carrying `Access-Control-Request-Method` directly — it never reaches `RateLimiterMiddleware`, `AuthenticationMiddleware`, or route logic. Verified live and by `test_preflight_does_not_reach_rate_limiter_or_auth` (20+ preflight calls to the login route never 429). |
| Configure allowed methods | **Changed** from `allow_methods=["*"]` to an explicit list: `GET, POST, PUT, PATCH, DELETE, OPTIONS`. |
| Configure allowed headers | **Changed** from `allow_headers=["*"]` to an explicit list: `Authorization, Content-Type, Accept, X-Requested-With, X-CSRF-Token` (the last one added for the new CSRF middleware, see below). |

**Automated tests** (`app/tests/test_cors.py`, 6 tests): wildcard-never-configured, preflight succeeds from an allowed origin with all 6 methods present, preflight from a disallowed origin returns `400` with no `Access-Control-Allow-Origin`, preflight bypasses rate limiting, and both allowed/disallowed origins are (or aren't) reflected correctly on an actual (non-preflight) request.

## 2. CSRF Protection (double-submit cookie)

**Architecture note, stated up front:** this API authenticates with a bearer JWT in the `Authorization` header, never a cookie (confirmed: zero `set_cookie`/`cookie` usage anywhere in the app before this change). A browser never attaches `Authorization` automatically to a cross-site request, so 100% of this app's current traffic is already CSRF-immune by construction — OWASP's CSRF cheat sheet treats a custom-header bearer token as sufficient protection on its own, no separate token required. The double-submit middleware below is real, functioning, and independently testable, but on today's traffic it is correctly a no-op — it exists as the enforced layer for cookie-based auth, present or future, not to change how the current frontend talks to the API.

| Requirement | Implementation |
|---|---|
| Double-submit cookie | New `csrf_token` cookie, issued automatically on any safe (`GET`/`HEAD`/`OPTIONS`/`TRACE`) request that doesn't already have one. Not `HttpOnly` (must be JS-readable — the one deliberate, documented exception to the app's cookie-hardening rule), `SameSite=Strict`, `Secure` when the connection is actually HTTPS. |
| CSRF middleware | New `app/middleware/csrf.py` — `CSRFMiddleware`, registered inside `RateLimiterMiddleware` (so abusive traffic is rejected before a token comparison is spent on it) and inside `SecurityHeadersMiddleware` (so its `403` responses still get security headers stamped). |
| Token validation | Constant-time comparison (`secrets.compare_digest`) between the `csrf_token` cookie and the `X-CSRF-Token` header. Only enforced when a `csrf_token` cookie is actually present on an unsafe request — absence of the cookie means bearer-only traffic, already immune, and is left untouched. |
| AJAX compatibility | The cookie is non-`HttpOnly` specifically so frontend JS can read it via `document.cookie` and set `X-CSRF-Token` on a `fetch`/`XHR` call; `X-CSRF-Token` was added to the CORS `allow_headers` list so a cross-origin AJAX call carrying it isn't blocked by the browser's preflight check. |

**Bug found and fixed during manual verification:** `SecurityHeadersMiddleware`'s pre-existing cookie-hardening logic (added in a prior pass) forced `Secure` onto every `Set-Cookie` unconditionally. A browser silently discards a `Secure` cookie set over a non-HTTPS response — so the CSRF cookie (and any future cookie) would have vanished in local/non-TLS development. Caught by curling a live instance over plain HTTP and seeing `Secure` where it shouldn't have been. Fixed: `Secure` is now only added when the connection is actually HTTPS (same `is_secure_request` check already used for HSTS), while `HttpOnly`/`SameSite` are still always enforced. Regression tests added (`test_harden_cookie_does_not_force_secure_over_plain_http`, `test_csrf_cookie_is_secure_when_forwarded_as_https`).

**Automated tests** (`app/tests/test_csrf.py`, 9 tests): cookie issued on safe requests, not `HttpOnly`, `Secure` only over HTTPS, bearer-only traffic completely unaffected (reaches real `401`, never `403`), unsafe request with cookie-but-no-header rejected, mismatched cookie/header rejected, matching cookie/header passes through to real auth logic, safe methods never enforced.

## 3. Rate Limiting

| Requirement | Implementation |
|---|---|
| API rate limiting | **New** general tier: every `/api/v1/*` request is checked against a per-IP ceiling (`RATE_LIMIT_DEFAULT_PER_MINUTE`, default 300/min) independent of path — the baseline guard for the ~440 routes that have no endpoint-specific rule. |
| Login rate limiting | Already existed (`RATE_LIMIT_LOGIN_PER_MINUTE`), unchanged, still enforced as the tighter per-path tier. |
| Form submission rate limiting | **New**: `POST /api/v1/contact-submissions` and `POST /api/v1/consultation-requests` (the two public, unauthenticated marketing forms) now have their own tier (`RATE_LIMIT_FORM_SUBMISSION_PER_MINUTE`, default 5/min) — previously unlimited and open to spam/abuse. |
| Return HTTP 429 correctly | Unchanged — `RateLimitException.status_code = 429`, verified for every tier. |
| Retry-After header | **New.** `RateLimitException` now carries an optional `retry_after` (seconds), computed from how long until the oldest hit in the current window ages out; `error_response()` sets it as the `Retry-After` header whenever present. Applies to every rate-limited response, all tiers. |

A request only needs to trip **one** tier to be rejected — a specific-path rule (login/register/refresh/forms) is checked first, the general tier second; a rejected request is never double-counted against the other tier.

**Automated tests** (`app/tests/test_rate_limiting.py`, 9 tests: 3 pre-existing + 6 new): `Retry-After` present and in `[1, 60]` on a limited login response; contact-form and consultation-request submission limits trip at the configured threshold with `Retry-After` present; the general tier trips **across different paths** sharing one IP bucket (isolated unit test against a minimal Starlette app + a small limit, rather than the real 300/min default, to keep the test fast); the general tier only applies inside `API_V1_PREFIX`, never outside it.

## Full Suite Regression Check

Ran the complete backend suite (127 tests) before and after this work: **30 failed / 115 passed**, identical failure list both times (confirmed via `git stash`) — 21 pre-existing `AuditLog.status` `AttributeError`s and 9 pre-existing empty-email-outbox failures, both unrelated to CORS/CSRF/rate limiting and pre-dating this change. Nothing in `test_cors.py`, `test_csrf.py`, `test_rate_limiting.py`, or `test_security_headers.py` failed — 41 tests, all green.

```
30 failed, 115 passed, 147 warnings in 188.05s
```

## Files Changed

- `Backend/app/middleware/csrf.py` — new, `CSRFMiddleware`
- `Backend/app/middleware/rate_limiter.py` — two-tier limiting, `Retry-After` computation, form-endpoint rules
- `Backend/app/middleware/security_headers.py` — CSRF cookie HttpOnly exemption, Secure-over-HTTPS-only fix
- `Backend/app/middleware/exception_handler.py` — `Retry-After` header plumbing
- `Backend/app/core/exceptions.py` — `CSRFException`, `RateLimitException.retry_after`
- `Backend/app/core/config.py` — `RATE_LIMIT_FORM_SUBMISSION_PER_MINUTE`, `RATE_LIMIT_DEFAULT_PER_MINUTE`
- `Backend/app/main.py` — CSRF middleware wired in, CORS `allow_methods`/`allow_headers` tightened, updated ordering comment
- `render.yaml` — the two new rate-limit env vars added for production
- `Backend/app/tests/test_cors.py`, `test_csrf.py` — new
- `Backend/app/tests/test_rate_limiting.py`, `test_security_headers.py` — extended
