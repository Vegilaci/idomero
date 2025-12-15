from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, load_only
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/teams", tags=["Teams"])

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
