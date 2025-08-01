from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid


class ClientStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class MessageSource(str, Enum):
    TELEGRAM = "telegram"
    WHATSAPP = "whatsapp"
    OLX = "olx"


class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: Optional[str] = None
    source: MessageSource
    status: ClientStatus = ClientStatus.NEW
    listing_id: Optional[str] = None
    listing_title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: Optional[datetime] = None
    messages_count: int = 0
    user_id: str  # Telegram user ID владельца


class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    source: MessageSource
    listing_id: Optional[str] = None
    listing_title: Optional[str] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[ClientStatus] = None
    listing_id: Optional[str] = None
    listing_title: Optional[str] = None
