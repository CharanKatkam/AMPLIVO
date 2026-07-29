import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    device_name: str | None
    browser: str | None
    operating_system: str | None
    ip_address: str | None
    country: str | None
    city: str | None
    is_revoked: bool
    is_expired: bool
    expires_at: datetime | None
    last_activity: datetime | None
    created_at: datetime
