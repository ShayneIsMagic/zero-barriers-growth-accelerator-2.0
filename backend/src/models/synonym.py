import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Numeric

from src.lib.db import db


class SynonymGroup(db.Model):
    __tablename__ = 'ce_synonym_group'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    canonical_term: Mapped[str] = mapped_column(String(200), nullable=False)
    framework_key: Mapped[str | None] = mapped_column(String(50), nullable=True)
    element_key: Mapped[str | None] = mapped_column(String(120), nullable=True)
    group_type: Mapped[str] = mapped_column(String(30), nullable=False, default='keyword')
    language: Mapped[str] = mapped_column(String(10), nullable=False, default='en')
    source: Mapped[str] = mapped_column(String(30), nullable=False, default='seed')
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    terms = relationship(
        'SynonymTerm',
        back_populates='group',
        cascade='all, delete-orphan',
    )


class SynonymTerm(db.Model):
    __tablename__ = 'ce_synonym_term'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    group_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_synonym_group.id', ondelete='CASCADE'),
        nullable=False,
    )
    term: Mapped[str] = mapped_column(String(500), nullable=False)
    term_type: Mapped[str] = mapped_column(String(30), nullable=False, default='keyword')
    match_weight: Mapped[Decimal] = mapped_column(
        Numeric(4, 2), nullable=False, default=Decimal('1.0')
    )
    is_negative: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    group = relationship('SynonymGroup', back_populates='terms')


class PatternSynonymLink(db.Model):
    __tablename__ = 'ce_pattern_synonym_link'

    pattern_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_assessment_pattern.id', ondelete='CASCADE'),
        primary_key=True,
    )
    synonym_group_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('ce_synonym_group.id', ondelete='CASCADE'),
        primary_key=True,
    )
