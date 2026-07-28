"""Custom Pydantic field types for consistent validation across all modules.

Usage::

    from app.core.field_types import PhoneNumber, HttpUrlStr, SlugStr

    class MyModel(BaseModel):
        phone: PhoneNumber | None = None
        website: HttpUrlStr | None = None
        slug: SlugStr
"""

from __future__ import annotations

import re
from typing import Annotated

from pydantic import AfterValidator, StringConstraints

from app.core.validators import validate_phone, validate_slug, validate_url


# ── Phone number ─────────────────────────────────────────────────────
PhoneNumber = Annotated[
    str | None,
    AfterValidator(validate_phone),
]

# ── URL ──────────────────────────────────────────────────────────────
HttpUrlStr = Annotated[
    str | None,
    AfterValidator(validate_url),
]

# ── Slug ──────────────────────────────────────────────────────────────
SlugStr = Annotated[
    str,
    AfterValidator(validate_slug),
]

# ── Descriptive name (human-readable, no HTML) ───────────────────────
NameStr = Annotated[
    str,
    StringConstraints(min_length=1, max_length=200, strip_whitespace=True),
]

# ── Short code / abbreviation ────────────────────────────────────────
CodeStr = Annotated[
    str,
    StringConstraints(min_length=1, max_length=20, strip_whitespace=True, to_upper=True),
]

# ── Non-empty text block (allows newlines, max 10k chars) ────────────
TextBlock = Annotated[
    str,
    StringConstraints(min_length=1, max_length=10_000),
]
