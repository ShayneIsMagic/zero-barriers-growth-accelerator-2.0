from marshmallow import Schema, fields, validate


class ContentHeadingsSchema(Schema):
    h1 = fields.List(fields.Str(), load_default=list)
    h2 = fields.List(fields.Str(), load_default=list)
    h3 = fields.List(fields.Str(), load_default=list)


class CanonicalPayloadSchema(Schema):
    url = fields.Str(required=True)
    snapshotId = fields.Str(required=True)
    collectedAt = fields.Str(required=True)
    collectorType = fields.Str(load_default='content-collect-api')
    rawEvidence = fields.Dict(required=True)
    proposedContent = fields.Str(allow_none=True, load_default=None)


class EvaluateRequestSchema(Schema):
    payload = fields.Nested(CanonicalPayloadSchema, required=True)
    frameworkKey = fields.Str(
        required=True,
        validate=validate.OneOf(
            [
                'b2c-elements',
                'b2b-elements',
                'clifton',
                'golden-circle',
                'brand-archetypes',
                'revenue-trends',
            ]
        ),
    )
    comprehensivePayload = fields.Dict(allow_none=True, load_default=None)
    analysisId = fields.Str(allow_none=True, load_default=None)
    persistCollection = fields.Bool(load_default=True)


class CoreSignalSchema(Schema):
    signalType = fields.Str(required=True)
    signalText = fields.Str(required=True)
    confidence = fields.Float(required=True)
    sourceSectionKey = fields.Str(allow_none=True)


class ElementDetailSchema(Schema):
    score = fields.Float(required=True)
    evidence = fields.Str(required=True)
    recommendation = fields.Str(required=True)


class ArchetypeSummarySchema(Schema):
    name = fields.Str(required=True)
    slug = fields.Str(required=True)
    score = fields.Float(required=True)
    strength = fields.Str(required=True)
    group = fields.Str(required=True)
    evidence = fields.Str(required=True)


class EvaluateResponseSchema(Schema):
    success = fields.Bool(required=True)
    runId = fields.Str(allow_none=True)
    collectionId = fields.Str(allow_none=True)
    corpusId = fields.Str(allow_none=True)
    frameworkKey = fields.Str(required=True)
    framework = fields.Str(required=True)
    url = fields.Str(required=True)
    overallScore = fields.Float(required=True)
    totalElements = fields.Int(required=True)
    categories = fields.Dict(required=True)
    topStrengths = fields.List(fields.Dict(), required=True)
    criticalGaps = fields.List(fields.Dict(), required=True)
    coreSignals = fields.List(fields.Nested(CoreSignalSchema), required=True)
    analysisMethod = fields.Str(required=True)
    chunksCompleted = fields.Int(required=True)
    chunksTotal = fields.Int(required=True)
    blockCount = fields.Int(required=True)
    verification = fields.Dict(required=True)
    chunkedReport = fields.Str(required=True)
    primary_archetype = fields.Raw(allow_none=True, load_default=None)
    secondary_archetypes = fields.List(fields.Nested(ArchetypeSummarySchema), load_default=list)
    dominant_cluster = fields.List(fields.Nested(ArchetypeSummarySchema), load_default=list)
    archetype_ranking = fields.Dict(allow_none=True, load_default=None)
    pyramidDiagnostics = fields.Dict(allow_none=True, load_default=None)
    message = fields.Str(allow_none=True)
