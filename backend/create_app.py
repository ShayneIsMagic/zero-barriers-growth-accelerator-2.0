from flask import Flask
from flask_cors import CORS

from config.config import Config
from src.lib.db import init_db
from src.routes.evaluation_routes import EvaluationRoutes
from src.routes.health_routes import HealthRoutes


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(
        app,
        origins=app.config['CORS_ORIGINS'],
        supports_credentials=True,
    )

    init_db(app)

    import src.models  # noqa: F401 — register SQLAlchemy models

    from src.routes.health_routes import health_bp
    from src.routes.evaluation_routes import evaluation_bp

    HealthRoutes(health_bp).register()
    EvaluationRoutes(evaluation_bp).register()

    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(evaluation_bp, url_prefix='/api')

    return app
