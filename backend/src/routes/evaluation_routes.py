from flask import Blueprint

from src.controllers.evaluation_controller import EvaluationController
from src.routes.base_routes import BaseRoute

evaluation_bp = Blueprint('evaluation', __name__)


class EvaluationRoutes(BaseRoute):
    def register(self) -> None:
        controller = EvaluationController()

        @self.blueprint.post('/evaluate')
        def evaluate():
            return controller.evaluate()

        @self.blueprint.get('/evaluate/<run_id>')
        def get_run(run_id: str):
            return controller.get_run(run_id)
