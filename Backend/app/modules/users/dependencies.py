"""FastAPI dependency factories for the User Management module."""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.db import get_db
from app.modules.users.repository import (
    BranchRepository,
    DepartmentRepository,
    DesignationRepository,
    PermissionRepository,
    RolePermissionRepository,
    RoleRepository,
    TeamRepository,
    UserManagementRepository,
    UserProfileRepository,
)
from app.modules.users.service import (
    BranchService,
    DepartmentService,
    DesignationService,
    PermissionService,
    RoleService,
    TeamService,
    UserManagementService,
    UserProfileService,
)


def get_role_service(db: AsyncSession = Depends(get_db)) -> RoleService:
    return RoleService(db, RoleRepository(db), RolePermissionRepository(db))


def get_permission_service(db: AsyncSession = Depends(get_db)) -> PermissionService:
    return PermissionService(PermissionRepository(db))


def get_branch_service(db: AsyncSession = Depends(get_db)) -> BranchService:
    return BranchService(BranchRepository(db))


def get_department_service(db: AsyncSession = Depends(get_db)) -> DepartmentService:
    return DepartmentService(DepartmentRepository(db))


def get_team_service(db: AsyncSession = Depends(get_db)) -> TeamService:
    return TeamService(TeamRepository(db))


def get_designation_service(db: AsyncSession = Depends(get_db)) -> DesignationService:
    return DesignationService(DesignationRepository(db))


def get_user_profile_service(db: AsyncSession = Depends(get_db)) -> UserProfileService:
    return UserProfileService(db, UserProfileRepository(db))


def get_user_management_service(db: AsyncSession = Depends(get_db)) -> UserManagementService:
    return UserManagementService(db, UserManagementRepository(db))
