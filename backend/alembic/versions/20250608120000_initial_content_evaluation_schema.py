"""Initial content evaluation schema (ce_* tables).

Revision ID: 20250608120000
Revises:
Create Date: 2025-06-08 12:00:00
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '20250608120000'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'ce_content_collection',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('snapshot_id', sa.String(length=255), nullable=False),
        sa.Column('url', sa.String(length=2048), nullable=False),
        sa.Column('collector_type', sa.String(length=100), nullable=False),
        sa.Column('collected_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('normalized_payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('comprehensive_payload', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('proposed_content', sa.Text(), nullable=True),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('snapshot_id'),
    )

    op.create_table(
        'ce_framework_element',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_key', sa.String(length=50), nullable=False),
        sa.Column('category_key', sa.String(length=50), nullable=False),
        sa.Column('category_name', sa.String(length=100), nullable=False),
        sa.Column('element_slug', sa.String(length=100), nullable=False),
        sa.Column('element_key', sa.String(length=120), nullable=False),
        sa.Column('display_name', sa.String(length=150), nullable=True),
        sa.Column('definition', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('scoring_type', sa.String(length=30), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_framework_section_map',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_key', sa.String(length=50), nullable=False),
        sa.Column('section_key', sa.String(length=50), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=False),
        sa.Column('weight', sa.Numeric(precision=4, scale=2), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_scoring_band',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_key', sa.String(length=50), nullable=False),
        sa.Column('band_label', sa.String(length=30), nullable=False),
        sa.Column('min_score', sa.Numeric(precision=4, scale=3), nullable=False),
        sa.Column('max_score', sa.Numeric(precision=4, scale=3), nullable=False),
        sa.Column('recommendation_template', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_synonym_group',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('canonical_term', sa.String(length=200), nullable=False),
        sa.Column('framework_key', sa.String(length=50), nullable=True),
        sa.Column('element_key', sa.String(length=120), nullable=True),
        sa.Column('group_type', sa.String(length=30), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('source', sa.String(length=30), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_assessment_pattern',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_key', sa.String(length=50), nullable=False),
        sa.Column('element_key', sa.String(length=120), nullable=False),
        sa.Column('pattern_type', sa.String(length=30), nullable=False),
        sa.Column('pattern_text', sa.String(length=500), nullable=False),
        sa.Column('pattern_weight', sa.Numeric(precision=4, scale=2), nullable=False),
        sa.Column('score_contribution', sa.Numeric(precision=4, scale=3), nullable=False),
        sa.Column('context_section', sa.String(length=50), nullable=True),
        sa.Column('is_negative', sa.Boolean(), nullable=False),
        sa.Column('is_structural', sa.Boolean(), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_synonym_term',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('group_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('term', sa.String(length=500), nullable=False),
        sa.Column('term_type', sa.String(length=30), nullable=False),
        sa.Column('match_weight', sa.Numeric(precision=4, scale=2), nullable=False),
        sa.Column('is_negative', sa.Boolean(), nullable=False),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['ce_synonym_group.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_pattern_synonym_link',
        sa.Column('pattern_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('synonym_group_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['pattern_id'], ['ce_assessment_pattern.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['synonym_group_id'], ['ce_synonym_group.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('pattern_id', 'synonym_group_id'),
    )

    op.create_table(
        'ce_assessment_corpus',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('collection_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_key', sa.String(length=50), nullable=False),
        sa.Column('arrangement_version', sa.String(length=20), nullable=False),
        sa.Column('total_sections', sa.Integer(), nullable=False),
        sa.Column('total_tokens', sa.Integer(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('arranged_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['collection_id'], ['ce_content_collection.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_corpus_section',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('corpus_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('section_key', sa.String(length=50), nullable=False),
        sa.Column('evidence_stream', sa.String(length=50), nullable=True),
        sa.Column('page_url', sa.String(length=2048), nullable=True),
        sa.Column('page_type', sa.String(length=50), nullable=True),
        sa.Column('priority', sa.Integer(), nullable=False),
        sa.Column('text_content', sa.Text(), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=False),
        sa.Column('headings', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['corpus_id'], ['ce_assessment_corpus.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_core_signal',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('corpus_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('signal_type', sa.String(length=50), nullable=False),
        sa.Column('signal_text', sa.Text(), nullable=False),
        sa.Column('confidence', sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column('source_section_key', sa.String(length=50), nullable=True),
        sa.Column('supporting_terms', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('rank_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['corpus_id'], ['ce_assessment_corpus.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_evaluation_run',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('corpus_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('framework_key', sa.String(length=50), nullable=False),
        sa.Column('analysis_id', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('overall_score', sa.Numeric(precision=5, scale=3), nullable=True),
        sa.Column('elements_evaluated', sa.Integer(), nullable=True),
        sa.Column('elements_expected', sa.Integer(), nullable=True),
        sa.Column('engine_version', sa.String(length=20), nullable=False),
        sa.Column('engine_mode', sa.String(length=30), nullable=False),
        sa.Column('result_payload', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['corpus_id'], ['ce_assessment_corpus.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_element_score',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('element_key', sa.String(length=120), nullable=False),
        sa.Column('element_slug', sa.String(length=100), nullable=False),
        sa.Column('category_key', sa.String(length=50), nullable=False),
        sa.Column('score', sa.Numeric(precision=5, scale=3), nullable=False),
        sa.Column('confidence', sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column('evidence_summary', sa.Text(), nullable=True),
        sa.Column('recommendation', sa.Text(), nullable=True),
        sa.Column('match_count', sa.Integer(), nullable=False),
        sa.Column('sections_hit', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['ce_evaluation_run.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'ce_evidence_match',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('element_score_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pattern_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('synonym_term_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('section_key', sa.String(length=50), nullable=True),
        sa.Column('matched_text', sa.Text(), nullable=False),
        sa.Column('context_text', sa.Text(), nullable=True),
        sa.Column('page_url', sa.String(length=2048), nullable=True),
        sa.Column('char_offset', sa.Integer(), nullable=True),
        sa.Column('match_weight', sa.Numeric(precision=4, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['element_score_id'], ['ce_element_score.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['pattern_id'], ['ce_assessment_pattern.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['synonym_term_id'], ['ce_synonym_term.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('ce_evidence_match')
    op.drop_table('ce_element_score')
    op.drop_table('ce_evaluation_run')
    op.drop_table('ce_core_signal')
    op.drop_table('ce_corpus_section')
    op.drop_table('ce_assessment_corpus')
    op.drop_table('ce_pattern_synonym_link')
    op.drop_table('ce_synonym_term')
    op.drop_table('ce_assessment_pattern')
    op.drop_table('ce_synonym_group')
    op.drop_table('ce_scoring_band')
    op.drop_table('ce_framework_section_map')
    op.drop_table('ce_framework_element')
    op.drop_table('ce_content_collection')
