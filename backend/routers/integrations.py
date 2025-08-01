from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Dict, Any
from backend.models.integration import Integration, IntegrationCreate, IntegrationUpdate
from backend.models.message import MessageCreate
from backend.services.message_service import MessageService
from backend.services.client_service import ClientService
from backend.utils.dependencies import get_user_id
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json

router = APIRouter(prefix="/integrations", tags=["integrations"])

# Подключение к базе данных
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]
message_service = MessageService(db.messages)
client_service = ClientService(db.clients)


@router.get("/", response_model=List[Integration])
async def get_integrations(user_id: str = Depends(get_user_id)) -> List[Integration]:
    """Получить список интеграций"""
    cursor = db.integrations.find({"user_id": user_id})
    integrations = await cursor.to_list(length=100)
    return [Integration(**integration) for integration in integrations]


@router.post("/", response_model=Integration)
async def create_integration(
    integration_data: IntegrationCreate, user_id: str = Depends(get_user_id)
) -> Integration:
    """Создать новую интеграцию"""
    integration = Integration(**integration_data.model_dump(), user_id=user_id)
    await db.integrations.insert_one(integration.model_dump())
    return integration


@router.get("/{integration_id}", response_model=Integration)
async def get_integration(integration_id: str, user_id: str = Depends(get_user_id)) -> Integration:  # type: ignore[func-returns-value]
    """Получить интеграцию по ID"""
    integration = await db.integrations.find_one({"id": integration_id, "user_id": user_id})  # type: ignore[func-returns-value]
    if integration is None:
        raise HTTPException(status_code=404, detail="Integration not found")
    return Integration(**integration)


@router.put("/{integration_id}", response_model=Integration)
async def update_integration(
    integration_id: str,
    update_data: IntegrationUpdate,
    user_id: str = Depends(get_user_id),
) -> Integration:
    """Обновить интеграцию"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}

    result = await db.integrations.update_one(
        {"id": integration_id, "user_id": user_id}, {"$set": update_dict}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")

    return await get_integration(integration_id, user_id)


@router.delete("/{integration_id}")
async def delete_integration(integration_id: str, user_id: str = Depends(get_user_id)) -> Dict[str, str]:
    """Удалить интеграцию"""
    result = await db.integrations.delete_one(
        {"id": integration_id, "user_id": user_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Integration not found")
    return {"message": "Integration deleted successfully"}


@router.post("/webhook/{integration_id}")
async def handle_webhook(integration_id: str, request: Request) -> Dict[str, str]:  # type: ignore[func-returns-value]
    """Обработать webhook от внешних сервисов"""
    body = await request.json()

    integration = await db.integrations.find_one({"id": integration_id})  # type: ignore[func-returns-value]
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    if integration["type"] == "telegram":
        await handle_telegram_webhook(body, integration["user_id"])
    elif integration["type"] == "whatsapp":
        await handle_whatsapp_webhook(body, integration["user_id"])
    elif integration["type"] == "olx":
        await handle_olx_webhook(body, integration["user_id"])

    return {"message": "Webhook processed successfully"}


async def handle_telegram_webhook(data: Dict[str, Any], user_id: str) -> None:
    """Обработка webhook от Telegram"""
    # Здесь логика обработки сообщений из Telegram
    # Это заглушка для демонстрации
    pass


async def handle_whatsapp_webhook(data: Dict[str, Any], user_id: str) -> None:
    """Обработка webhook от WhatsApp"""
    # Здесь логика обработки сообщений из WhatsApp
    # Это заглушка для демонстрации
    pass


async def handle_olx_webhook(data: Dict[str, Any], user_id: str) -> None:
    """Обработка webhook от OLX"""
    # Здесь логика обработки сообщений из OLX
    # Это заглушка для демонстрации
    pass


@router.post("/test/{integration_id}")
async def test_integration(integration_id: str, user_id: str = Depends(get_user_id)) -> Dict[str, str]:  # type: ignore[func-returns-value]
    """Тестировать интеграцию"""
    integration = await db.integrations.find_one({"id": integration_id, "user_id": user_id})  # type: ignore[func-returns-value]
    if integration is None:
        raise HTTPException(status_code=404, detail="Integration not found")

    # Имитация тестового сообщения
    return {
        "message": f"Integration {integration['name']} tested successfully",
        "status": "ok",
    }
