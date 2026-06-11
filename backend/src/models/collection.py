import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.lib.db import db


class ContentCollection(db.Model):
    __tablename__ = 'ce_content_collection'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    snapshot_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    collector_type: Mapped[str] = mapped_column(
        String(100), nullable=False, default='content-collect-api'
    )
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    normalized_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    comprehensive_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    proposed_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    corpora = relationship(
        'AssessmentCorpus',
        back_populates='collection',
        cascade='all, delete-orphan',
    )
