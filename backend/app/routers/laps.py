from fastapi import APIRouter, HTTPException
from app.database import database
from app.models import laps
from app.schemas import LapCreate, LapOut
from app.websocket_manager import manager

router = APIRouter(prefix="/laps", tags=["Laps"])

# ▶ kör hozzáadás
@router.post("/add")
async def add_lap(payload: LapCreate):
    query = laps.insert().values(
        team_id=payload.team_id,
        lap_number=payload.lap_number,
        time_ms=payload.time_ms,
    )
    lap_id = await database.execute(query)

    await manager.broadcast(payload.team_id, {
        "event": "new_lap",
        **payload.dict()
    })

    return {"status": "ok", "lap_id": lap_id}


# ▶ összes kör
@router.get("/", response_model=list[LapOut])
async def get_all_laps():
    query = laps.select().order_by(laps.c.timestamp.desc())
    return await database.fetch_all(query)


# ▶ adott csapat összes köre
@router.get("/team/{team_id}", response_model=list[LapOut])
async def get_laps_by_team(team_id: int):
    query = laps.select().where(laps.c.team_id == team_id).order_by(laps.c.lap_number)
    return await database.fetch_all(query)


# ▶ adott csapat utolsó köre
@router.get("/latest/{team_id}", response_model=LapOut)
async def get_latest_lap(team_id: int):
    query = laps.select().where(laps.c.team_id == team_id).order_by(laps.c.id.desc())
    lap = await database.fetch_one(query)
    if not lap:
        raise HTTPException(404, "No laps found for this team")
    return lap


# ▶ adott csapat legjobb köre
@router.get("/best/{team_id}", response_model=LapOut)
async def get_best_lap(team_id: int):
    query = laps.select().where(laps.c.team_id == team_id).order_by(laps.c.time_ms.asc())
    lap = await database.fetch_one(query)
    if not lap:
        raise HTTPException(404, "No laps found for this team")
    return lap


# ▶ adott csapat körök törlése (reset)
@router.delete("/team/{team_id}")
async def delete_laps_by_team(team_id: int):
    query = laps.delete().where(laps.c.team_id == team_id)
    await database.execute(query)
    return {"status": "laps cleared"}
