from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from backend.models.client import Client, ClientCreate, ClientUpdate, ClientStatus
from backend.services.client_service import ClientService
from backend.utils.dependencies import get_user_id
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/clients", tags=["clients"])

# Подключение к базе данных
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]
client_service = ClientService(db.clients)


@router.get("/", response_model=List[Client])
async def get_clients(
    user_id: str = Depends(get_user_id),
    status: Optional[ClientStatus] = Query(None),
    source: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
):
    """Получить список клиентов с фильтрацией"""
    return await client_service.get_clients(user_id, status, source, limit)


@router.get("/recent", response_model=List[Client])
async def get_recent_chats(
    user_id: str = Depends(get_user_id), limit: int = Query(10, le=20)
):
    """Получить последние активные чаты"""
    return await client_service.get_recent_chats(user_id, limit)


@router.get("/dashboard")
async def get_dashboard_stats(user_id: str = Depends(get_user_id)):
    """Получить статистику для дашборда"""
    return await client_service.get_dashboard_stats(user_id)


@router.post("/", response_model=Client)
async def create_client(client_data: ClientCreate, user_id: str = Depends(get_user_id)):
    """Создать нового клиента"""
    return await client_service.create_client(client_data, user_id)


@router.get("/{client_id}", response_model=Client)
async def get_client(client_id: str, user_id: str = Depends(get_user_id)):
    """Получить клиента по ID"""
    client = await client_service.get_client(client_id, user_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=Client)
async def update_client(
    client_id: str, update_data: ClientUpdate, user_id: str = Depends(get_user_id)
):
    """Обновить клиента"""
    client = await client_service.update_client(client_id, user_id, update_data)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.post("/{client_id}/call")
async def call_client(client_id: str, user_id: str = Depends(get_user_id)):
    """Инициировать звонок клиенту"""
    client = await client_service.get_client(client_id, user_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Здесь можно добавить интеграцию с телефонией
    return {"message": f"Calling {client.name}", "phone": client.phone}


@router.post("/{client_id}/close")
async def close_client(client_id: str, user_id: str = Depends(get_user_id)):
    """Закрыть клиента (завершить работу)"""
    update_data = ClientUpdate(status=ClientStatus.CLOSED)
    client = await client_service.update_client(client_id, user_id, update_data)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client closed successfully"}
