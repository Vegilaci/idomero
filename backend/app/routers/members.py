from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/members", tags=["Members"])

@router.post("/", response_model=schemas.Member)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    existing_member = db.query(models.Member).filter(models.Member.name == member.name).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Member with this name already exists."
        )

    db_member = models.Member(name=member.name,rajt_szam = member.rajt_szam, team_id=member.team_id,)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.get("/", response_model=list[schemas.Member])
def list_members(db: Session = Depends(get_db)):
    return db.query(models.Member).all()

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found."
        )

    db.delete(db_member)
    db.commit()
