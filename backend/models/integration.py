from pydantic import BaseModel, Field
from typing import Dict, Optional
from datetime import datetime
from enum import Enum
import uuid

class IntegrationType(str, Enum):
    TELEGRAM = "telegram"
    WHATSAPP = "whatsapp"
    OLX = "olx"
    N8N = "n8n"

class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"

class Integration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: IntegrationType
    status: IntegrationStatus = IntegrationStatus.INACTIVE
    config: Dict = {}  # Конфигурация интеграции
    webhook_url: Optional[str] = None
    last_sync_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str  # Telegram user ID владельца

class IntegrationCreate(BaseModel):
    name: str
    type: IntegrationType
    config: Dict = {}

class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[IntegrationStatus] = None
    config: Optional[Dict] = None