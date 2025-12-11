# backend/app/main.py

from fastapi import FastAPI, WebSocket
from app.database import Base, engine
from app.websocket_manager import WebSocketManager
from app.routers import teams, members, laps
from app.routers.ws_docs import router as ws_docs_router
from app.routers.ws_timer import router as ws_timer_router

Base.metadata.create_all(bind=engine)  # 🔥 automatikus DB létrehozás

app = FastAPI(
    title="Realtime Race Timer API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(teams.router)
app.include_router(members.router)
app.include_router(laps.router)
app.include_router(ws_docs_router)
app.include_router(ws_timer_router)

manager = WebSocketManager()

@app.websocket("/ws/member/{member_id}")
async def ws_member(websocket: WebSocket, member_id: int):
    await manager.connect(websocket, member_id)

    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(member_id)
