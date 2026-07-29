import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    table_name: str | None
    record_id: uuid.UUID | None
    action: str | None
    performed_by: uuid.UUID | None
    ip_address: str | None
    created_at: datetime | None
