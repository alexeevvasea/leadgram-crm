from motor.motor_asyncio import AsyncIOMotorCollection
from backend.models.client import Client, ClientCreate, ClientUpdate, ClientStatus
from typing import List, Optional, Dict
from datetime import datetime, timedelta


class ClientService:
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create_client(self, client_data: ClientCreate, user_id: str) -> Client:
        client = Client(**client_data.model_dump(), user_id=user_id)
        await self.collection.insert_one(client.model_dump())
        return client

    async def get_clients(
        self,
        user_id: str,
        status: Optional[ClientStatus] = None,
        source: Optional[str] = None,
        limit: int = 50,
    ) -> List[Client]:
        filter_query = {"user_id": user_id}

        if status:
            filter_query["status"] = status
        if source:
            filter_query["source"] = source

        cursor = self.collection.find(filter_query).sort("updated_at", -1).limit(limit)
        clients = await cursor.to_list(length=limit)
        return [Client(**client) for client in clients]

    async def get_client(self, client_id: str, user_id: str) -> Optional[Client]:
        client = await self.collection.find_one({"id": client_id, "user_id": user_id})
        return Client(**client) if client else None

    async def update_client(
        self, client_id: str, user_id: str, update_data: ClientUpdate
    ) -> Optional[Client]:
        update_dict = {
            k: v for k, v in update_data.model_dump().items() if v is not None
        }
        update_dict["updated_at"] = datetime.utcnow()

        result = await self.collection.update_one(
            {"id": client_id, "user_id": user_id}, {"$set": update_dict}
        )

        if result.modified_count:
            return await self.get_client(client_id, user_id)
        return None

    async def update_last_message(self, client_id: str, user_id: str):
        """Обновляет время последнего сообщения и счетчик"""
        await self.collection.update_one(
            {"id": client_id, "user_id": user_id},
            {
                "$set": {
                    "last_message_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                },
                "$inc": {"messages_count": 1},
            },
        )

    async def get_recent_chats(self, user_id: str, limit: int = 10) -> List[Client]:
        """Получает последние активные чаты"""
        cursor = (
            self.collection.find(
                {"user_id": user_id, "last_message_at": {"$exists": True}}
            )
            .sort("last_message_at", -1)
            .limit(limit)
        )

        clients = await cursor.to_list(length=limit)
        return [Client(**client) for client in clients]

    async def get_dashboard_stats(self, user_id: str) -> Dict:
        """Получает статистику для дашборда"""
        now = datetime.utcnow()
        day_ago = now - timedelta(hours=24)

        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        ]

        status_counts = {}
        async for result in self.collection.aggregate(pipeline):
            status_counts[result["_id"]] = result["count"]

        # Новые лиды за 24 часа
        new_leads = await self.collection.count_documents(
            {"user_id": user_id, "created_at": {"$gte": day_ago}}
        )

        # Активные чаты (с сообщениями за 24 часа)
        active_chats = await self.collection.count_documents(
            {"user_id": user_id, "last_message_at": {"$gte": day_ago}}
        )

        return {
            "new_leads": new_leads,
            "pending_attention": status_counts.get("new", 0),
            "active_chats": active_chats,
            "completed_sales": status_counts.get("closed", 0),
        }
