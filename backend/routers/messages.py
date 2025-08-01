from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from backend.models.message import Message, MessageCreate, MessageResponse
from backend.services.message_service import MessageService
from backend.services.client_service import ClientService
from backend.utils.dependencies import get_user_id
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/messages", tags=["messages"])

# Подключение к базе данных
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]
message_service = MessageService(db.messages)
client_service = ClientService(db.clients)


@router.get("/", response_model=List[Message])
async def get_recent_messages(
    user_id: str = Depends(get_user_id), limit: int = Query(50, le=100)
):
    """Получить последние сообщения (unified inbox)"""
    return await message_service.get_recent_messages(user_id, limit)


@router.get("/unread-count")
async def get_unread_count(user_id: str = Depends(get_user_id)):
    """Получить количество непрочитанных сообщений"""
    count = await message_service.get_unread_count(user_id)
    return {"unread_count": count}


@router.get("/search", response_model=List[Message])
async def search_messages(
    query: str = Query(..., min_length=1),
    user_id: str = Depends(get_user_id),
    limit: int = Query(50, le=100),
):
    """Поиск по сообщениям"""
    return await message_service.search_messages(user_id, query, limit)


@router.get("/client/{client_id}", response_model=List[Message])
async def get_client_messages(
    client_id: str, user_id: str = Depends(get_user_id), limit: int = Query(100, le=500)
):
    """Получить сообщения клиента"""
    return await message_service.get_client_messages(client_id, user_id, limit)


@router.post("/", response_model=Message)
async def create_message(
    message_data: MessageCreate, user_id: str = Depends(get_user_id)
):
    """Создать новое сообщение (обычно от webhook)"""
    message = await message_service.create_message(message_data, user_id)

    # Обновляем информацию о клиенте
    await client_service.update_last_message(message_data.client_id, user_id)

    return message


@router.post("/respond", response_model=Message)
async def send_response(
    response_data: MessageResponse, user_id: str = Depends(get_user_id)
):
    """Отправить ответ клиенту"""
    # Проверяем существование клиента
    client = await client_service.get_client(response_data.client_id, user_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Отправляем ответ
    message = await message_service.send_response(response_data, user_id)

    # Обновляем информацию о клиенте
    await client_service.update_last_message(response_data.client_id, user_id)

    return message


@router.patch("/{message_id}/read")
async def mark_message_as_read(message_id: str, user_id: str = Depends(get_user_id)):
    """Отметить сообщение как прочитанное"""
    success = await message_service.mark_as_read(message_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message marked as read"}
