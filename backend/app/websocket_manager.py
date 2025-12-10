from typing import Dict, List
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, team_id: int, websocket: WebSocket):
        await websocket.accept()
        if team_id not in self.connections:
            self.connections[team_id] = []
        self.connections[team_id].append(websocket)

    def disconnect(self, team_id: int, websocket: WebSocket):
        if team_id in self.connections:
            self.connections[team_id].remove(websocket)

    async def broadcast(self, team_id: int, message: dict):
        if team_id in self.connections:
            for ws in self.connections[team_id]:
                await ws.send_json(message)

# ---- >>> ADD THIS <<< ----
manager = WebSocketManager()
