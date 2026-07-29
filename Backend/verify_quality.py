"""Code quality and endpoint verification for Amplivo ERP Backend."""
import sys
import os
import ast
import importlib

sys.path.insert(0, os.getcwd())
os.environ.setdefault("DB_SSL_MODE", "disable")

print("=" * 70)
print("CODE QUALITY & ENDPOINT VERIFICATION")
print("=" * 70)

# 1. Check all Python files compile
print("\n> Checking all Python files for syntax errors...")
print("-" * 50)

import glob as globmod
all_py_files = globmod.glob("app/**/*.py", recursive=True)
syntax_errors = []
import_errors = []

for f in all_py_files:
    try:
        with open(f, "r", encoding="utf-8") as fh:
            source = fh.read()
        ast.parse(source, filename=f)
    except SyntaxError as e:
        syntax_errors.append(f"{f}: {e}")

if syntax_errors:
    print(f"  [FAIL] {len(syntax_errors)} syntax errors found:")
    for err in syntax_errors:
        print(f"         {err}")
else:
    print(f"  [PASS] All {len(all_py_files)} Python files compile without syntax errors")

# 2. Check all module __init__ files exist
print("\n> Checking module structure completeness...")
print("-" * 50)

module_dirs = globmod.glob("app/modules/*/", recursive=True)
required_files = ["__init__.py", "models.py", "schemas.py", "repository.py", "service.py", "dependencies.py", "routes.py"]
incomplete_modules = []

for mod_dir in module_dirs:
    mod_name = os.path.basename(mod_dir.rstrip("/\\"))
    if mod_name == "__pycache__":
        continue
    missing = []
    for req_file in required_files:
        if not os.path.exists(os.path.join(mod_dir, req_file)):
            missing.append(req_file)
    if missing:
        incomplete_modules.append((mod_name, missing))
        print(f"  [WARN] {mod_name}: missing {missing}")
    else:
        pass  # OK

if not incomplete_modules:
    print(f"  [PASS] All {len(module_dirs)} modules have complete file structure")

# 3. Check for Pydantic model_config
print("\n> Checking Pydantic schemas for from_attributes...")
print("-" * 50)

schema_issues = []
for f in all_py_files:
    if "schemas.py" in f:
        try:
            with open(f, "r", encoding="utf-8") as fh:
                content = fh.read()
            if "class " in content and "model_config" not in content and "class Config:" not in content:
                # Find all Read schemas
                for line in content.split("\n"):
                    if "Read(" in line and "BaseModel" in line:
                        schema_issues.append(f)
                        break
        except Exception:
            pass

if schema_issues:
    print(f"  [WARN] {len(schema_issues)} schema files may be missing model_config:")
    for s in schema_issues[:10]:
        print(f"         {s}")
else:
    print(f"  [PASS] Schema files appear correctly configured")

# 4. Check for common issues in all modules
print("\n> Checking for common code issues...")
print("-" * 50)

issues_found = []
for f in all_py_files:
    try:
        with open(f, "r", encoding="utf-8") as fh:
            content = fh.read()
        
        # Check for unused imports (basic check)
        if "from typing import TYPE_CHECKING" in content and "TYPE_CHECKING" not in content.replace("from typing import TYPE_CHECKING", ""):
            issues_found.append(f"{f}: unused TYPE_CHECKING import")
        
        # Check for wildcard imports
        if "from app.modules.*" in content or "from app.core.*" in content:
            issues_found.append(f"{f}: wildcard import detected")
            
    except Exception:
        pass

if issues_found:
    print(f"  [WARN] {len(issues_found)} potential issues:")
    for issue in issues_found[:10]:
        print(f"         {issue}")
else:
    print(f"  [PASS] No common code issues detected")

# 5. Verify all router tags are unique per endpoint
print("\n> Checking route registration...")
print("-" * 50)

from app.main import app
schema = app.openapi()

# Check paths have proper methods
path_issues = []
for path, methods in schema["paths"].items():
    for method, details in methods.items():
        if not isinstance(details, dict):
            continue
        if "operationId" not in details:
            path_issues.append(f"{method.upper()} {path}: missing operationId")
        if "tags" not in details or not details["tags"]:
            path_issues.append(f"{method.upper()} {path}: missing tags")
        if "responses" not in details:
            path_issues.append(f"{method.upper()} {path}: missing responses")

if path_issues:
    print(f"  [WARN] {len(path_issues)} endpoint issues:")
    for issue in path_issues[:20]:
        print(f"         {issue}")
    if len(path_issues) > 20:
        print(f"         ... and {len(path_issues) - 20} more")
else:
    print(f"  [PASS] All {sum(len(m) for m in schema['paths'].values())} endpoints properly configured")

# 6. Check Alembic
print("\n> Checking Alembic migrations...")
print("-" * 50)

import glob as globmod
migration_files = globmod.glob("alembic/versions/*.py")
migration_files = [f for f in migration_files if "__pycache__" not in f and "verify" not in f]
print(f"  [INFO] {len(migration_files)} migration files found:")
for mf in sorted(migration_files):
    print(f"         - {os.path.basename(mf)}")

# Summary
print("\n" + "=" * 70)
print("CODE QUALITY SUMMARY")
print("=" * 70)
print(f"  Python Files: {len(all_py_files)}")
print(f"  Syntax Errors: {len(syntax_errors)}")
print(f"  Module Directories: {len(module_dirs)}")
print(f"  Incomplete Modules: {len(incomplete_modules)}")
print(f"  Schema Issues: {len(schema_issues)}")
print(f"  Code Issues: {len(issues_found)}")
print(f"  Path Issues: {len(path_issues)}")
print(f"  Migration Files: {len(migration_files)}")
print("=" * 70)
