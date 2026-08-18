from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    members = relationship("Member", back_populates="team", cascade="all, delete")
    rider_now = Column(Integer, default=0)
    rider_next = Column(Integer, default=0)
    rider_lap = Column(Integer, default=0)


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    rajt_szam = Column(Integer, unique=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    team = relationship("Team", back_populates="members")

    laps = relationship("Lap", back_populates="member", cascade="all, delete")


class Lap(Base):
    __tablename__ = "laps"

    id = Column(Integer, primary_key=True, index=True)
    time_ms = Column(Integer)
    lap_no = Column(Integer, index=True)

    member_id = Column(Integer, ForeignKey("members.id"))
    member = relationship("Member", back_populates="laps")
