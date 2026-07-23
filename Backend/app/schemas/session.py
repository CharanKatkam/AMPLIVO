import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    device_name: str | None
    browser: str | None
    operating_system: str | None
    ip_address: str | None
    country: str | None
    city: str | None
    is_active: bool
    last_activity: datetime
    created_at: datetime
    expires_at: datetime
    is_current: bool
