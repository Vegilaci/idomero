from fastapi import APIRouter, HTTPException
from app.database import database
from app.models import teams
from app.schemas import TeamCreate, TeamOut

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("/", response_model=TeamOut)
async def create_team(payload: TeamCreate):
    query = teams.insert().values(
        name=payload.name, 
        preferred_laps=payload.preferred_laps
    )
    team_id = await database.execute(query)
    return { "id": team_id, **payload.dict() }

@router.get("/", response_model=list[TeamOut])
async def get_teams():
    query = teams.select()
    return await database.fetch_all(query)

@router.get("/{team_id}", response_model=TeamOut)
async def get_team(team_id: int):
    query = teams.select().where(teams.c.id == team_id)
    team = await database.fetch_one(query)
    if not team:
        raise HTTPException(404, "Team not found")
    return team

@router.delete("/{team_id}")
async def delete_team(team_id: int):
    query = teams.delete().where(teams.c.id == team_id)
    await database.execute(query)
    return {"status": "deleted"}
