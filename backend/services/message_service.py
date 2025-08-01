from motor.motor_asyncio import AsyncIOMotorCollection
from backend.models.message import Message, MessageCreate, MessageResponse
from typing import List, Optional
from datetime import datetime, timedelta

class MessageService:
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create_message(self, message_data: MessageCreate, user_id: str) -> Message:
        message = Message(**message_data.model_dump(), user_id=user_id)
        await self.collection.insert_one(message.model_dump())
        return message

    async def get_client_messages(self, client_id: str, user_id: str, limit: int = 100) -> List[Message]:
        cursor = self.collection.find(
            {"client_id": client_id, "user_id": user_id}
        ).sort("timestamp", 1).limit(limit)
        
        messages = await cursor.to_list(length=limit)
        return [Message(**message) for message in messages]

    async def send_response(self, response_data: MessageResponse, user_id: str) -> Message:
        """Отправляет ответ клиенту"""
        message_data = MessageCreate(
            client_id=response_data.client_id,
            content=response_data.content,
            message_type="outgoing",
            source="system"
        )
        return await self.create_message(message_data, user_id)

    async def mark_as_read(self, message_id: str, user_id: str) -> bool:
        result = await self.collection.update_one(
            {"id": message_id, "user_id": user_id},
            {"$set": {"is_read": True}}
        )
        return result.modified_count > 0

    async def get_unread_count(self, user_id: str) -> int:
        """Получает количество непрочитанных сообщений"""
        return await self.collection.count_documents({
            "user_id": user_id,
            "message_type": "incoming",
            "is_read": False
        })

    async def get_recent_messages(self, user_id: str, limit: int = 50) -> List[Message]:
        """Получает последние сообщения для unified inbox"""
        cursor = self.collection.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(limit)
        
        messages = await cursor.to_list(length=limit)
        return [Message(**message) for message in messages]

    async def search_messages(self, user_id: str, query: str, limit: int = 50) -> List[Message]:
        """Поиск по сообщениям"""
        cursor = self.collection.find({
            "user_id": user_id,
            "$text": {"$search": query}
        }).sort("timestamp", -1).limit(limit)
        
        messages = await cursor.to_list(length=limit)
        return [Message(**message) for message in messages]
