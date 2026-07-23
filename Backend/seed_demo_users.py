r"""Seed demo users and roles into the database.

Run: .venv\Scripts\python.exe seed_demo_users.py
"""

import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.refresh_token import RefreshToken  # noqa: F401 — ensure model is registered
from app.modules.users.models import Role, Permission, RolePermission, Branch, Department, Team, Designation, UserProfile  # noqa: F401
from app.utils.password import hash_password

# Import all module models so SQLAlchemy resolves all relationships
from app.modules.crm.models import *  # noqa: F401,F403
from app.modules.leads.models import *  # noqa: F401,F403
from app.modules.campaigns.models import *  # noqa: F401,F403
from app.modules.tasks.models import *  # noqa: F401,F403
from app.modules.finance.models import *  # noqa: F401,F403
from app.modules.notifications.models import *  # noqa: F401,F403
from app.modules.users.models import *  # noqa: F401,F403


DEMO_USERS = [
    {"email": "admin@amplivo.in", "username": "admin", "full_name": "Admin User", "password": "Admin@123", "role_name": "admin"},
    {"email": "client@amplivo.in", "username": "client", "full_name": "Client User", "password": "Client@123", "role_name": "client"},
    {"email": "sales@amplivo.in", "username": "sales", "full_name": "Sales User", "password": "Sales@123", "role_name": "sales"},
    {"email": "hr@amplivo.in", "username": "hr", "full_name": "HR Manager", "password": "Hr@12345", "role_name": "hr"},
    {"email": "employee@amplivo.in", "username": "employee", "full_name": "Employee User", "password": "Employee@123", "role_name": "employee"},
]

ROLES = [
    {"name": "Admin", "slug": "admin", "description": "Full system access", "is_system": True},
    {"name": "Client", "slug": "client", "description": "Client portal user", "is_system": True},
    {"name": "Sales", "slug": "sales", "description": "Sales team member", "is_system": True},
    {"name": "HR", "slug": "hr", "description": "Human Resources manager", "is_system": True},
    {"name": "Employee", "slug": "employee", "description": "Internal employee", "is_system": True},
]


async def seed():
    async with AsyncSessionLocal() as session:
        # Create roles
        role_map: dict[str, uuid.UUID] = {}
        for role_data in ROLES:
            result = await session.execute(
                select(Role).where(Role.slug == role_data["slug"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                role_map[role_data["slug"]] = existing.id
                print(f"  Role '{role_data['name']}' already exists ({existing.id})")
            else:
                role = Role(**role_data)
                session.add(role)
                await session.flush()
                role_map[role_data["slug"]] = role.id
                print(f"  Created role '{role_data['name']}' ({role.id})")

        await session.commit()

        # Create demo users
        for user_data in DEMO_USERS:
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                print(f"  User '{user_data['email']}' already exists ({existing.id})")
                continue

            role_id = role_map.get(user_data["role_name"])
            user = User(
                email=user_data["email"],
                username=user_data["username"],
                full_name=user_data["full_name"],
                hashed_password=hash_password(user_data["password"]),
                user_type="internal",
                status="active",
                role_id=role_id,
                is_active=True,
                is_verified=True,
            )
            session.add(user)
            await session.flush()
            print(f"  Created user '{user_data['email']}' ({user.id}) role={user_data['role_name']}")

        await session.commit()
        print("\nSeed completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
