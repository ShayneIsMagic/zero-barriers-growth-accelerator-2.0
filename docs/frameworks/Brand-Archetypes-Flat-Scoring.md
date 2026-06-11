# Brand Archetypes Flat Scoring

> **Scope:** This file is the **scoring authority** (bands, evidence policy, per-archetype fields). It does **not** define runtime enrich fields (`top_three_archetypes`, `personality_profile`) or UI read order — see [`docs/guides/BRAND_ARCHETYPES_ASSESSMENT_GUIDE.md`](../guides/BRAND_ARCHETYPES_ASSESSMENT_GUIDE.md) §5 and root [`API_DOCUMENTATION.md`](../../API_DOCUMENTATION.md).

## Purpose

Use this framework to evaluate how clearly a brand expresses each of the 12 archetypes through website language and narrative signals.

This scoring model is flat and fractional:
- Every archetype is scored on `0.0-1.0`
- Every archetype counts equally
- Overall score = average of all 12 archetype scores
- No weighted tiers or category multipliers

## Evidence Policy

Score from communication evidence, not product specs alone.

Primary evidence streams:
1. Headlines and subheads
2. Calls to action (CTA) language
3. Testimonials and social proof
4. Promise and claim language
5. Mission, purpose, and belief language
6. Navigation labels and IA wording
7. Image alt text and visual-caption language

If evidence is weak or missing, score lower and explain the gap.

## Archetypes (12)

1. Sage
2. Explorer
3. Hero
4. Outlaw
5. Magician
6. Regular Guy/Girl
7. Jester
8. Caregiver
9. Creator
10. Innocent
11. Lover
12. Ruler

## Scoring Rubric (Per Archetype)

- `0.80-1.00` Strong and explicit archetype expression across multiple evidence streams
- `0.60-0.79` Clear but partial expression with moderate evidence density
- `0.40-0.59` Weak or inconsistent expression with sparse evidence
- `0.00-0.39` Minimal or absent expression

## Required Output Fields

For each archetype, provide:
- `score` (`0.0-1.0`)
- `status` (`strong`, `moderate`, `weak`, `absent`)
- `evidence` (quotes/snippets tied to specific streams)
- `reasoning` (why the score was assigned)
- `improvement_actions` (how to strengthen expression)

Also provide:
- `overall_archetype_score` (average of all 12)
- `coverage_check` confirming all 12 were scored

**After merge (runtime enrich, not AI output):** `top_three_archetypes` (ranks 1–3), `not_archetypes` (score < 0.4), `personality_profile`, plus legacy `primary_archetype` / `secondary_archetypes` — see `src/lib/framework/archetype-ranking.ts`.

## Flat Calculation Rules

- Category grouping is allowed for reporting only.
- Group averages must not be used to reweight total score.
- Final score must remain:

`overall_archetype_score = (sum of 12 archetype scores) / 12`

## Comparison Mode

If two content sets are provided (for example, existing vs proposed):
- Score all 12 for both sets
- Provide `delta = proposed_score - existing_score` for each archetype
- Mark each delta as `up`, `down`, or `flat`
- Include a concise recommendation for each negative delta
