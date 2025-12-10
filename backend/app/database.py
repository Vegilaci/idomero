from databases import Database
from sqlalchemy import create_engine, MetaData

DATABASE_URL = "sqlite+aiosqlite:///./stopper.db"

database = Database(DATABASE_URL)
metadata = MetaData()
