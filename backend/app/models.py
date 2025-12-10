from sqlalchemy import Table, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import metadata

teams = Table(
    "teams",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String, unique=True, nullable=False),
    Column("preferred_laps", Integer, nullable=True),
)

laps = Table(
    "laps",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id")),
    Column("lap_number", Integer, nullable=False),
    Column("time_ms", Integer, nullable=False),
    Column("timestamp", DateTime, server_default=func.now()),
)
