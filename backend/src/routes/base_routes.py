from abc import ABC, abstractmethod

from flask import Blueprint


class BaseRoute(ABC):
    """Base route — register blueprint endpoints in subclasses."""

    def __init__(self, blueprint: Blueprint):
        self.blueprint = blueprint

    @abstractmethod
    def register(self) -> None:
        """Register all routes on the blueprint."""
