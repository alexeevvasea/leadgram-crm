import asyncio
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))

from backend.services.client_service import ClientService
from backend.models.client import ClientCreate, ClientUpdate, MessageSource, ClientStatus

class FakeCursor:
    def __init__(self, docs):
        self.docs = docs
        self._limit = None

    def sort(self, field, direction):
        reverse = direction == -1
        self.docs.sort(key=lambda x: x.get(field), reverse=reverse)
        return self

    def limit(self, limit):
        self._limit = limit
        return self

    async def to_list(self, length=None):
        if length is None:
            length = self._limit
        return self.docs[:length]

class FakeCollection:
    def __init__(self):
        self.docs = []

    async def insert_one(self, doc):
        self.docs.append(doc)

    def _matches(self, doc, query):
        return all(doc.get(k) == v for k, v in query.items())

    def find(self, query):
        matched = [d.copy() for d in self.docs if self._matches(d, query)]
        return FakeCursor(matched)

    async def find_one(self, query):
        for doc in self.docs:
            if self._matches(doc, query):
                return doc.copy()
        return None

    async def update_one(self, query, update):
        for doc in self.docs:
            if self._matches(doc, query):
                for k, v in update.get("$set", {}).items():
                    doc[k] = v
                for k, v in update.get("$inc", {}).items():
                    doc[k] = doc.get(k, 0) + v
                class Result:
                    modified_count = 1
                return Result()
        class Result:
            modified_count = 0
        return Result()

    async def count_documents(self, query):
        return len([d for d in self.docs if self._matches(d, query)])


def run(coro):
    return asyncio.get_event_loop().run_until_complete(coro)


def test_create_and_get_client():
    collection = FakeCollection()
    service = ClientService(collection)
    client_data = ClientCreate(name="Alice", source=MessageSource.TELEGRAM)
    created = run(service.create_client(client_data, user_id="1"))
    fetched = run(service.get_client(created.id, user_id="1"))
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.name == "Alice"


def test_get_clients_filters():
    collection = FakeCollection()
    service = ClientService(collection)
    run(service.create_client(ClientCreate(name="A", source=MessageSource.TELEGRAM), user_id="1"))
    run(service.create_client(ClientCreate(name="B", source=MessageSource.OLX, listing_title="ad"), user_id="1"))
    run(service.create_client(ClientCreate(name="C", source=MessageSource.TELEGRAM), user_id="2"))

    clients = run(service.get_clients(user_id="1"))
    assert len(clients) == 2

    olx_clients = run(service.get_clients(user_id="1", source=MessageSource.OLX))
    assert len(olx_clients) == 1


def test_update_client():
    collection = FakeCollection()
    service = ClientService(collection)
    created = run(service.create_client(ClientCreate(name="Old", source=MessageSource.TELEGRAM), user_id="1"))

    updated = run(service.update_client(created.id, "1", ClientUpdate(name="New", status=ClientStatus.CLOSED)))
    assert updated is not None
    assert updated.name == "New"
    assert updated.status == ClientStatus.CLOSED
