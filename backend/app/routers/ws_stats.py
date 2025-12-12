from fastapi import APIRouter
from app.ws.connection_manager import manager

router = APIRouter()


@router.get("/ws/stats")
async def ws_stats():
    """Return WebSocket bandwidth/message stats."""
    return manager.get_stats()


@router.post("/ws/stats/reset")
async def ws_stats_reset():
    manager.reset_stats()
    return {"status": "ok"}
