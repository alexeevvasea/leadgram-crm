from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class MessageType(str, Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    content: str
    message_type: MessageType
    source: str  # telegram, whatsapp, olx
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False
    user_id: str  # Telegram user ID владельца

class MessageCreate(BaseModel):
    client_id: str
    content: str
    message_type: MessageType
    source: str

class MessageResponse(BaseModel):
    client_id: str
    content: str