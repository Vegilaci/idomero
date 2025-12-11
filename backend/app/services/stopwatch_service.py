import time

class StopWatchService:
    def __init__(self):
        # team_id -> stopper state
        self.state = {}

    def ensure_team(self, team_id: str):
        if team_id not in self.state:
            self.state[team_id] = {
                "running": False,
                "start_time": None,
                "last_lap_time": None,
                "laps": []
            }

    def start(self, team_id: str):
        self.ensure_team(team_id)
        now = time.time()

        self.state[team_id]["running"] = True
        self.state[team_id]["start_time"] = now
        self.state[team_id]["last_lap_time"] = now

        return {"event": "started", "timestamp": now}

    def stop(self, team_id: str):
        self.ensure_team(team_id)
        self.state[team_id]["running"] = False

        return {"event": "stopped"}

    def reset(self, team_id: str):
        self.state[team_id] = {
            "running": False,
            "start_time": None,
            "last_lap_time": None,
            "laps": []
        }

        return {"event": "reset"}

    def lap(self, team_id: str):
        self.ensure_team(team_id)

        if not self.state[team_id]["running"]:
            raise ValueError("Stopper is not running")

        now = time.time()
        last = self.state[team_id]["last_lap_time"]

        lap_time_ms = int((now - last) * 1000)

        self.state[team_id]["last_lap_time"] = now

        return {
            "event": "new_lap",
            "time_ms": lap_time_ms,
            "timestamp": now
        }


stopwatch_service = StopWatchService()
