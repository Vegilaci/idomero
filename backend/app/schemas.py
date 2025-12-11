# backend/app/schemas.py

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class LapBase(BaseModel):
    time_ms: int


class LapCreate(LapBase):
    pass


class Lap(LapBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class MemberBase(BaseModel):
    name: str


class MemberCreate(MemberBase):
    team_id: int


class Member(MemberBase):
    id: int
    team_id: int
    created_at: datetime
    laps: List[Lap] = []

    class Config:
        orm_mode = True


class TeamBase(BaseModel):
    name: str


class TeamCreate(TeamBase):
    pass


class Team(TeamBase):
    id: int
    members: List[Member] = []

    class Config:
        orm_mode = True
