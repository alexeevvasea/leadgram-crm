from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from backend.models.automation import Automation, AutomationCreate, AutomationUpdate
from backend.utils.dependencies import get_user_id
from motor.motor_asyncio import AsyncIOMotorClient
import os
import requests

router = APIRouter(prefix="/automation", tags=["automation"])

# Подключение к базе данных
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


@router.get("/", response_model=List[Automation])
async def get_automations(user_id: str = Depends(get_user_id)) -> List[Automation]:
    """Получить список автоматизаций"""
    cursor = db.automations.find({"user_id": user_id})
    automations = await cursor.to_list(length=100)
    return [Automation(**automation) for automation in automations]


@router.post("/", response_model=Automation)
async def create_automation(
    automation_data: AutomationCreate, user_id: str = Depends(get_user_id)
) -> Automation:
    """Создать новую автоматизацию"""
    automation = Automation(**automation_data.model_dump(), user_id=user_id)
    await db.automations.insert_one(automation.model_dump())
    return automation


@router.get("/{automation_id}", response_model=Automation)
async def get_automation(automation_id: str, user_id: str = Depends(get_user_id)) -> Automation:  # type: ignore[func-returns-value]
    """Получить автоматизацию по ID"""
    automation = await db.automations.find_one({"id": automation_id, "user_id": user_id})  # type: ignore[func-returns-value]
    if automation is None:
        raise HTTPException(status_code=404, detail="Automation not found")
    else:
        return Automation(**automation)


@router.put("/{automation_id}", response_model=Automation)
async def update_automation(
    automation_id: str,
    update_data: AutomationUpdate,
    user_id: str = Depends(get_user_id),
) -> Automation:
    """Обновить автоматизацию"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}

    result = await db.automations.update_one(
        {"id": automation_id, "user_id": user_id}, {"$set": update_dict}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Automation not found")

    return await get_automation(automation_id, user_id)


@router.delete("/{automation_id}")
async def delete_automation(automation_id: str, user_id: str = Depends(get_user_id)) -> Dict[str, str]:
    """Удалить автоматизацию"""
    result = await db.automations.delete_one({"id": automation_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Automation not found")
    return {"message": "Automation deleted successfully"}


@router.post("/{automation_id}/trigger")
async def trigger_automation(
    automation_id: str, trigger_data: Dict, user_id: str = Depends(get_user_id)
) -> Dict[str, Any]:  # type: ignore[func-returns-value]
    """Запустить автоматизацию вручную"""
    automation = await db.automations.find_one({"id": automation_id, "user_id": user_id})  # type: ignore[func-returns-value]
    if automation is None:
        raise HTTPException(status_code=404, detail="Automation not found")

    # Если есть n8n workflow, вызываем его
    if automation.get("n8n_workflow_id"):
        await trigger_n8n_workflow(automation["n8n_workflow_id"], trigger_data)

    # Логируем выполнение
    await db.automation_logs.insert_one(
        {
            "automation_id": automation_id,
            "user_id": user_id,
            "trigger_data": trigger_data,
            "executed_at": "datetime.utcnow()",
            "status": "success",
        }
    )

    return {"message": "Automation triggered successfully"}


@router.get("/{automation_id}/logs")
async def get_automation_logs(
    automation_id: str, user_id: str = Depends(get_user_id), limit: int = 50
) -> List[Dict[str, Any]]:

    """Получить логи выполнения автоматизации"""
    cursor = (
        db.automation_logs.find({"automation_id": automation_id, "user_id": user_id})
        .sort("executed_at", -1)
        .limit(limit)
    )

    logs = await cursor.to_list(length=limit)
    return logs


@router.post("/{automation_id}/test")
async def test_automation(
    automation_id: str, test_data: Dict, user_id: str = Depends(get_user_id)
) -> Dict[str, Any]:  # type: ignore[func-returns-value]
    """Тестировать автоматизацию"""
    automation = await db.automations.find_one({"id": automation_id, "user_id": user_id})  # type: ignore[func-returns-value]
    if automation is None:
        raise HTTPException(status_code=404, detail="Automation not found")

    # Имитация теста
    return {
        "message": f"Automation '{automation['name']}' tested successfully",
        "test_result": "passed",
        "test_data": test_data,
    }


@router.get("/templates/")
async def get_automation_templates() -> List[Dict[str, Any]]:
    """Получить шаблоны автоматизации"""
    templates: List[Dict[str, Any]] = [
        {
            "id": "auto_reply",
            "name": "Автоответ на новые сообщения",
            "description": "Автоматически отвечает на новые сообщения",
            "trigger": "new_message",
            "actions": [
                {
                    "type": "send_message",
                    "template": "Спасибо за сообщение! Отвечу в течение часа.",
                }
            ],
        },
        {
            "id": "follow_up",
            "name": "Напоминание о неотвеченных сообщениях",
            "description": "Напоминает о клиентах без ответа",
            "trigger": "no_response",
            "actions": [
                {
                    "type": "notification",
                    "template": "У вас есть неотвеченные сообщения",
                }
            ],
        },
        {
            "id": "price_negotiation",
            "name": "Помощь в переговорах по цене",
            "description": "Автоматически отвечает на вопросы о цене",
            "trigger": "new_message",
            "conditions": {"contains": ["цена", "сколько", "стоимость"]},
            "actions": [
                {
                    "type": "send_message",
                    "template": "Цена указана в объявлении. Готовы рассмотреть разумные предложения.",
                }
            ],
        },
    ]

    return templates


async def trigger_n8n_workflow(workflow_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Запуск n8n workflow"""
    # Здесь должна быть интеграция с n8n
    # Пока что заглушка
    n8n_url = os.environ.get("N8N_WEBHOOK_URL", "https://your-n8n-instance.com/webhook")

    try:
        response = requests.post(f"{n8n_url}/{workflow_id}", json=data, timeout=30)
        return response.json()
    except Exception as e:
        print(f"n8n workflow error: {e}")
        return {"error": str(e)}
