from motor.motor_asyncio import AsyncIOMotorCollection
from typing import List, Dict
from backend.models.message import MessageType
from datetime import datetime, timedelta


class AttentionService:
    def __init__(
        self,
        client_collection: AsyncIOMotorCollection,
        message_collection: AsyncIOMotorCollection,
        listing_collection: AsyncIOMotorCollection,
    ):
        self.client_collection = client_collection
        self.message_collection = message_collection
        self.listing_collection = listing_collection

    async def get_listings_requiring_attention(self, user_id: str) -> List[Dict]:
        """Находит объявления, требующие внимания"""
        now = datetime.utcnow()
        two_days_ago = now - timedelta(hours=48)
        one_day_ago = now - timedelta(hours=24)

        attention_listings = []

        # 1. Объявления с большим количеством входящих сообщений (>5 за 48ч)
        pipeline_high_volume = [
            {
                "$match": {
                    "user_id": user_id,
                    "timestamp": {"$gte": two_days_ago},
                    "message_type": MessageType.INCOMING.value,
                }
            },
            {
                "$lookup": {
                    "from": "clients",
                    "localField": "client_id",
                    "foreignField": "id",
                    "as": "client",
                }
            },
            {"$unwind": "$client"},
            {
                "$group": {
                    "_id": "$client.listing_id",
                    "listing_title": {"$first": "$client.listing_title"},
                    "incoming_count": {"$sum": 1},
                    "clients": {"$addToSet": "$client"},
                }
            },
            {"$match": {"incoming_count": {"$gt": 5}}},
        ]

        async for result in self.message_collection.aggregate(pipeline_high_volume):
            if result["_id"]:  # Только если есть listing_id
                attention_listings.append(
                    {
                        "listing_id": result["_id"],
                        "listing_title": result["listing_title"],
                        "reason": "high_volume",
                        "details": f"Много входящих сообщений: {result['incoming_count']} за 48ч",
                        "incoming_count": result["incoming_count"],
                    }
                )

        # 2. Объявления с малым количеством ответов (<1 ответ на >3 входящих)
        pipeline_low_response = [
            {"$match": {"user_id": user_id, "timestamp": {"$gte": two_days_ago}}},
            {
                "$lookup": {
                    "from": "clients",
                    "localField": "client_id",
                    "foreignField": "id",
                    "as": "client",
                }
            },
            {"$unwind": "$client"},
            {
                "$group": {
                    "_id": {
                        "listing_id": "$client.listing_id",
                        "message_type": "$message_type",
                    },
                    "listing_title": {"$first": "$client.listing_title"},
                    "count": {"$sum": 1},
                }
            },
            {
                "$group": {
                    "_id": "$_id.listing_id",
                    "listing_title": {"$first": "$listing_title"},
                    "messages": {
                        "$push": {"type": "$_id.message_type", "count": "$count"}
                    },
                }
            },
        ]

        async for result in self.message_collection.aggregate(pipeline_low_response):
            if not result["_id"]:  # Пропускаем записи без listing_id
                continue

            incoming = 0
            outgoing = 0

            for msg in result["messages"]:
                if msg["type"] == MessageType.INCOMING.value:
                    incoming = msg["count"]
                elif msg["type"] == MessageType.OUTGOING.value:
                    outgoing = msg["count"]

            # Если входящих >3, а ответов <1
            if incoming > 3 and outgoing < 1:
                attention_listings.append(
                    {
                        "listing_id": result["_id"],
                        "listing_title": result["listing_title"],
                        "reason": "low_response",
                        "details": f"Мало ответов: {outgoing} ответов на {incoming} сообщений",
                        "incoming_count": incoming,
                        "outgoing_count": outgoing,
                    }
                )

        # 3. Клиенты без ответа >24 часов
        clients_no_response = await self.client_collection.find(
            {
                "user_id": user_id,
                "last_message_at": {"$lt": one_day_ago},
                "status": {"$ne": "closed"},
            }
        ).to_list(length=100)

        for client in clients_no_response:
            if client.get("listing_id"):
                attention_listings.append(
                    {
                        "listing_id": client["listing_id"],
                        "listing_title": client.get("listing_title", "Без названия"),
                        "reason": "no_recent_activity",
                        "details": "Нет активности >24 часов",
                        "client_name": client.get("name", "Неизвестный"),
                    }
                )

        # Удаляем дубликаты по listing_id
        seen = set()
        unique_listings = []
        for listing in attention_listings:
            if listing["listing_id"] not in seen:
                seen.add(listing["listing_id"])
                unique_listings.append(listing)

        return unique_listings[:10]  # Возвращаем топ-10

    async def get_attention_summary(self, user_id: str) -> Dict:
        """Получает краткую сводку для дашборда"""
        attention_listings = await self.get_listings_requiring_attention(user_id)

        reasons_count = {}
        for listing in attention_listings:
            reason = listing["reason"]
            reasons_count[reason] = reasons_count.get(reason, 0) + 1

        return {
            "total_listings": len(attention_listings),
            "reasons": reasons_count,
            "top_listing": attention_listings[0] if attention_listings else None,
        }
