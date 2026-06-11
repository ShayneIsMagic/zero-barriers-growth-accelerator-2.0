from marshmallow import ValidationError

from src.controllers.base_controller import BaseController
from src.lib.db import db
from src.models.evaluation import EvaluationRun
from src.schemas.evaluation_schemas import EvaluateRequestSchema, EvaluateResponseSchema
from src.util.evaluation_engine import run_evaluation


class EvaluationController(BaseController):
    def __init__(self):
        self.request_schema = EvaluateRequestSchema()
        self.response_schema = EvaluateResponseSchema()

    def evaluate(self):
        try:
            body = self.request_schema.load(self._get_json())
        except ValidationError as exc:
            return self.validation_error(str(exc.messages))

        try:
            result = run_evaluation(
                payload=body['payload'],
                framework_key=body['frameworkKey'],
                comprehensive=body.get('comprehensivePayload'),
                analysis_id=body.get('analysisId'),
                should_persist_collection=body.get('persistCollection', True),
            )
            serialized = self.response_schema.dump(result)
            return self.success_response(data=serialized)
        except ValueError as exc:
            return self.error_response(str(exc), status=422)
        except Exception as exc:
            return self.error_response('Evaluation failed', status=500, details=str(exc))

    def get_run(self, run_id: str):
        import uuid

        try:
            run_uuid = uuid.UUID(run_id)
        except ValueError:
            return self.validation_error('Invalid run ID format')

        run = db.session.get(EvaluationRun, run_uuid)
        if not run or not run.result_payload:
            return self.not_found('Evaluation run')

        payload = run.result_payload
        return self.success_response(
            data={
                'runId': str(run.id),
                'frameworkKey': run.framework_key,
                'status': run.status,
                'overallScore': float(run.overall_score or 0),
                'result': payload,
            }
        )

    def _get_json(self) -> dict:
        from flask import request

        return request.get_json(silent=True) or {}
