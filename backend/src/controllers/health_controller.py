from flask import current_app
from sqlalchemy import text

from src.controllers.base_controller import BaseController
from src.lib.db import db


class HealthController(BaseController):
    def get_health(self):
        db_status = 'ok'
        try:
            db.session.execute(text('SELECT 1'))
        except Exception as exc:
            db_status = f'error: {exc}'

        return self.success_response(
            data={
                'status': 'healthy' if db_status == 'ok' else 'degraded',
                'engineVersion': current_app.config.get('EVALUATION_ENGINE_VERSION', '1.0.0'),
                'database': db_status,
            }
        )
