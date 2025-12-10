from fastapi import FastAPI, WebSocket
from app.database import database, metadata
from sqlalchemy import create_engine
from app.websocket_manager import WebSocketManager
from app.routers import teams, laps

engine = create_engine("sqlite:///./stopper.db")
metadata.create_all(engine)

app = FastAPI(
    title="Realtime Race Timer API",
    description="WebSocket alapú stopper rendszer csapatok és egyéni menők részére.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)
manager = WebSocketManager()

app.include_router(teams.router)
app.include_router(laps.router)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.websocket("/ws/{team_id}")
async def websocket_endpoint(websocket: WebSocket, team_id: int):
    await manager.connect(team_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(team_id, websocket)
