from fastapi import Depends, HTTPException, Header
from typing import Optional, Dict
from backend.utils.telegram_auth import TelegramAuth
import os

telegram_auth = TelegramAuth(os.environ.get("TELEGRAM_BOT_TOKEN", "mock_token"))


async def get_current_user(
    x_telegram_init_data: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
) -> Dict:
    """
    Зависимость для получения текущего пользователя
    Поддерживает как Telegram WebApp, так и обычную авторизацию
    """

    # Для разработки - используем mock пользователя
    if os.environ.get("ENVIRONMENT") == "development":
        return telegram_auth.create_mock_user()

    # Проверяем Telegram WebApp данные
    if x_telegram_init_data:
        user_data = telegram_auth.validate_init_data(x_telegram_init_data)
        if user_data:
            return user_data

    # Проверяем Authorization header (для будущих интеграций)
    if authorization and authorization.startswith("Bearer "):
        # Здесь можно добавить JWT токен валидацию
        pass

    # Если ничего не подошло, возвращаем ошибку
    raise HTTPException(
        status_code=401, detail="Unauthorized: Invalid or missing authentication"
    )


async def get_user_id(current_user: Dict = Depends(get_current_user)) -> str:
    """
    Быстрый способ получить user_id для использования в эндпоинтах
    """
    return current_user["user_id"]
