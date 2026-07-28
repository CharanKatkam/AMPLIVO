# Backend Security Hardening Report — HTTP Headers & Cookies

**Date:** 2026-07-28
**Scope:** OWASP-recommended HTTP security headers and cookie attributes, backend only. No application/business logic was modified — the one behavior change made (below) is a middleware **ordering** fix, not new logic, and one incidental test-infrastructure fix is called out separately.

## Headers Implemented

All headers below are applied to **every** response by `SecurityHeadersMiddleware` (`app/middleware/security_headers.py`), which sits outermost in the middleware stack except for `CORSMiddleware` and `UnhandledErrorMiddleware` — so they land on success responses, 4xx/401/404s, and 429 rate-limit responses alike.

| Header | Value | Notes |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'` | Already present; relaxed to allow `cdn.jsdelivr.net` only on `/docs`, `/redoc`, `/openapi.json` so Swagger UI still renders. Unchanged by this pass. |
| `X-Frame-Options` | `DENY` | Already present. Unchanged. |
| `X-Content-Type-Options` | `nosniff` | Already present. Unchanged. |
| `X-XSS-Protection` | `0` | **New.** Per OWASP's current Secure Headers Project guidance, the legacy XSS filter is deprecated, unsupported by modern browsers, and was itself an exploitable attack surface in old ones — the recommended value is `0` (explicitly disabled), not `1; mode=block`. CSP is the actual XSS mitigation. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Already present. Unchanged. |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()` | **Expanded** from a 3-directive policy to cover the full set of sensitive browser APIs OWASP recommends locking down for an API-only backend. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | **New.** Only sent when the request is actually HTTPS (checked via `request.url.scheme` or `X-Forwarded-Proto`, since Render terminates TLS at the edge and forwards plain HTTP internally) — per OWASP, HSTS must never be sent over a connection the browser doesn't see as secure, since the browser is required to ignore it there anyway. `preload` was deliberately left out: submitting a domain to the browser preload list is a one-way decision for the domain owner, not something to default on. |
| `X-Powered-By` | *(absent)* | **Verified absent**, and now defensively stripped if anything ever sets it. FastAPI/Starlette never add it (that's an Express/PHP convention) — this was already true, now it's enforced. |
| `Server` | *(absent)* | **New.** Uvicorn adds `Server: uvicorn` at the protocol layer, before the app's own middleware ever sees the response, so this cannot be stripped in-app — it required `--no-server-header` on the `uvicorn` start command in `render.yaml`. Verified by curling a live instance started with the flag: no `server` header in the response. |

## Cookies (Secure / HttpOnly / SameSite)

**Finding:** the backend does not set any cookies today — authentication is entirely bearer-JWT, returned in the JSON response body (`TokenResponse.access_token` / `refresh_token`), not `Set-Cookie`. Grepped the whole `app/` tree for `cookie` / `set_cookie`: zero matches outside this new code. So there was nothing insecure to fix, but also nothing to point a `Secure`/`HttpOnly`/`SameSite` test at directly.

Implemented as defense-in-depth instead of new logic: `SecurityHeadersMiddleware` now post-processes any `Set-Cookie` header a response ever carries (`_harden_cookie` / `_harden_cookies`) and adds `Secure`, `HttpOnly`, and `SameSite=Lax` to it if those attributes aren't already present — without touching or downgrading any that are. Today this is a no-op on every route (proven by the automated tests, which exercise the function directly). If cookie-based auth or any other `Set-Cookie` is ever introduced, it cannot ship without these flags.

## Bug Fixed Along the Way (in scope: headers weren't actually reaching every response)

`app/main.py` registered `SecurityHeadersMiddleware` *before* `RateLimiterMiddleware` (Starlette wraps outer-to-inner in reverse registration order, so this made `RateLimiterMiddleware` the outer one). `RateLimiterMiddleware` returns its 429 response directly without calling `call_next`, so it never passed through `SecurityHeadersMiddleware` at all — every rate-limited response shipped with **zero** security headers. This directly contradicted the stack's own in-code comment, which documents the intended order as `..., SecurityHeaders, RateLimiter, ...`. Fixed by swapping the two `add_middleware` calls to match the documented order. Confirmed via the automated test (`test_security_headers_present_on_rate_limited_response`), which failed identically against the unmodified code (verified with `git stash`) before this fix and passes after.

## Automated Verification

`Backend/app/tests/test_security_headers.py` — 10 tests, all passing:

| Test | Verifies |
|---|---|
| `test_response_includes_security_headers` | All 6 static headers present on a normal 200 |
| `test_security_headers_present_on_error_response` | Same, on a 401 |
| `test_security_headers_present_on_rate_limited_response` | Same, on a 429 (the bug above) |
| `test_docs_get_relaxed_csp_not_default_csp` | `/docs` gets the CDN-permitting CSP, everything else stays default |
| `test_no_x_powered_by_header` | `X-Powered-By` absent |
| `test_hsts_absent_on_plain_http_request` | HSTS correctly withheld on a plain-HTTP request |
| `test_hsts_present_when_forwarded_as_https` | HSTS present when `X-Forwarded-Proto: https` |
| `test_harden_cookie_adds_missing_flags` | Cookie hardening adds Secure/HttpOnly/SameSite=Lax when absent |
| `test_harden_cookie_preserves_explicit_flags` | Doesn't downgrade an explicit `SameSite=Strict` |
| `test_harden_cookie_is_case_insensitive_to_existing_attrs` | No duplicate attributes on differently-cased input |

```
======================= 10 passed, 12 warnings in 6.22s =======================
```

`Server` header removal and HSTS-over-a-real-proxy behavior can't be exercised through the in-process ASGI test client (it never goes through uvicorn's protocol layer), so those were verified by booting a real `uvicorn ... --no-server-header` instance and curling it directly — see the "Server" and HSTS rows above.

