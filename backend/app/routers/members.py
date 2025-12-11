# backend/app/routers/members.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/members", tags=["Members"])

@router.post("/", response_model=schemas.Member)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    db_member = models.Member(name=member.name, team_id=member.team_id)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/", response_model=list[schemas.Member])
def list_members(db: Session = Depends(get_db)):
    return db.query(models.Member).all()
