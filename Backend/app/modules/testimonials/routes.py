"""Routes for the Testimonials module."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.modules.testimonials.dependencies import get_testimonial_service
from app.modules.testimonials.schemas import TestimonialCreate, TestimonialRead, TestimonialUpdate
from app.modules.testimonials.service import TestimonialService

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


@router.get("", response_model=list[TestimonialRead])
async def list_testimonials(skip: int = 0, limit: int = 100, service: TestimonialService = Depends(get_testimonial_service)):
    return await service.list_all(skip=skip, limit=limit)


@router.get("/{id}", response_model=TestimonialRead)
async def get_testimonial(id: uuid.UUID, service: TestimonialService = Depends(get_testimonial_service)):
    return await service.get(id)


@router.post("", response_model=TestimonialRead, status_code=status.HTTP_201_CREATED)
async def create_testimonial(data: TestimonialCreate, service: TestimonialService = Depends(get_testimonial_service)):
    return await service.create(data)


@router.put("/{id}", response_model=TestimonialRead)
async def update_testimonial(id: uuid.UUID, data: TestimonialUpdate, service: TestimonialService = Depends(get_testimonial_service)):
    return await service.update(id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_testimonial(id: uuid.UUID, service: TestimonialService = Depends(get_testimonial_service)):
    await service.delete(id)
