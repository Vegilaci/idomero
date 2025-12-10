from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TeamCreate(BaseModel):
    name: str
    preferred_laps: Optional[int] = None

class TeamOut(BaseModel):
    id: int
    name: str
    preferred_laps: Optional[int]

class LapCreate(BaseModel):
    team_id: int
    lap_number: int
    time_ms: int

class LapOut(BaseModel):
    id: int
    team_id: int
    lap_number: int
    time_ms: int
    timestamp: datetime
