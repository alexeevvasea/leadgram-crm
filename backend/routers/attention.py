from fastapi import APIRouter, Depends
from typing import List, Dict
from backend.services.attention_service import AttentionService
from backend.utils.dependencies import get_user_id
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/attention", tags=["attention"])

# Подключение к базе данных
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]
attention_service = AttentionService(db.clients, db.messages, db.listings)


@router.get("/listings")
async def get_listings_requiring_attention(
    user_id: str = Depends(get_user_id),
) -> List[Dict]:
    """Получить объявления, требующие внимания"""
    return await attention_service.get_listings_requiring_attention(user_id)


@router.get("/summary")
async def get_attention_summary(user_id: str = Depends(get_user_id)) -> Dict:
    """Получить краткую сводку для дашборда"""
    return await attention_service.get_attention_summary(user_id)
