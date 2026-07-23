"""API routes for the User Management module.

Provides full CRUD + search + filters for Users, Roles, Permissions,
Branches, Departments, Teams, Designations, and User Profiles.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException
from app.core.pagination import PaginatedResponse, PaginationParams
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.dependencies.tenant import get_current_user_role_slug
from app.models.user import User
from app.modules.users.dependencies import (
    get_branch_service,
    get_department_service,
    get_designation_service,
    get_permission_service,
    get_role_service,
    get_team_service,
    get_user_management_service,
    get_user_profile_service,
)
from app.modules.users.schemas import (
    BranchCreate,
    BranchRead,
    BranchUpdate,
    DepartmentCreate,
    DepartmentRead,
    DepartmentUpdate,
    DesignationCreate,
    DesignationRead,
    DesignationUpdate,
    PermissionCreate,
    PermissionRead,
    RoleCreate,
    RoleRead,
    RoleUpdate,
    RoleWithPermissions,
    TeamCreate,
    TeamRead,
    TeamUpdate,
    UserDetail,
    UserListItem,
    UserProfileCreate,
    UserProfileRead,
    UserProfileUpdate,
    UserUpdate,
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

router = APIRouter(tags=["User Management"])


# ════════════════════════════════════════════════════════════════════════
# USERS
# ════════════════════════════════════════════════════════════════════════


@router.get(
    "/users",
    response_model=PaginatedResponse[UserListItem],
    summary="List all users with filters",
)
async def list_users(
    params: PaginationParams = Depends(),
    user_type: str | None = Query(None, description="Filter by user_type (internal/client)"),
    user_status: str | None = Query(None, alias="status", description="Filter by status"),
    role_id: uuid.UUID | None = Query(None, description="Filter by role"),
    department_id: uuid.UUID | None = Query(None, description="Filter by department"),
    branch_id: uuid.UUID | None = Query(None, description="Filter by branch"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    svc: UserManagementService = Depends(get_user_management_service),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[UserListItem]:
    items, total = await svc.list_users(
        search=params.search, user_type=user_type, status=user_status,
        role_id=role_id, department_id=department_id, branch_id=branch_id,
        is_active=is_active, sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[UserListItem].create(
        items=[UserListItem.model_validate(u) for u in items],
        total=total, page=params.page, page_size=params.page_size,
    )


@router.get(
    "/users/{user_id}",
    response_model=UserDetail,
    summary="Get user detail with profile",
)
async def get_user(
    user_id: uuid.UUID,
    svc: UserManagementService = Depends(get_user_management_service),
    _: User = Depends(get_current_user),
) -> UserDetail:
    user = await svc.get_user(user_id)
    return UserDetail.model_validate(user)


@router.put(
    "/users/{user_id}",
    response_model=UserDetail,
    summary="Update user details",
)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    svc: UserManagementService = Depends(get_user_management_service),
    current_user: User = Depends(get_current_user),
    role_slug: str | None = Depends(get_current_user_role_slug),
) -> UserDetail:
    if role_slug == "client" and user_id != current_user.id:
        raise ForbiddenException("You can only update your own profile.")
    data = payload.model_dump(exclude_unset=True)
    user = await svc.update_user(user_id, data)
    await db.commit()
    return UserDetail.model_validate(user)


@router.post(
    "/users/{user_id}/deactivate",
    response_model=UserDetail,
    summary="Deactivate a user",
)
async def deactivate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: UserManagementService = Depends(get_user_management_service),
    _: User = Depends(get_current_user),
) -> UserDetail:
    user = await svc.deactivate_user(user_id)
    await db.commit()
    return UserDetail.model_validate(user)


@router.post(
    "/users/{user_id}/activate",
    response_model=UserDetail,
    summary="Activate a user",
)
async def activate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: UserManagementService = Depends(get_user_management_service),
    _: User = Depends(get_current_user),
) -> UserDetail:
    user = await svc.activate_user(user_id)
    await db.commit()
    return UserDetail.model_validate(user)


# ── User Profiles ──────────────────────────────────────────────────────


@router.get(
    "/users/{user_id}/profile",
    response_model=UserProfileRead,
    summary="Get user profile",
)
async def get_user_profile(
    user_id: uuid.UUID,
    svc: UserProfileService = Depends(get_user_profile_service),
    _: User = Depends(get_current_user),
) -> UserProfileRead:
    profile = await svc.get_profile(user_id)
    return UserProfileRead.model_validate(profile)


@router.put(
    "/users/{user_id}/profile",
    response_model=UserProfileRead,
    summary="Create or update user profile",
)
async def upsert_user_profile(
    user_id: uuid.UUID,
    payload: UserProfileCreate,
    db: AsyncSession = Depends(get_db),
    svc: UserProfileService = Depends(get_user_profile_service),
    current_user: User = Depends(get_current_user),
    role_slug: str | None = Depends(get_current_user_role_slug),
) -> UserProfileRead:
    if role_slug == "client" and user_id != current_user.id:
        raise ForbiddenException("You can only update your own profile.")
    data = payload.model_dump(exclude_unset=True)
    profile = await svc.create_or_update_profile(user_id, data)
    await db.commit()
    return UserProfileRead.model_validate(profile)


# ════════════════════════════════════════════════════════════════════════
# ROLES
# ════════════════════════════════════════════════════════════════════════


@router.get("/roles", response_model=PaginatedResponse[RoleRead], summary="List roles")
async def list_roles(
    params: PaginationParams = Depends(),
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[RoleRead]:
    items, total = await svc.list_roles(
        search=params.search, sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[RoleRead].create(
        items=[RoleRead.model_validate(r) for r in items],
        total=total, page=params.page, page_size=params.page_size,
    )


@router.post("/roles", response_model=RoleRead, status_code=status.HTTP_201_CREATED, summary="Create role")
async def create_role(
    payload: RoleCreate,
    db: AsyncSession = Depends(get_db),
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> RoleRead:
    role = await svc.create_role(payload.model_dump())
    await db.commit()
    return RoleRead.model_validate(role)


@router.get("/roles/{role_id}", response_model=RoleRead, summary="Get role")
async def get_role(
    role_id: uuid.UUID,
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> RoleRead:
    role = await svc.get_role(role_id)
    return RoleRead.model_validate(role)


@router.put("/roles/{role_id}", response_model=RoleRead, summary="Update role")
async def update_role(
    role_id: uuid.UUID,
    payload: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> RoleRead:
    data = payload.model_dump(exclude_unset=True)
    role = await svc.update_role(role_id, data)
    await db.commit()
    return RoleRead.model_validate(role)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete role")
async def delete_role(
    role_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> None:
    await svc.delete_role(role_id)
    await db.commit()


@router.get(
    "/roles/{role_id}/permissions",
    response_model=list[PermissionRead],
    summary="List permissions for a role",
)
async def list_role_permissions(
    role_id: uuid.UUID,
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> list[PermissionRead]:
    perms = await svc.get_role_permissions(role_id)
    return [PermissionRead.model_validate(p) for p in perms]


@router.post(
    "/roles/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_201_CREATED,
    summary="Assign permission to role",
)
async def assign_permission_to_role(
    role_id: uuid.UUID,
    permission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> dict:
    await svc.assign_permission(role_id, permission_id)
    await db.commit()
    return {"message": "Permission assigned."}


@router.delete(
    "/roles/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke permission from role",
)
async def revoke_permission_from_role(
    role_id: uuid.UUID,
    permission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: RoleService = Depends(get_role_service),
    _: User = Depends(get_current_user),
) -> None:
    await svc.revoke_permission(role_id, permission_id)
    await db.commit()


# ════════════════════════════════════════════════════════════════════════
# PERMISSIONS
# ════════════════════════════════════════════════════════════════════════


@router.get("/permissions", response_model=PaginatedResponse[PermissionRead], summary="List permissions")
async def list_permissions(
    params: PaginationParams = Depends(),
    module: str | None = Query(None, description="Filter by module"),
    svc: PermissionService = Depends(get_permission_service),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[PermissionRead]:
    items, total = await svc.list_permissions(
        search=params.search, module=module, sort_by=params.sort_by,
        sort_order=params.sort_order, offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[PermissionRead].create(
        items=[PermissionRead.model_validate(p) for p in items],
        total=total, page=params.page, page_size=params.page_size,
    )


@router.post(
    "/permissions",
    response_model=PermissionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create permission",
)
async def create_permission(
    payload: PermissionCreate,
    db: AsyncSession = Depends(get_db),
    svc: PermissionService = Depends(get_permission_service),
    _: User = Depends(get_current_user),
) -> PermissionRead:
    perm = await svc.create_permission(payload.model_dump())
    await db.commit()
    return PermissionRead.model_validate(perm)


# ════════════════════════════════════════════════════════════════════════
# BRANCHES
# ════════════════════════════════════════════════════════════════════════


@router.get("/branches", response_model=PaginatedResponse[BranchRead], summary="List branches")
async def list_branches(
    params: PaginationParams = Depends(),
    is_active: bool | None = Query(None, description="Filter by active status"),
    svc: BranchService = Depends(get_branch_service),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[BranchRead]:
    items, total = await svc.list_branches(
        search=params.search, is_active=is_active, sort_by=params.sort_by,
        sort_order=params.sort_order, offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[BranchRead].create(
        items=[BranchRead.model_validate(b) for b in items],
        total=total, page=params.page, page_size=params.page_size,
    )


@router.post("/branches", response_model=BranchRead, status_code=status.HTTP_201_CREATED, summary="Create branch")
async def create_branch(
    payload: BranchCreate,
    db: AsyncSession = Depends(get_db),
    svc: BranchService = Depends(get_branch_service),
    _: User = Depends(get_current_user),
) -> BranchRead:
    branch = await svc.create_branch(payload.model_dump())
    await db.commit()
    return BranchRead.model_validate(branch)


@router.get("/branches/{branch_id}", response_model=BranchRead, summary="Get branch")
async def get_branch(
    branch_id: uuid.UUID,
    svc: BranchService = Depends(get_branch_service),
    _: User = Depends(get_current_user),
) -> BranchRead:
    branch = await svc.get_branch(branch_id)
    return BranchRead.model_validate(branch)


@router.put("/branches/{branch_id}", response_model=BranchRead, summary="Update branch")
async def update_branch(
    branch_id: uuid.UUID,
    payload: BranchUpdate,
    db: AsyncSession = Depends(get_db),
    svc: BranchService = Depends(get_branch_service),
    _: User = Depends(get_current_user),
) -> BranchRead:
    data = payload.model_dump(exclude_unset=True)
    branch = await svc.update_branch(branch_id, data)
    await db.commit()
    return BranchRead.model_validate(branch)


@router.delete("/branches/{branch_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete branch")
async def delete_branch(
    branch_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: BranchService = Depends(get_branch_service),
    _: User = Depends(get_current_user),
) -> None:
    await svc.delete_branch(branch_id)
    await db.commit()


# ════════════════════════════════════════════════════════════════════════
# DEPARTMENTS
# ════════════════════════════════════════════════════════════════════════


@router.get("/departments", response_model=PaginatedResponse[DepartmentRead], summary="List departments")
async def list_departments(
    params: PaginationParams = Depends(),
    svc: DepartmentService = Depends(get_department_service),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[DepartmentRead]:
    items, total = await svc.list_departments(
        search=params.search, sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[DepartmentRead].create(
        items=[DepartmentRead.model_validate(d) for d in items],
        total=total, page=params.page, page_size=params.page_size,
    )


@router.post(
    "/departments",
    response_model=DepartmentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create department",
)
async def create_department(
    payload: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    svc: DepartmentService = Depends(get_department_service),
    _: User = Depends(get_current_user),
) -> DepartmentRead:
    dept = await svc.create_department(payload.model_dump())
    await db.commit()
    return DepartmentRead.model_validate(dept)


@router.get("/departments/{department_id}", response_model=DepartmentRead, summary="Get department")
async def get_department(
    department_id: uuid.UUID,
    svc: DepartmentService = Depends(get_department_service),
    _: User = Depends(get_current_user),
) -> DepartmentRead:
    dept = await svc.get_department(department_id)
    return DepartmentRead.model_validate(dept)


@router.put("/departments/{department_id}", response_model=DepartmentRead, summary="Update department")
async def update_department(
    department_id: uuid.UUID,
    payload: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    svc: DepartmentService = Depends(get_department_service),
    _: User = Depends(get_current_user),
) -> DepartmentRead:
    data = payload.model_dump(exclude_unset=True)
    dept = await svc.update_department(department_id, data)
    await db.commit()
    return DepartmentRead.model_validate(dept)


@router.delete(
    "/departments/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete department",
)
async def delete_department(
    department_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: DepartmentService = Depends(get_department_service),
    _: User = Depends(get_current_user),
) -> None:
    await svc.delete_department(department_id)
    await db.commit()


# ════════════════════════════════════════════════════════════════════════
# TEAMS
# ════════════════════════════════════════════════════════════════════════


@router.get("/teams", response_model=PaginatedResponse[TeamRead], summary="List teams")
async def list_teams(
    params: PaginationParams = Depends(),
    department_id: uuid.UUID | None = Query(None, description="Filter by department"),
    is_active: bool | None = Query(None, description="Filter by active status"),
    svc: TeamService = Depends(get_team_service),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[TeamRead]:
    items, total = await svc.list_teams(
        search=params.search, department_id=department_id, is_active=is_active,
        sort_by=params.sort_by, sort_order=params.sort_order,
        offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[TeamRead].create(
        items=[TeamRead.model_validate(t) for t in items],
        total=total, page=params.page, page_size=params.page_size,
    )


@router.post("/teams", response_model=TeamRead, status_code=status.HTTP_201_CREATED, summary="Create team")
async def create_team(
    payload: TeamCreate,
    db: AsyncSession = Depends(get_db),
    svc: TeamService = Depends(get_team_service),
    _: User = Depends(get_current_user),
) -> TeamRead:
    team = await svc.create_team(payload.model_dump())
    await db.commit()
    return TeamRead.model_validate(team)


@router.get("/teams/{team_id}", response_model=TeamRead, summary="Get team")
async def get_team(
    team_id: uuid.UUID,
    svc: TeamService = Depends(get_team_service),
    _: User = Depends(get_current_user),
) -> TeamRead:
    team = await svc.get_team(team_id)
    return TeamRead.model_validate(team)


@router.put("/teams/{team_id}", response_model=TeamRead, summary="Update team")
async def update_team(
    team_id: uuid.UUID,
    payload: TeamUpdate,
    db: AsyncSession = Depends(get_db),
    svc: TeamService = Depends(get_team_service),
    _: User = Depends(get_current_user),
) -> TeamRead:
    data = payload.model_dump(exclude_unset=True)
    team = await svc.update_team(team_id, data)
    await db.commit()
    return TeamRead.model_validate(team)


@router.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete team")
async def delete_team(
    team_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: TeamService = Depends(get_team_service),
    _: User = Depends(get_current_user),
) -> None:
    await svc.delete_team(team_id)
    await db.commit()


# ════════════════════════════════════════════════════════════════════════
# DESIGNATIONS
# ════════════════════════════════════════════════════════════════════════


@router.get("/designations", response_model=PaginatedResponse[DesignationRead], summary="List designations")
async def list_designations(
    params: PaginationParams = Depends(),
    is_active: bool | None = Query(None, description="Filter by active status"),
    svc: DesignationService = Depends(get_designation_service),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[DesignationRead]:
    items, total = await svc.list_designations(
        search=params.search, is_active=is_active, sort_by=params.sort_by,
        sort_order=params.sort_order, offset=params.offset, limit=params.page_size,
    )
    return PaginatedResponse[DesignationRead].create(
        items=[DesignationRead.model_validate(d) for d in items],
        total=total, page=params.page, page_size=params.page_size,
    )


@router.post(
    "/designations",
    response_model=DesignationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create designation",
)
async def create_designation(
    payload: DesignationCreate,
    db: AsyncSession = Depends(get_db),
    svc: DesignationService = Depends(get_designation_service),
    _: User = Depends(get_current_user),
) -> DesignationRead:
    d = await svc.create_designation(payload.model_dump())
    await db.commit()
    return DesignationRead.model_validate(d)


@router.get("/designations/{designation_id}", response_model=DesignationRead, summary="Get designation")
async def get_designation(
    designation_id: uuid.UUID,
    svc: DesignationService = Depends(get_designation_service),
    _: User = Depends(get_current_user),
) -> DesignationRead:
    d = await svc.get_designation(designation_id)
    return DesignationRead.model_validate(d)


@router.put("/designations/{designation_id}", response_model=DesignationRead, summary="Update designation")
async def update_designation(
    designation_id: uuid.UUID,
    payload: DesignationUpdate,
    db: AsyncSession = Depends(get_db),
    svc: DesignationService = Depends(get_designation_service),
    _: User = Depends(get_current_user),
) -> DesignationRead:
    data = payload.model_dump(exclude_unset=True)
    d = await svc.update_designation(designation_id, data)
    await db.commit()
    return DesignationRead.model_validate(d)


@router.delete(
    "/designations/{designation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete designation",
)
async def delete_designation(
    designation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    svc: DesignationService = Depends(get_designation_service),
    _: User = Depends(get_current_user),
) -> None:
    await svc.delete_designation(designation_id)
    await db.commit()
