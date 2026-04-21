from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ws.connection_manager import manager

router = APIRouter()

@router.websocket("/ws/team/{team_id}")
async def websocket_team(websocket: WebSocket, team_id: str):
    await manager.connect(team_id, websocket)

    try:
        while True:
            # fogadunk JSON üzeneteket: {"action":"start"|"stop"|"reset"}
            data = await websocket.receive_json()

            action = data.get("action")

            if action == "start":
                await manager.start_stopwatch(team_id)
            elif action == "stop":
                await manager.stop_stopwatch(team_id)
            elif action == "reset":
                await manager.reset_stopwatch(team_id)
            elif action == "kill":
                await manager.kill_stopwatch(team_id)
                break
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(team_id, websocket)
