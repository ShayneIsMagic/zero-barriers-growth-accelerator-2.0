import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Numeric

from src.lib.db import db


class FrameworkElement(db.Model):
    __tablename__ = 'ce_framework_element'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    framework_key: Mapped[str] = mapped_column(String(50), nullable=False)
    category_key: Mapped[str] = mapped_column(String(50), nullable=False)
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    element_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    element_key: Mapped[str] = mapped_column(String(120), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    definition: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    scoring_type: Mapped[str] = mapped_column(
        String(30), nullable=False, default='flat_fractional'
    )
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )


class FrameworkSectionMap(db.Model):
    __tablename__ = 'ce_framework_section_map'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    framework_key: Mapped[str] = mapped_column(String(50), nullable=False)
    section_key: Mapped[str] = mapped_column(String(50), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    weight: Mapped[Decimal] = mapped_column(
        Numeric(4, 2), nullable=False, default=Decimal('1.0')
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class ScoringBand(db.Model):
    __tablename__ = 'ce_scoring_band'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    framework_key: Mapped[str] = mapped_column(String(50), nullable=False)
    band_label: Mapped[str] = mapped_column(String(30), nullable=False)
    min_score: Mapped[Decimal] = mapped_column(Numeric(4, 3), nullable=False)
    max_score: Mapped[Decimal] = mapped_column(Numeric(4, 3), nullable=False)
    recommendation_template: Mapped[str] = mapped_column(Text, nullable=False)


class AssessmentPattern(db.Model):
    __tablename__ = 'ce_assessment_pattern'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    framework_key: Mapped[str] = mapped_column(String(50), nullable=False)
    element_key: Mapped[str] = mapped_column(String(120), nullable=False)
    pattern_type: Mapped[str] = mapped_column(String(30), nullable=False, default='phrase')
    pattern_text: Mapped[str] = mapped_column(String(500), nullable=False)
    pattern_weight: Mapped[Decimal] = mapped_column(
        Numeric(4, 2), nullable=False, default=Decimal('1.0')
    )
    score_contribution: Mapped[Decimal] = mapped_column(
        Numeric(4, 3), nullable=False, default=Decimal('0.15')
    )
    context_section: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_negative: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_structural: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    language: Mapped[str] = mapped_column(String(10), nullable=False, default='en')
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
