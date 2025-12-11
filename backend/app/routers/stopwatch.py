from fastapi import APIRouter, HTTPException
from app.services.stopwatch_service import stopwatch_service
from app.ws.connection_manager import manager

router = APIRouter(prefix="/stopwatch")

@router.post("/{team_id}/start")
async def start_timer(team_id: str):
    data = stopwatch_service.start(team_id)
    await manager.broadcast(team_id, data)
    return data

@router.post("/{team_id}/stop")
async def stop_timer(team_id: str):
    data = stopwatch_service.stop(team_id)
    await manager.broadcast(team_id, data)
    return data

@router.post("/{team_id}/reset")
async def reset_timer(team_id: str):
    data = stopwatch_service.reset(team_id)
    await manager.broadcast(team_id, data)
    return data

@router.post("/{team_id}/lap")
async def lap_timer(team_id: str):
    try:
        data = stopwatch_service.lap(team_id)
        await manager.broadcast(team_id, data)
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
