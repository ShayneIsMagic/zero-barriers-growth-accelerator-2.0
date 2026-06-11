from typing import Any

from flask import jsonify


class BaseController:
    """Base controller — consistent success/error responses for all endpoints."""

    def success_response(
        self,
        data: dict[str, Any] | None = None,
        message: str | None = None,
        status: int = 200,
    ):
        payload: dict[str, Any] = {'success': True}
        if data is not None:
            payload.update(data)
        if message is not None:
            payload['message'] = message
        return jsonify(payload), status

    def error_response(
        self,
        error: str,
        status: int = 400,
        details: str | None = None,
    ):
        payload: dict[str, Any] = {
            'success': False,
            'error': error,
        }
        if details is not None:
            payload['details'] = details
        return jsonify(payload), status

    def not_found(self, resource: str = 'Resource'):
        return self.error_response(f'{resource} not found', status=404)

    def validation_error(self, details: str):
        return self.error_response('Validation failed', status=422, details=details)
