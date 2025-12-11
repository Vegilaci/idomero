from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # team_id -> list of WebSocket connections
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, team_id: str, websocket: WebSocket):
        await websocket.accept()

        if team_id not in self.active_rooms:
            self.active_rooms[team_id] = []

        self.active_rooms[team_id].append(websocket)

    def disconnect(self, team_id: str, websocket: WebSocket):
        if team_id in self.active_rooms:
            self.active_rooms[team_id].remove(websocket)

            # ha üres a room → törölhetjük
            if len(self.active_rooms[team_id]) == 0:
                del self.active_rooms[team_id]

    async def broadcast(self, team_id: str, message: dict):
        if team_id in self.active_rooms:
            for ws in list(self.active_rooms[team_id]):
                try:
                    await ws.send_json(message)
                except:
                    # rossz kapcsolat eltávolítása
                    self.active_rooms[team_id].remove(ws)
