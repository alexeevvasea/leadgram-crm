from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum
import uuid

class AutomationTrigger(str, Enum):
    NEW_MESSAGE = "new_message"
    NO_RESPONSE = "no_response"
    TIME_BASED = "time_based"
    MANUAL = "manual"

class AutomationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"

class Automation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    trigger: AutomationTrigger
    conditions: Dict = {}  # Условия запуска
    actions: List[Dict] = []  # Действия
    status: AutomationStatus = AutomationStatus.INACTIVE
    n8n_workflow_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str  # Telegram user ID владельца

class AutomationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger: AutomationTrigger
    conditions: Dict = {}
    actions: List[Dict] = []

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    conditions: Optional[Dict] = None
    actions: Optional[List[Dict]] = None
    status: Optional[AutomationStatus] = None
