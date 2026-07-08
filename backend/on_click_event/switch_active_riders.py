from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models

import logging
import sys

logger = logging.getLogger()
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')

stdout_handler = logging.StreamHandler(sys.stdout)
stdout_handler.setLevel(logging.DEBUG)
stdout_handler.setFormatter(formatter)

file_handler = logging.FileHandler('logs.log', encoding='utf-8')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)


logger.addHandler(file_handler)
logger.addHandler(stdout_handler)



def _get_team_members_in_order(db_team):
    return sorted(db_team.members, key=lambda m: m.id)


def switch_active_riders_onStart(team_id: int):
    db = next(get_db())

    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()

    if db_team and db_team.members:
        members = _get_team_members_in_order(db_team)
        first_rider = members[0]
        next_rider = members[1] if len(members) > 1 else members[0]

        db_team.rider_now = first_rider.id
        db_team.rider_next = next_rider.id
        db_team.rider_lap = 0
        db.commit()
        db.refresh(db_team)

        logger.info(
            f"Start beállítás: rider_now={db_team.rider_now}, rider_next={db_team.rider_next}"
        )
    else:
        logger.warning("A csapat vagy a csapattagok nem találhatóak.")

def switch_on_stop(team_id: int):
    db = next(get_db())

    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()

    if not db_team or not db_team.members:
        logger.warning("switch_on_stop: csapat vagy tagok nem találhatók")
        return

    members = _get_team_members_in_order(db_team)
    member_ids = [m.id for m in members]

    if db_team.rider_now not in member_ids:
        db_team.rider_now = member_ids[0]

    current_index = member_ids.index(db_team.rider_now)
    next_index = (current_index + 1) % len(member_ids)
    next_next_index = (next_index + 1) % len(member_ids)

    db_team.rider_now = member_ids[next_index]
    db_team.rider_next = member_ids[next_next_index]
    db_team.rider_lap = 0
    db.commit()
    db.refresh(db_team)

    logger.info(
        f"Stop utáni váltás: rider_now={db_team.rider_now}, rider_next={db_team.rider_next}"
    )


def on_reset(team_id: int, korido: int):
    db = next(get_db())
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not db_team:
        logger.warning("on_reset: csapat nem található")
        return

    db_member = db.query(models.Member).filter(models.Member.id == db_team.rider_now).first()

    if not db_member:
        logger.warning("on_reset: aktív versenyző nem található")
        return

    logger.info(f"on_reset: {db_member.name} - eltelt idő: {korido} ms")

    max_lap_no = (
        db.query(func.max(models.Lap.lap_no))
        .filter(models.Lap.member_id == db_member.id)
        .scalar()
    )
    next_lap_no = (max_lap_no or 0) + 1

    db_lap = models.Lap(member_id=db_member.id, time_ms=korido, lap_no=next_lap_no)
    db_team.rider_lap = (db_team.rider_lap or 0) + 1
    db.add(db_lap)
    db.commit()
    db.refresh(db_lap)

    logger.info(f"on_reset: lap elmentve – lap_no={db_lap.lap_no}, time_ms={db_lap.time_ms}")


def on_kill(team_id: int, korido: int): #utsó mentés stopper leállításakor
    db = next(get_db())
    db_team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not db_team:
        logger.warning("on_kill: csapat nem található")
        return

    db_member = db.query(models.Member).filter(models.Member.id == db_team.rider_now).first()

    if not db_member:
        logger.warning("on_kill: aktív versenyző nem található")
        return

    logger.info(f"on_kill: {db_member.name} - eltelt idő: {korido} ms")

    max_lap_no = (
        db.query(func.max(models.Lap.lap_no))
        .filter(models.Lap.member_id == db_member.id)
        .scalar()
    )
    next_lap_no = (max_lap_no or 0) + 1

    db_lap = models.Lap(member_id=db_member.id, time_ms=korido, lap_no=next_lap_no)
    db_team.rider_lap  = 0 
    db.add(db_lap)
    db.commit()
    db.refresh(db_lap)

    logger.info(f"on_kill: lap elmentve – lap_no={db_lap.lap_no}, time_ms={db_lap.time_ms}")