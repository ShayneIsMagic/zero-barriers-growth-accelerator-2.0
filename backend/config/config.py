import os


class Config:
    """Application configuration — secrets from environment only."""

    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://localhost:5432/zerobarriers',
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
    }

    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'

    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', '5001'))

    CORS_ORIGINS = os.environ.get(
        'CORS_ORIGINS',
        'http://localhost:3000',
    ).split(',')

    EVALUATION_ENGINE_VERSION = os.environ.get(
        'EVALUATION_ENGINE_VERSION',
        '1.0.0',
    )
