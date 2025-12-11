from fastapi import APIRouter, WebSocket
from app.ws.connection_manager import manager

router = APIRouter()

@router.websocket("/ws/team/{team_id}")
async def websocket_team(websocket: WebSocket, team_id: str):
    await manager.connect(team_id, websocket)

    try:
        while True:
            # csak keepalive — backend küld eventeket
            await websocket.receive_text()
    except:
        pass
    finally:
        manager.disconnect(team_id, websocket)
