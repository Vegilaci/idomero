# backend/app/schemas.py

from pydantic import BaseModel
from typing import List, Optional


class LapBase(BaseModel):
    time_ms: int


class LapCreate(LapBase):
    pass


class Lap(LapBase):
    id: int
    lap_no: int

    class Config:
        orm_mode = True


class MemberBase(BaseModel):
    name: str


class MemberCreate(MemberBase):
    team_id: int
    rajt_szam: int


class Member(MemberBase):
    id: int
    rajt_szam: int
    team_id: int
    laps: List[Lap] = []

    class Config:
        orm_mode = True

class MemberSummary(BaseModel):
    id: int
    name: str
    rajt_szam: int

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

class Team_versenyzok(BaseModel):
    id: int
    name: str
    members : List[MemberSummary] = []

    class Config:
        orm_mode = True


class TeamSummary(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True
