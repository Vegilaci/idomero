from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, load_only
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/teams", tags=["Teams"])

@router.post("/", response_model=schemas.Team)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db)):
    db_team = models.Team(name=team.name)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get("/", response_model=list[schemas.Team])
def list_teams(db: Session = Depends(get_db)):
    return db.query(models.Team).all()

@router.get("/summary", response_model=list[schemas.TeamSummary])
def list_team_summaries(db: Session = Depends(get_db)):
    # Use load_only so the query only selects the needed columns
    return db.query(models.Team).options(load_only(models.Team.id, models.Team.name)).all()

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db)):
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not db_team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found."
        )

    db.delete(db_team)
    db.commit()

@router.get("/{team_id}", response_model=schemas.Team_versenyzok)
def get_team(team_id: int, db: Session = Depends(get_db)):
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not db_team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found."
        )
    return db_team