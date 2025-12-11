# backend/app/websocket_manager.py

from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.connections = {}

    async def connect(self, websocket: WebSocket, member_id: int):
        await websocket.accept()
        self.connections[member_id] = websocket

    def disconnect(self, member_id: int):
        if member_id in self.connections:
            del self.connections[member_id]

    async def send_lap(self, member_id: int, data):
        if member_id in self.connections:
            await self.connections[member_id].send_json(data)