import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import uuid

# Подключение к MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'leadgram_db')]

async def create_demo_data():
    """Создает демо-данные для тестирования"""
    
    # Очистка существующих данных
    await db.clients.delete_many({})
    await db.messages.delete_many({})
    await db.listings.delete_many({})
    await db.integrations.delete_many({})
    await db.automations.delete_many({})
    
    user_id = "123456789"  # Тестовый пользователь
    
    # Создание клиентов
    clients = [
        {
            "id": str(uuid.uuid4()),
            "name": "Александр Дмитриев",
            "phone": "+7 (999) 123-45-67",
            "source": "telegram",
            "status": "new",
            "listing_id": "listing_1",
            "listing_title": "Laptop for sale",
            "created_at": datetime.utcnow() - timedelta(minutes=15),
            "updated_at": datetime.utcnow() - timedelta(minutes=15),
            "last_message_at": datetime.utcnow() - timedelta(minutes=15),
            "messages_count": 3,
            "user_id": user_id
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Мария Иванова",
            "phone": "+7 (999) 234-56-78",
            "source": "whatsapp",
            "status": "in_progress",
            "listing_id": "listing_2",
            "listing_title": "Bike in good condition",
            "created_at": datetime.utcnow() - timedelta(minutes=30),
            "updated_at": datetime.utcnow() - timedelta(minutes=30),
            "last_message_at": datetime.utcnow() - timedelta(minutes=30),
            "messages_count": 5,
            "user_id": user_id
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Габриэль Иаков",
            "phone": "+7 (999) 345-67-89",
            "source": "olx",
            "status": "new",
            "listing_id": "listing_3",
            "listing_title": "Gaming mouse",
            "created_at": datetime.utcnow() - timedelta(hours=1),
            "updated_at": datetime.utcnow() - timedelta(hours=1),
            "last_message_at": datetime.utcnow() - timedelta(hours=1),
            "messages_count": 1,
            "user_id": user_id
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Елена Попа",
            "phone": "+7 (999) 456-78-90",
            "source": "telegram",
            "status": "closed",
            "listing_id": "listing_4",
            "listing_title": "Smartphone with accessories",
            "created_at": datetime.utcnow() - timedelta(hours=2),
            "updated_at": datetime.utcnow() - timedelta(hours=2),
            "last_message_at": datetime.utcnow() - timedelta(hours=2),
            "messages_count": 8,
            "user_id": user_id
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Дмитрий Петров",
            "phone": "+7 (999) 567-89-01",
            "source": "olx",
            "status": "new",
            "listing_id": "listing_5",
            "listing_title": "Sofa set",
            "created_at": datetime.utcnow() - timedelta(hours=3),
            "updated_at": datetime.utcnow() - timedelta(hours=3),
            "last_message_at": datetime.utcnow() - timedelta(hours=3),
            "messages_count": 2,
            "user_id": user_id
        }
    ]
    
    # Вставка клиентов
    await db.clients.insert_many(clients)
    
    # Создание сообщений
    messages = []
    for i, client in enumerate(clients):
        client_id = client["id"]
        
        # Создаем несколько сообщений для каждого клиента
        for j in range(client["messages_count"]):
            if j % 2 == 0:  # Входящие сообщения
                messages.append({
                    "id": str(uuid.uuid4()),
                    "client_id": client_id,
                    "content": f"Привет! Интересует {client['listing_title']}. Можно встретиться?",
                    "message_type": "incoming",
                    "source": client["source"],
                    "timestamp": datetime.utcnow() - timedelta(minutes=60-j*10),
                    "is_read": j > 0,
                    "user_id": user_id
                })
            else:  # Исходящие сообщения
                messages.append({
                    "id": str(uuid.uuid4()),
                    "client_id": client_id,
                    "content": f"Здравствуйте! Да, товар доступен. Когда удобно встретиться?",
                    "message_type": "outgoing",
                    "source": "system",
                    "timestamp": datetime.utcnow() - timedelta(minutes=60-j*10-5),
                    "is_read": True,
                    "user_id": user_id
                })
    
    # Вставка сообщений
    await db.messages.insert_many(messages)
    
    # Создание объявлений
    listings = [
        {
            "id": "listing_1",
            "title": "Laptop for sale",
            "description": "Powerful laptop in excellent condition",
            "price": 50000,
            "status": "attention_needed",
            "source": "telegram",
            "created_at": datetime.utcnow() - timedelta(days=1),
            "updated_at": datetime.utcnow() - timedelta(hours=1),
            "user_id": user_id,
            "messages_48h": 8,
            "responses_count": 2,
            "last_response_at": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "id": "listing_2",
            "title": "Bike in good condition",
            "description": "Mountain bike, rarely used",
            "price": 25000,
            "status": "active",
            "source": "olx",
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow() - timedelta(hours=2),
            "user_id": user_id,
            "messages_48h": 3,
            "responses_count": 3,
            "last_response_at": datetime.utcnow() - timedelta(hours=1)
        }
    ]
    
    # Вставка объявлений
    await db.listings.insert_many(listings)
    
    # Создание интеграций
    integrations = [
        {
            "id": str(uuid.uuid4()),
            "name": "Telegram Bot",
            "type": "telegram",
            "status": "active",
            "config": {"bot_token": "demo_token", "webhook_url": "https://example.com/webhook"},
            "created_at": datetime.utcnow() - timedelta(days=1),
            "user_id": user_id
        },
        {
            "id": str(uuid.uuid4()),
            "name": "WhatsApp Business",
            "type": "whatsapp",
            "status": "inactive",
            "config": {"phone_number": "+1234567890"},
            "created_at": datetime.utcnow() - timedelta(days=2),
            "user_id": user_id
        }
    ]
    
    # Вставка интеграций
    await db.integrations.insert_many(integrations)
    
    print("✅ Демо-данные созданы успешно!")
    print(f"📊 Создано:")
    print(f"   - Клиентов: {len(clients)}")
    print(f"   - Сообщений: {len(messages)}")
    print(f"   - Объявлений: {len(listings)}")
    print(f"   - Интеграций: {len(integrations)}")

if __name__ == "__main__":
    asyncio.run(create_demo_data())
