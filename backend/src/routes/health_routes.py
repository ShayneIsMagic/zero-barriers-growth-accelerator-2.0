from flask import Blueprint

from src.controllers.health_controller import HealthController
from src.routes.base_routes import BaseRoute

health_bp = Blueprint('health', __name__)


class HealthRoutes(BaseRoute):
    def register(self) -> None:
        controller = HealthController()

        @self.blueprint.get('/health')
        def health():
            return controller.get_health()
