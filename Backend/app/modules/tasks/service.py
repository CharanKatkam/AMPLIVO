"""Service layer for Tasks."""
from __future__ import annotations
import uuid
from typing import Sequence
from app.core.exceptions import NotFoundException
from app.core.tenant_scope import enforce_client_scope
from app.modules.tasks.models import Project, Task, TaskAttachment, TaskComment
from app.modules.tasks.repository import ProjectRepository, TaskAttachmentRepository, TaskCommentRepository, TaskRepository

class ProjectService:
    def __init__(self, repo: ProjectRepository) -> None:
        self._repo = repo
    async def list_projects(self, *, search=None, client_id=None, status=None, manager_id=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, client_id=client_id, status=status, manager_id=manager_id, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, client_id=client_id, status=status, manager_id=manager_id)
        return items, total
    async def get_project(self, project_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> Project:
        p = await self._repo.get_detail(project_id)
        if p is None: raise NotFoundException("Project")
        enforce_client_scope(p.client_id, scoped_client_id)
        return p
    async def create_project(self, data: dict) -> Project:
        return await self._repo.create_from_dict(data)
    async def update_project(self, project_id: uuid.UUID, data: dict, *, scoped_client_id: uuid.UUID | None = None) -> Project:
        await self.get_project(project_id, scoped_client_id=scoped_client_id)
        updated = await self._repo.update(project_id, data)
        if updated is None: raise NotFoundException("Project")
        return updated
    async def delete_project(self, project_id: uuid.UUID, *, scoped_client_id: uuid.UUID | None = None) -> None:
        await self.get_project(project_id, scoped_client_id=scoped_client_id)
        if not await self._repo.delete(project_id): raise NotFoundException("Project")

class TaskService:
    def __init__(self, repo: TaskRepository) -> None:
        self._repo = repo
    async def list_tasks(self, *, search=None, project_id=None, project_ids=None, status=None, priority=None, assigned_to=None, sort_by=None, sort_order="desc", offset=0, limit=20):
        items = await self._repo.get_all_filtered(search=search, project_id=project_id, project_ids=project_ids, status=status, priority=priority, assigned_to=assigned_to, sort_by=sort_by, sort_order=sort_order, offset=offset, limit=limit)
        total = await self._repo.count_filtered(search=search, project_id=project_id, project_ids=project_ids, status=status, priority=priority, assigned_to=assigned_to)
        return items, total
    async def get_task(self, task_id: uuid.UUID) -> Task:
        t = await self._repo.get_detail(task_id)
        if t is None: raise NotFoundException("Task")
        return t
    async def create_task(self, data: dict, created_by: uuid.UUID | None = None) -> Task:
        data["created_by"] = created_by
        return await self._repo.create_from_dict(data)
    async def update_task(self, task_id: uuid.UUID, data: dict) -> Task:
        updated = await self._repo.update(task_id, data)
        if updated is None: raise NotFoundException("Task")
        return updated
    async def delete_task(self, task_id: uuid.UUID) -> None:
        if not await self._repo.delete(task_id): raise NotFoundException("Task")

class TaskCommentService:
    def __init__(self, repo: TaskCommentRepository) -> None:
        self._repo = repo
    async def list_comments(self, task_id: uuid.UUID) -> Sequence[TaskComment]:
        return await self._repo.list_by_task(task_id)
    async def create_comment(self, task_id: uuid.UUID, data: dict, user_id: uuid.UUID | None = None) -> TaskComment:
        data["task_id"] = task_id; data["user_id"] = user_id
        return await self._repo.create_from_dict(data)
    async def update_comment(self, comment_id: uuid.UUID, data: dict) -> TaskComment:
        updated = await self._repo.update(comment_id, data)
        if updated is None: raise NotFoundException("TaskComment")
        return updated
    async def delete_comment(self, comment_id: uuid.UUID) -> None:
        if not await self._repo.delete(comment_id): raise NotFoundException("TaskComment")

class TaskAttachmentService:
    def __init__(self, repo: TaskAttachmentRepository) -> None:
        self._repo = repo
    async def list_attachments(self, task_id: uuid.UUID) -> Sequence[TaskAttachment]:
        return await self._repo.list_by_task(task_id)
    async def create_attachment(self, task_id: uuid.UUID, data: dict, uploaded_by: uuid.UUID | None = None) -> TaskAttachment:
        data["task_id"] = task_id; data["uploaded_by"] = uploaded_by
        return await self._repo.create_from_dict(data)
    async def delete_attachment(self, attachment_id: uuid.UUID) -> None:
        if not await self._repo.delete(attachment_id): raise NotFoundException("TaskAttachment")
