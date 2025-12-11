# backend/app/routers/laps.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/laps", tags=["Laps"])

@router.post("/{member_id}", response_model=schemas.Lap)
def add_lap(member_id: int, lap: schemas.LapCreate, db: Session = Depends(get_db)):
    db_lap = models.Lap(member_id=member_id, time_ms=lap.time_ms)
    db.add(db_lap)
    db.commit()
    db.refresh(db_lap)
    return db_lap

@router.get("/", response_model=list[schemas.Lap])
def list_laps(db: Session = Depends(get_db)):
    return db.query(models.Lap).all()
