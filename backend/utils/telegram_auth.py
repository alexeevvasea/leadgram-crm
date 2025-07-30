import hashlib
import hmac
import json
import time
from typing import Optional, Dict
from urllib.parse import parse_qs, unquote

class TelegramAuth:
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.secret_key = hashlib.sha256(bot_token.encode()).digest()

    def validate_init_data(self, init_data: str) -> Optional[Dict]:
        """
        Валидация данных от Telegram WebApp
        """
        try:
            parsed_data = parse_qs(init_data)
            
            # Извлекаем hash
            received_hash = parsed_data.get('hash', [None])[0]
            if not received_hash:
                return None
            
            # Создаем строку для проверки
            check_string_items = []
            for key, value in parsed_data.items():
                if key != 'hash':
                    check_string_items.append(f"{key}={value[0]}")
            
            check_string = '\n'.join(sorted(check_string_items))
            
            # Вычисляем hash
            calculated_hash = hmac.new(
                self.secret_key,
                check_string.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Проверяем hash
            if calculated_hash != received_hash:
                return None
            
            # Проверяем auth_date (данные не должны быть старше 24 часов)
            auth_date = parsed_data.get('auth_date', [None])[0]
            if auth_date:
                auth_timestamp = int(auth_date)
                current_timestamp = int(time.time())
                if current_timestamp - auth_timestamp > 86400:  # 24 часа
                    return None
            
            # Парсим пользовательские данные
            user_data = parsed_data.get('user', [None])[0]
            if user_data:
                user_info = json.loads(unquote(user_data))
                return {
                    'user_id': str(user_info.get('id')),
                    'username': user_info.get('username'),
                    'first_name': user_info.get('first_name'),
                    'last_name': user_info.get('last_name'),
                    'language_code': user_info.get('language_code'),
                    'auth_date': auth_date
                }
            
            return None
            
        except Exception as e:
            print(f"Telegram auth error: {e}")
            return None

    def create_mock_user(self, user_id: str = "123456789") -> Dict:
        """
        Создает mock пользователя для тестирования
        """
        return {
            'user_id': user_id,
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'language_code': 'en',
            'auth_date': str(int(time.time()))
        }
