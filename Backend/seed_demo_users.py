r"""Seed every demo account the frontend login page offers, plus the
roles/branches/departments/profiles they need. Idempotent - safe to re-run.

The actual seeding logic lives in app.scripts.seed_demo_data so it can also
run automatically at backend startup (see app/main.py's lifespan) - this
file is just the manual CLI entry point.

Run: .venv\Scripts\python.exe seed_demo_users.py
"""

import asyncio
import logging

from app.db.session import AsyncSessionLocal
from app.models.refresh_token import RefreshToken  # noqa: F401 — ensure model is registered
from app.modules.users.models import Role, Permission, RolePermission, Branch, Department, Team, Designation, UserProfile  # noqa: F401
from app.scripts.seed_demo_data import seed_demo_data

# Import all module models so SQLAlchemy resolves all relationships
from app.modules.crm.models import *  # noqa: F401,F403
from app.modules.leads.models import *  # noqa: F401,F403
from app.modules.campaigns.models import *  # noqa: F401,F403
from app.modules.tasks.models import *  # noqa: F401,F403
from app.modules.finance.models import *  # noqa: F401,F403
from app.modules.notifications.models import *  # noqa: F401,F403
from app.modules.users.models import *  # noqa: F401,F403


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        created = await seed_demo_data(session)
        print(
            f"\nSeed completed successfully! "
            f"Created: {created['roles']} role(s), {created['branches']} branch(es), "
            f"{created['departments']} department(s), {created['users']} user(s), "
            f"{created['profiles']} profile(s)."
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(seed())
