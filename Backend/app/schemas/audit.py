import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    action: str
    module: str
    endpoint: str
    request_method: str
    ip_address: str | None
    user_agent: str | None
    status: str
    message: str | None
    created_at: datetime
