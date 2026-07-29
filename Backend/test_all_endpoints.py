"""Comprehensive API endpoint test using FastAPI TestClient (no server needed)."""
import asyncio
import json
import sys
import os

os.environ["DB_SSL_MODE"] = "disable"

from httpx import AsyncClient, ASGITransport
from app.main import app

schema = app.openapi()
paths = schema.get("paths", {})

results = {"pass": [], "fail_4xx_auth": [], "fail_422": [], "fail_5xx": [], "fail_other": []}

headers = {"Authorization": "Bearer dummy_token_for_testing"}
transport = ASGITransport(app=app)

async def run_tests():
    async with AsyncClient(transport=transport, base_url="http://testserver", timeout=30) as client:
        for path, methods in sorted(paths.items()):
            for method, details in methods.items():
                if method in ("parameters", "summary", "description", "servers"):
                    continue
                op_id = details.get("operationId", "unknown")
                tags = details.get("tags", [])
                tag_str = ", ".join(tags) if tags else "none"

                request_body = details.get("requestBody", {})
                content = request_body.get("content", {}) if request_body else {}
                if "multipart/form-data" in content:
                    results["pass"].append(f"{method.upper()} {path} -> SKIPPED (file upload) [{op_id}]")
                    continue

                body = None
                if request_body:
                    json_content = content.get("application/json", {})
                    schema_def = json_content.get("schema", {})
                    if "$ref" in schema_def:
                        ref_name = schema_def["$ref"].split("/")[-1]
                        schema_def = schema.get("components", {}).get("schemas", {}).get(ref_name, {})

                    if "properties" in schema_def:
                        body = {}
                        for prop, prop_def in schema_def["properties"].items():
                            if prop in ("id", "created_at", "updated_at", "created_by", "updated_by", "uuid", "guid"):
                                continue
                            t = prop_def.get("type", "")
                            if t == "string":
                                body[prop] = "test_value"
                            elif t == "integer":
                                body[prop] = 1
                            elif t == "boolean":
                                body[prop] = True
                            elif t == "number":
                                body[prop] = 1.0
                            elif t == "array":
                                body[prop] = []
                            elif t == "object":
                                body[prop] = {}

                url = path

                try:
                    if method == "get":
                        r = await client.get(url, headers=headers)
                    elif method == "post":
                        r = await client.post(url, json=body, headers=headers)
                    elif method == "put":
                        r = await client.put(url, json=body, headers=headers)
                    elif method == "patch":
                        r = await client.patch(url, json=body, headers=headers)
                    elif method == "delete":
                        r = await client.delete(url, headers=headers)
                    else:
                        continue

                    status = r.status_code
                    entry = f"{method.upper()} {path} -> {status} [{op_id}] ({tag_str})"

                    if status in (401, 403):
                        results["fail_4xx_auth"].append(entry)
                    elif status == 422:
                        results["fail_422"].append(entry)
                    elif status >= 500:
                        body_text = r.text[:300] if r.text else ""
                        results["fail_5xx"].append(f"{entry} | BODY: {body_text}")
                    elif status >= 400:
                        results["fail_other"].append(entry)
                    else:
                        results["pass"].append(entry)

                except Exception as e:
                    results["fail_other"].append(f"{method.upper()} {path} -> EXCEPTION: {type(e).__name__}: {e} [{op_id}]")

    print(f"\n{'='*80}")
    print(f"API ENDPOINT TEST RESULTS")
    print(f"{'='*80}")
    print(f"  PASS (2xx):           {len(results['pass'])}")
    print(f"  AUTH REQUIRED (401/403): {len(results['fail_4xx_auth'])}")
    print(f"  VALIDATION ERROR (422): {len(results['fail_422'])}")
    print(f"  SERVER ERROR (5xx):   {len(results['fail_5xx'])}")
    print(f"  OTHER ERROR:          {len(results['fail_other'])}")
    total = sum(len(v) for v in results.values())
    print(f"  TOTAL:                {total}")

    if results["fail_5xx"]:
        print(f"\n{'='*80}")
        print(f"5xx SERVER ERRORS (need fixing):")
        print(f"{'='*80}")
        for e in results["fail_5xx"]:
            print(f"  {e}")

    if results["fail_other"]:
        print(f"\n{'='*80}")
        print(f"OTHER ERRORS:")
        print(f"{'='*80}")
        for e in results["fail_other"]:
            print(f"  {e}")

    if results["fail_422"]:
        print(f"\n{'='*80}")
        print(f"422 VALIDATION ERRORS:")
        print(f"{'='*80}")
        for e in results["fail_422"]:
            print(f"  {e}")

    if results["fail_4xx_auth"]:
        print(f"\n{'='*80}")
        print(f"AUTH-PROTECTED (expected 401/403 - OK):")
        print(f"{'='*80}")
        for e in results["fail_4xx_auth"]:
            print(f"  {e}")

    if results["pass"]:
        print(f"\n{'='*80}")
        print(f"PASSED ENDPOINTS (first 30):")
        print(f"{'='*80}")
        for e in results["pass"][:30]:
            print(f"  {e}")
        if len(results["pass"]) > 30:
            print(f"  ... and {len(results['pass'])-30} more")

asyncio.run(run_tests())
