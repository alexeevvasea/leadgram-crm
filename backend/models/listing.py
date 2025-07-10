from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid

class ListingStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ATTENTION_NEEDED = "attention_needed"

class Listing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    status: ListingStatus = ListingStatus.ACTIVE
    source: str  # olx, telegram, etc.
    external_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str  # Telegram user ID владельца
    
    # Метрики для "Требует внимания"
    messages_48h: int = 0
    responses_count: int = 0
    last_response_at: Optional[datetime] = None

class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: Optional[float] = None
    source: str
    external_id: Optional[str] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[ListingStatus] = None