import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LoginHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    login_time: datetime
    logout_time: datetime | None
    ip_address: str | None
    browser: str | None
    operating_system: str | None
    device: str | None
    status: str
    refresh_token_id: uuid.UUID | None
    created_at: datetime
