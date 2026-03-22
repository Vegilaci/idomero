# backend/app/routers/laps.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/laps", tags=["Laps"])

@router.get("/", response_model=list[schemas.Lap])
def list_laps(db: Session = Depends(get_db)):
    return db.query(models.Lap).all()
