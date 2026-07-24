"""DI factories for Tasks."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies.db import get_db
from app.modules.tasks.repository import *
from app.modules.tasks.service import *

def get_project_service(db: AsyncSession = Depends(get_db)) -> ProjectService:
    return ProjectService(ProjectRepository(db))

def get_project_member_service(db: AsyncSession = Depends(get_db)) -> ProjectMemberService:
    return ProjectMemberService(ProjectMemberRepository(db), ProjectRepository(db), db)

def get_task_service(db: AsyncSession = Depends(get_db)) -> TaskService:
    return TaskService(TaskRepository(db), db)

def get_task_comment_service(db: AsyncSession = Depends(get_db)) -> TaskCommentService:
    return TaskCommentService(TaskCommentRepository(db))

def get_task_attachment_service(db: AsyncSession = Depends(get_db)) -> TaskAttachmentService:
    return TaskAttachmentService(TaskAttachmentRepository(db))

def get_task_submission_service(db: AsyncSession = Depends(get_db)) -> TaskSubmissionService:
    return TaskSubmissionService(TaskSubmissionRepository(db), TaskRepository(db), db)
