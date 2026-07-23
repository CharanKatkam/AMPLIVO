"""Repository layer for Tasks."""
from __future__ import annotations
import uuid
from typing import Sequence
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from app.core.filters import apply_search, apply_sorting
from app.modules.tasks.models import Project, Task, TaskAttachment, TaskComment
from app.repositories.base import BaseRepository

class ProjectRepository(BaseRepository[Project]):
    model = Project
    searchable_columns = [Project.name, Project.description]
    async def get_detail(self, project_id: uuid.UUID) -> Project | None:
        stmt = select(Project).options(selectinload(Project.tasks)).where(Project.id == project_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, client_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Project]:
        stmt = select(Project)
        if client_id: stmt = stmt.where(Project.client_id == client_id)
        if status: stmt = stmt.where(Project.status == status)
        if manager_id: stmt = stmt.where(Project.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Project, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, client_id=None, status=None, manager_id=None) -> int:
        stmt = select(func.count()).select_from(Project)
        if client_id: stmt = stmt.where(Project.client_id == client_id)
        if status: stmt = stmt.where(Project.status == status)
        if manager_id: stmt = stmt.where(Project.manager_id == manager_id)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class TaskRepository(BaseRepository[Task]):
    model = Task
    searchable_columns = [Task.title, Task.description]
    async def get_detail(self, task_id: uuid.UUID) -> Task | None:
        stmt = select(Task).options(selectinload(Task.comments), selectinload(Task.attachments)).where(Task.id == task_id)
        result = await self._db.execute(stmt)
        return result.scalar_one_or_none()
    async def get_all_filtered(self, *, search=None, project_id=None, project_ids=None, status=None, priority=None, assigned_to=None, sort_by=None, sort_order="desc", offset=0, limit=20) -> Sequence[Task]:
        stmt = select(Task)
        if project_id: stmt = stmt.where(Task.project_id == project_id)
        if project_ids is not None: stmt = stmt.where(Task.project_id.in_(project_ids))
        if status: stmt = stmt.where(Task.status == status)
        if priority: stmt = stmt.where(Task.priority == priority)
        if assigned_to: stmt = stmt.where(Task.assigned_to == assigned_to)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        stmt = apply_sorting(stmt, model=Task, sort_by=sort_by, sort_order=sort_order)
        stmt = stmt.offset(offset).limit(limit)
        return (await self._db.execute(stmt)).scalars().all()
    async def count_filtered(self, *, search=None, project_id=None, project_ids=None, status=None, priority=None, assigned_to=None) -> int:
        stmt = select(func.count()).select_from(Task)
        if project_id: stmt = stmt.where(Task.project_id == project_id)
        if project_ids is not None: stmt = stmt.where(Task.project_id.in_(project_ids))
        if status: stmt = stmt.where(Task.status == status)
        if priority: stmt = stmt.where(Task.priority == priority)
        if assigned_to: stmt = stmt.where(Task.assigned_to == assigned_to)
        stmt = apply_search(stmt, search=search, columns=self.searchable_columns)
        return (await self._db.execute(stmt)).scalar_one()

class TaskCommentRepository(BaseRepository[TaskComment]):
    model = TaskComment
    async def list_by_task(self, task_id: uuid.UUID) -> Sequence[TaskComment]:
        r = await self._db.execute(select(TaskComment).where(TaskComment.task_id == task_id).order_by(TaskComment.created_at))
        return r.scalars().all()

class TaskAttachmentRepository(BaseRepository[TaskAttachment]):
    model = TaskAttachment
    async def list_by_task(self, task_id: uuid.UUID) -> Sequence[TaskAttachment]:
        r = await self._db.execute(select(TaskAttachment).where(TaskAttachment.task_id == task_id).order_by(TaskAttachment.created_at.desc()))
        return r.scalars().all()
