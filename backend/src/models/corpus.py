import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Numeric

from src.lib.db import db


class AssessmentCorpus(db.Model):
    __tablename__ = 'ce_assessment_corpus'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    collection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_content_collection.id', ondelete='CASCADE'),
        nullable=False,
    )
    framework_key: Mapped[str] = mapped_column(String(50), nullable=False)
    arrangement_version: Mapped[str] = mapped_column(
        String(20), nullable=False, default='1.0'
    )
    total_sections: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    metadata_json: Mapped[dict | None] = mapped_column('metadata', JSONB, nullable=True)
    arranged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    collection = relationship('ContentCollection', back_populates='corpora')
    sections = relationship(
        'CorpusSection',
        back_populates='corpus',
        cascade='all, delete-orphan',
    )
    core_signals = relationship(
        'CoreSignal',
        back_populates='corpus',
        cascade='all, delete-orphan',
    )
    evaluation_runs = relationship(
        'EvaluationRun',
        back_populates='corpus',
        cascade='all, delete-orphan',
    )


class CorpusSection(db.Model):
    __tablename__ = 'ce_corpus_section'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    corpus_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_assessment_corpus.id', ondelete='CASCADE'),
        nullable=False,
    )
    section_key: Mapped[str] = mapped_column(String(50), nullable=False)
    evidence_stream: Mapped[str | None] = mapped_column(String(50), nullable=True)
    page_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    page_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    text_content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    headings: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    corpus = relationship('AssessmentCorpus', back_populates='sections')


class CoreSignal(db.Model):
    __tablename__ = 'ce_core_signal'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    corpus_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_assessment_corpus.id', ondelete='CASCADE'),
        nullable=False,
    )
    signal_type: Mapped[str] = mapped_column(String(50), nullable=False)
    signal_text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    source_section_key: Mapped[str | None] = mapped_column(String(50), nullable=True)
    supporting_terms: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    rank_order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    corpus = relationship('AssessmentCorpus', back_populates='core_signals')