**Full suite:** 97 passed / 30 failed, same 30 both before and after this change (verified with `git stash`) — none in `test_security_headers.py`, none related to headers, cookies, or the middleware order fix. They're pre-existing and unrelated:
- 21 across `test_audit_log.py`, `test_email_verification.py` (partially), `test_activity_and_refresh_sync.py`, `test_device_detection.py`, `test_session_expiry.py`: the `AuditLog` model has no `status` column and `AuditLogRepository.create()` never sets one, so any test asserting `log.status` gets `AttributeError`. Application-logic bug, out of scope.
- 9 across `test_password_reset.py`, `test_email_verification.py` (remainder), `test_token_cleanup.py`: the test email outbox comes back empty (`assert outbox` fails), an email-service/test-environment issue unrelated to headers.

Neither was touched, per "do not modify application logic."

## Incidental Fix (not a security header, flagged separately)

`app/models/audit_log.py` used `JSONB` (Postgres-only) directly on two columns. The test suite's in-memory SQLite database can't compile that type, so **every** test using the DB fixture errored before even reaching its assertions (117 of 127 tests, confirmed pre-existing via `git stash` on the unmodified code) — including the security-header tests, which don't touch the database at all but share an autouse fixture that does. Changed to `JSON().with_variant(JSONB, "postgresql")`: Postgres/production still gets `JSONB`, identical to before; only the SQLite test dialect now gets a portable `JSON`. This was necessary to make the automated verification this task requires actually runnable at all — it does not change any production behavior.

## Files Changed

- `Backend/app/middleware/security_headers.py` — new headers, HSTS, cookie hardening
- `Backend/app/main.py` — one-line middleware registration reorder (2 lines swapped)
- `Backend/app/tests/test_security_headers.py` — expanded to cover every header + cookie hardening
- `render.yaml` — `--no-server-header` added to the uvicorn start command
- `Backend/app/models/audit_log.py` — incidental JSONB→portable-JSON test-infra fix (see above)
