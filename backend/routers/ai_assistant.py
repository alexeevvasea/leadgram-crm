from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List, Any
from pydantic import BaseModel
from backend.utils.dependencies import get_user_id
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/ai", tags=["ai-assistant"])

# Подключение к базе данных
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


class AIRequest(BaseModel):
    prompt: str
    context: Dict = {}


class AIResponse(BaseModel):
    response: str
    suggestions: List[str] = []


class ResponseSuggestionRequest(BaseModel):
    client_id: str
    conversation_history: List[str] = []


class ListingAnalysisRequest(BaseModel):
    listing_id: str
    listing_text: str


@router.post("/suggest-response", response_model=AIResponse)
async def suggest_response(
    request: ResponseSuggestionRequest, user_id: str = Depends(get_user_id)
) -> AIResponse:  # type: ignore[func-returns-value]
    """Предложить ответ клиенту на основе истории переписки"""

    # Проверяем существование клиента
    client = await db.clients.find_one({"id": request.client_id, "user_id": user_id})  # type: ignore[func-returns-value]
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")

    # Получаем последние сообщения
    messages = (
        await db.messages.find({"client_id": request.client_id, "user_id": user_id})
        .sort("timestamp", -1)
        .limit(10)
        .to_list(length=10)
    )

    # Пока что возвращаем заглушку
    # В будущем здесь будет интеграция с OpenAI API
    suggestions = [
        "Спасибо за ваш интерес! Товар все еще доступен.",
        "Да, можем встретиться для осмотра. Когда вам удобно?",
        "Цена обсуждается. Готовы рассмотреть разумные предложения.",
    ]

    return AIResponse(response=suggestions[0], suggestions=suggestions)


@router.post("/close-deal-tips", response_model=AIResponse)
async def get_close_deal_tips(
    request: ResponseSuggestionRequest, user_id: str = Depends(get_user_id)
) -> AIResponse:  # type: ignore[func-returns-value]
    """Получить советы по закрытию сделки"""

    # Проверяем существование клиента
    client = await db.clients.find_one({"id": request.client_id, "user_id": user_id})  # type: ignore[func-returns-value]
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")

    # Пока что возвращаем заглушку
    tips = [
        "Создайте ощущение срочности: 'Завтра уезжаю, можем встретиться сегодня?'",
        "Предложите небольшую скидку при быстром решении",
        "Покажите заинтересованность других покупателей",
        "Подчеркните уникальные преимущества товара",
    ]

    return AIResponse(
        response="Вот несколько советов для закрытия сделки:", suggestions=tips
    )


@router.post("/analyze-listing", response_model=AIResponse)
async def analyze_listing(
    request: ListingAnalysisRequest, user_id: str = Depends(get_user_id)
) -> AIResponse:
    """Анализ объявления и предложения по улучшению"""

    # Пока что возвращаем заглушку
    # В будущем здесь будет анализ текста через AI
    analysis = "Объявление выглядит хорошо, но можно улучшить:"
    suggestions = [
        "Добавьте больше фотографий товара",
        "Укажите точное местоположение",
        "Добавьте информацию о состоянии товара",
        "Используйте более привлекательные ключевые слова",
    ]

    return AIResponse(response=analysis, suggestions=suggestions)


@router.post("/generate-response")
async def generate_custom_response(
    request: AIRequest, user_id: str = Depends(get_user_id)
) -> Dict[str, str]:
    """Генерация кастомного ответа по запросу"""

    # Пока что возвращаем заглушку
    # В будущем здесь будет полноценная интеграция с OpenAI

    prompt = request.prompt.lower()

    if "цена" in prompt or "стоимость" in prompt:
        response = "Цена указана в объявлении. Готовы рассмотреть разумные предложения."
    elif "встреча" in prompt or "посмотреть" in prompt:
        response = "Конечно! Могу показать товар. Когда вам будет удобно встретиться?"
    elif "состояние" in prompt or "качество" in prompt:
        response = "Товар в отличном состоянии, готов к использованию."
    else:
        response = (
            "Спасибо за интерес к объявлению! Готов ответить на все ваши вопросы."
        )

    return {"response": response}


@router.get("/settings")
async def get_ai_settings(user_id: str = Depends(get_user_id)) -> Dict[str, Any]:  # type: ignore[func-returns-value]
    """Получить настройки AI-ассистента"""

    # Получаем настройки из БД или возвращаем дефолтные
    settings = await db.ai_settings.find_one({"user_id": user_id})  # type: ignore[func-returns-value]

    if not settings:
        settings = {
            "enabled": False,
            "auto_suggest": True,
            "language": "ru",
            "response_tone": "professional",
            "api_key_configured": False,
        }

    return settings


@router.post("/settings")
async def update_ai_settings(settings: Dict[str, Any], user_id: str = Depends(get_user_id)) -> Dict[str, str]:
    """Обновить настройки AI-ассистента"""

    settings["user_id"] = user_id
    settings["updated_at"] = "datetime.utcnow()"

    await db.ai_settings.update_one(
        {"user_id": user_id}, {"$set": settings}, upsert=True
    )

    return {"message": "Settings updated successfully"}
