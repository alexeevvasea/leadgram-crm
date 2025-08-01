import sys
from pathlib import Path

# Добавим путь к корню проекта (где лежит backend/)
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging

# Импорт роутеров
from backend.routers import (
    clients,
    messages,
    attention,
    integrations,
    ai_assistant,
    automation,
)

# Путь к .env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Подключение к MongoDB
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Инициализация FastAPI
app = FastAPI(
    title="Leadgram CRM API",
    description="Telegram WebApp CRM для продавцов",
    version="1.0.0",
)

# Префикс для API
api_router = APIRouter(prefix="/api")


# Health-check
@api_router.get("/")
async def root():
    return {"message": "Leadgram CRM API v1.0.0", "status": "running"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}


# Подключение роутеров
api_router.include_router(clients.router)
api_router.include_router(messages.router)
api_router.include_router(attention.router)
api_router.include_router(integrations.router)
api_router.include_router(ai_assistant.router)
api_router.include_router(automation.router)

# Добавление маршрутов
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Логирование
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Закрытие MongoDB при завершении
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
