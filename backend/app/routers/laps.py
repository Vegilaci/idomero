# backend/app/routers/laps.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/laps", tags=["Laps"])

@router.post("/{member_id}", response_model=schemas.Lap)
def add_lap(member_id: int, lap: schemas.LapCreate, db: Session = Depends(get_db)):
    existing_member = db.query(models.Member).filter(models.Member.id == member_id).first()

    if existing_member is None:
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT,
            detail="☕ I'm a teapot – nincs ilyen versenyző"
        )

    else:
        print(f"Adding lap for Member ID {member_id}.")


    max_lap_no = (
        db.query(func.max(models.Lap.lap_no))
        .filter(models.Lap.member_id == member_id)
        .scalar()
    )
    next_lap_no = (max_lap_no or 0) + 1
    db_lap = models.Lap(member_id=member_id, time_ms=lap.time_ms, lap_no=next_lap_no)
    db.add(db_lap)
    db.commit()
    db.refresh(db_lap)
    return db_lap

@router.get("/", response_model=list[schemas.Lap])
def list_laps(db: Session = Depends(get_db)):
    return db.query(models.Lap).all()
