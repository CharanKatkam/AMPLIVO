"""Routes for the Marketing Automation module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.modules.marketing_automation.dependencies import get_automation_service
from app.modules.marketing_automation.schemas import AutomationWorkflowCreate, AutomationWorkflowRead, AutomationWorkflowUpdate
from app.modules.marketing_automation.service import AutomationWorkflowService

router = APIRouter(prefix="/automation", tags=["Marketing Automation"])


@router.get("", response_model=list[AutomationWorkflowRead])
async def list_workflows(skip: int = 0, limit: int = 100, service: AutomationWorkflowService = Depends(get_automation_service)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=AutomationWorkflowRead)
async def get_workflow(id: uuid.UUID, service: AutomationWorkflowService = Depends(get_automation_service)):
    return await service.get(id)


@router.post("", response_model=AutomationWorkflowRead, status_code=status.HTTP_201_CREATED)
async def create_workflow(data: AutomationWorkflowCreate, service: AutomationWorkflowService = Depends(get_automation_service)):
    return await service.create(data)


@router.put("/{id}", response_model=AutomationWorkflowRead)
async def update_workflow(id: uuid.UUID, data: AutomationWorkflowUpdate, service: AutomationWorkflowService = Depends(get_automation_service)):
    return await service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(id: uuid.UUID, service: AutomationWorkflowService = Depends(get_automation_service)):
    await service.delete(id)
