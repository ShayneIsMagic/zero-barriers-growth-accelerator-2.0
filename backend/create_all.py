"""Create database tables from SQLAlchemy models (development bootstrap)."""

from create_app import create_app
from src.lib.db import db

app = create_app()

with app.app_context():
    import src.models  # noqa: F401

    db.create_all()
    print('Database tables created.')
