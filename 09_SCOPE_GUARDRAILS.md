# ILLYUM — Scope Guardrails / Anti-Drift Rules

1. Do not change the four approved skills or their input boundaries.
2. Skill 1 part count is duration-driven, not fixed at four; maximum 8 seconds per part.
3. Skill 2 consumes only the approved Skill 1 script; never use the original source directly.
4. Skill 3 consumes only the approved Skill 1 script; exactly two distinct thumbnail prompt options; prompts only, no image generation.
5. Skill 4 consumes both the original source and approved script; YouTube and Instagram outputs are separate.
6. YouTube SEO title must exactly match the first script hook.
7. Do not include source article name, author, website, or link in the SEO description.
8. Never fabricate facts, keyword metrics, current trends, rankings, or guarantees.
9. Preserve script versions and mark dependent outputs stale when the approved script changes.
10. No downstream skill runs without required approved inputs.
11. Keep project data separated and persistent.
12. Do not claim a feature is implemented unless it has been tested.
13. Do not claim the tracker is updated unless its durable file/record was actually updated.
14. Do not choose a paid provider or consequential stack decision without explaining it and obtaining approval.
15. Do not add unapproved scope such as social auto-publishing, team collaboration, payments, or analytics dashboards.
16. Build and audit one phase at a time; wait for user acceptance before proceeding.
17. Owner is a non-coder: instructions and UI must be accessible without manual coding.
18. Google Flow is used for video-generation workflow outputs; do not confuse it with Google AI Studio app-building.
