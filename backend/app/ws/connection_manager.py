import asyncio
import time
import json
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

# =========================
# Stopper adatmodell
# =========================

class TeamStopwatch:
    def __init__(self):
        self.running: bool = False
        self.start_time: float = 0.0
        self.elapsed: float = 0.0
        self.task: Optional[asyncio.Task] = None


# =========================
# WebSocket Connection Manager
# =========================

class ConnectionManager:
    def __init__(self):
        # team_id -> websocket lista
        self.active_rooms: Dict[str, List[WebSocket]] = {}

        # team_id -> stopper
        self.stopwatches: Dict[str, TeamStopwatch] = {}
        # stats
        # per_team: team_id -> {bytes_sent, messages_sent}
        self.stats: Dict[str, Dict] = {
            "per_team": {},
            "total_bytes": 0,
            "total_messages": 0,
            "start_time": time.time(),
        }

    # -------- WS kezelés --------

    async def connect(self, team_id: str, websocket: WebSocket):
        await websocket.accept()

        if team_id not in self.active_rooms:
            self.active_rooms[team_id] = []

        self.active_rooms[team_id].append(websocket)

    def disconnect(self, team_id: str, websocket: WebSocket):
        if team_id in self.active_rooms:
            if websocket in self.active_rooms[team_id]:
                self.active_rooms[team_id].remove(websocket)

            # ha már senki nincs bent → room törlés
            if not self.active_rooms[team_id]:
                del self.active_rooms[team_id]

    async def broadcast(self, team_id: str, message: dict):
        if team_id not in self.active_rooms:
            return

        # prepare JSON bytes to estimate size
        try:
            payload_bytes = json.dumps(message, separators=(",", ":")).encode("utf-8")
            size = len(payload_bytes)
        except Exception:
            size = 0

        # update stats for team
        team_stats = self.stats["per_team"].setdefault(team_id, {"bytes_sent": 0, "messages_sent": 0})
        team_stats["bytes_sent"] += size
        team_stats["messages_sent"] += 1
        self.stats["total_bytes"] += size
        self.stats["total_messages"] += 1

        for ws in list(self.active_rooms[team_id]):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(team_id, ws)

    def get_stats(self):
        # return a copy-safe summary
        uptime = time.time() - self.stats.get("start_time", time.time())
        return {
            "uptime_s": int(uptime),
            "total_bytes": int(self.stats.get("total_bytes", 0)),
            "total_messages": int(self.stats.get("total_messages", 0)),
            "per_team": self.stats.get("per_team", {}),
        }

    def reset_stats(self):
        self.stats = {"per_team": {}, "total_bytes": 0, "total_messages": 0, "start_time": time.time()}

    # -------- Stopper logika --------

    async def _run_stopwatch(self, team_id: str):
        """
        Háttér task, ami 100 ms-onként broadcastol
        """
        sw = self.stopwatches[team_id]

        while sw.running:
            elapsed = time.monotonic() - sw.start_time + sw.elapsed

            await self.broadcast(team_id, {
                "event": "tick",
                    "elapsed_s": round(float(elapsed),3)
            })

            await asyncio.sleep(1)

    async def start_stopwatch(self, team_id: str):
        if team_id not in self.stopwatches:
            self.stopwatches[team_id] = TeamStopwatch()

        sw = self.stopwatches[team_id]

        if sw.running:
            return

        sw.running = True
        sw.start_time = time.monotonic()
        sw.task = asyncio.create_task(self._run_stopwatch(team_id))

        await self.broadcast(team_id, {
            "event": "started"
        })

    async def stop_stopwatch(self, team_id: str):
        sw = self.stopwatches.get(team_id)
        if not sw or not sw.running:
            return

        sw.running = False
        sw.elapsed += time.monotonic() - sw.start_time

        if sw.task:
            sw.task.cancel()
            sw.task = None

        await self.broadcast(team_id, {
            "event": "stopped",
                "elapsed_s": round(float(sw.elapsed))
        })

    async def reset_stopwatch(self, team_id: str):
        sw = self.stopwatches.get(team_id)
        if not sw:
            return

        sw.running = False
        sw.elapsed = 0.0

        if sw.task:
            sw.task.cancel()
            sw.task = None

        await self.broadcast(team_id, {
            "event": "reset",
                "elapsed_s": 0
        })


# globális manager
manager = ConnectionManager()

# =========================
# WebSocket endpoint
# =========================

@app.websocket("/ws/timer/{team_id}")
async def ws_timer(websocket: WebSocket, team_id: str):
    await manager.connect(team_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            action = data.get("action")

            if action == "start":
                await manager.start_stopwatch(team_id)

            elif action == "stop":
                await manager.stop_stopwatch(team_id)

            elif action == "reset":
                await manager.reset_stopwatch(team_id)

    except WebSocketDisconnect:
        manager.disconnect(team_id, websocket)
