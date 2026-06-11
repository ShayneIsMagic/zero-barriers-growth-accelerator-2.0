import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Numeric

from src.lib.db import db


class EvaluationRun(db.Model):
    __tablename__ = 'ce_evaluation_run'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    corpus_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_assessment_corpus.id', ondelete='CASCADE'),
        nullable=False,
    )
    framework_key: Mapped[str] = mapped_column(String(50), nullable=False)
    analysis_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default='pending')
    overall_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 3), nullable=True)
    elements_evaluated: Mapped[int | None] = mapped_column(Integer, nullable=True)
    elements_expected: Mapped[int | None] = mapped_column(Integer, nullable=True)
    engine_version: Mapped[str] = mapped_column(String(20), nullable=False, default='1.0.0')
    engine_mode: Mapped[str] = mapped_column(
        String(30), nullable=False, default='deterministic'
    )
    result_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    corpus = relationship('AssessmentCorpus', back_populates='evaluation_runs')
    element_scores = relationship(
        'ElementScore',
        back_populates='run',
        cascade='all, delete-orphan',
    )


class ElementScore(db.Model):
    __tablename__ = 'ce_element_score'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    run_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_evaluation_run.id', ondelete='CASCADE'),
        nullable=False,
    )
    element_key: Mapped[str] = mapped_column(String(120), nullable=False)
    element_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    category_key: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[Decimal] = mapped_column(Numeric(5, 3), nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    evidence_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    match_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sections_hit: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    run = relationship('EvaluationRun', back_populates='element_scores')
    evidence_matches = relationship(
        'EvidenceMatch',
        back_populates='element_score',
        cascade='all, delete-orphan',
    )


class EvidenceMatch(db.Model):
    __tablename__ = 'ce_evidence_match'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    element_score_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_element_score.id', ondelete='CASCADE'),
        nullable=False,
    )
    pattern_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_assessment_pattern.id', ondelete='SET NULL'),
        nullable=True,
    )
    synonym_term_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_synonym_term.id', ondelete='SET NULL'),
        nullable=True,
    )
    section_key: Mapped[str | None] = mapped_column(String(50), nullable=True)
    matched_text: Mapped[str] = mapped_column(Text, nullable=False)
    context_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    page_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    char_offset: Mapped[int | None] = mapped_column(Integer, nullable=True)
    match_weight: Mapped[Decimal] = mapped_column(
        Numeric(4, 2), nullable=False, default=Decimal('1.0')
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    element_score = relationship('ElementScore', back_populates='evidence_matches')
