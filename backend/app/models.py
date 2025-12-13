from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    members = relationship("Member", back_populates="team", cascade="all, delete")


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team_id = Column(Integer, ForeignKey("teams.id"))
    team = relationship("Team", back_populates="members")

    laps = relationship("Lap", back_populates="member", cascade="all, delete")


class Lap(Base):
    __tablename__ = "laps"

    id = Column(Integer, primary_key=True, index=True)
    time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    member_id = Column(Integer, ForeignKey("members.id"))
    member = relationship("Member", back_populates="laps")
