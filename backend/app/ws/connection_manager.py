import asyncio
import time
import json
from on_click_event.switch_active_riders import switch_active_riders_onStart,switch_on_stop, on_reset
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

    # -------- WS kezelés --------

    async def connect(self, team_id: str, websocket: WebSocket):
        await websocket.accept()

        if team_id not in self.active_rooms:
            self.active_rooms[team_id] = []

        self.active_rooms[team_id].append(websocket)

        try:
            await websocket.send_json(self.get_state(team_id))
        except WebSocketDisconnect:
            # kliens már bontott
            self.disconnect(team_id, websocket)
        except Exception:
            self.disconnect(team_id, websocket)


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

        for ws in list(self.active_rooms[team_id]):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(team_id, ws)

    # -------- Stopper logika --------
    def get_state(self, team_id: str) -> dict:
        sw = self.stopwatches.get(team_id)

        if not sw:
            return {
                "event": "state",
                "is_running": False,
                "elapsed_s": 0
            }

        if sw.running:
            elapsed = time.monotonic() - sw.start_time + sw.elapsed
        else:
            elapsed = sw.elapsed

        return {
            "event": "state",
            "is_running": sw.running,
            "elapsed_s": int(elapsed)
        }

    async def _run_stopwatch(self, team_id: str):
        """
        Háttér task, ami 100 ms-onként broadcastol
        """
        sw = self.stopwatches[team_id]

        while sw.running:
            elapsed = time.monotonic() - sw.start_time + sw.elapsed

            await self.broadcast(team_id, {
                "event": "tick",
                "is_running": sw.running,
                "elapsed_s": int(elapsed)
            })

            await asyncio.sleep(1)

    async def start_stopwatch(self, team_id: str, switch_active_rider: bool = True):
        if team_id not in self.stopwatches:
            self.stopwatches[team_id] = TeamStopwatch()

        sw = self.stopwatches[team_id]

        if switch_active_rider:
            switch_active_riders_onStart(int(team_id))


        if sw.running:
            return

        sw.running = True
        sw.start_time = time.monotonic()
        sw.task = asyncio.create_task(self._run_stopwatch(team_id))

        await self.broadcast(team_id, {
            "event": "started"
        })

        await self.broadcast(team_id, {
            "event": "refresh"
        })

    async def stop_stopwatch(self, team_id: str):
        sw = self.stopwatches.get(team_id)
        if not sw or not sw.running:
            return

        elapsed_before_stop = time.monotonic() - sw.start_time + sw.elapsed

        sw.running = False
        sw.elapsed = elapsed_before_stop

        # Stopnál elmentjük az aktuális versenyző idejét, majd váltunk a következőre.
        on_reset(int(team_id), int(elapsed_before_stop))

        switch_on_stop(int(team_id))

        sw.running = False
        sw.elapsed = 0.0

        if sw.task:
            sw.task.cancel()
            sw.task = None

        await self.broadcast(team_id, {
            "event": "stopped",
                "elapsed_s": int(sw.elapsed)
        })

        await self.broadcast(team_id, {
            "event": "refresh"
        })

        await self.start_stopwatch(team_id, switch_active_rider=False)

    async def reset_stopwatch(self, team_id: str):
        if team_id not in self.stopwatches:
            self.stopwatches[team_id] = TeamStopwatch()

        sw = self.stopwatches[team_id]

        # Compute the live elapsed value before resetting.
        if sw.running:
            elapsed_before_reset = time.monotonic() - sw.start_time + sw.elapsed
        else:
            elapsed_before_reset = sw.elapsed

        print(f"reset_gom megnyomva ennyi aaz ido jelenleg {elapsed_before_reset}", flush=True)

        # Resetnél elmentjük az aktív versenyző jelenlegi idejét a DB-be (ms-ban).
        on_reset(int(team_id), int(elapsed_before_reset))

        if sw.task:
            sw.task.cancel()
            sw.task = None

        sw.running = False
        sw.elapsed = 0.0

        await self.broadcast(team_id, {
            "event": "reset",
                "elapsed_s": 0
        })

        await self.broadcast(team_id, {
            "event": "refresh"
        })

        # Reset után azonnal újraindítjuk a stoppert.
        await self.start_stopwatch(team_id, switch_active_rider=False)
    async def kill_stopwatch(self, team_id: str):
        sw = self.stopwatches.get(team_id)
        if not sw:
            return

        sw.running = False
        sw.elapsed = 0.0

        if sw.task:
            sw.task.cancel()
            sw.task = None

        await self.broadcast(team_id, {
            "event": "killed"
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
            elif action == "kill": # teljes stopper stop ha vége a versenynek
                await manager.kill_stopwatch(team_id)
                break

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(team_id, websocket)
