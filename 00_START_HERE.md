# ILLYUM — PRD & Google AI Studio Build Pack

## Purpose
This package is the project source of truth for building ILLYUM through Google AI Studio prompts. The owner is a non-coder and will not write code manually. The AI assistant must guide implementation in small, verifiable steps.

## Read order
1. `01_MASTER_PRD.md` — complete product requirements and approved scope.
2. `02_APPROVED_SKILL_SPECIFICATIONS.md` — exact behavior of Skills 1–4.
3. `03_SYSTEM_ARCHITECTURE_AND_DATA_MODEL.md` — architecture, entities, dependencies.
4. `04_WORKFLOW_STATUS_AND_GOVERNANCE.md` — statuses, versioning, error handling, phase locks.
5. `05_ACCEPTANCE_TESTS.md` — definition of done and tests.
6. `06_GOOGLE_AI_STUDIO_BUILD_PROMPTS.md` — copy/paste prompts in build order.
7. `07_BUILD_TRACKER.csv` — update after every build/audit step.
8. `08_CHANGE_LOG.md` and `09_SCOPE_GUARDRAILS.md` — change control and anti-drift rules.
9. `ILLYUM_Master_Blueprint.pdf` — printable master plan summary.

## Source-of-truth priority
If instructions conflict, follow this order:
1. The user's latest explicit approval in the current project conversation.
2. This PRD package, which records the approved plan.
3. Existing implementation, only if it conforms to the approved plan.

Never silently change a requirement. Record a proposed change and ask the user for approval first.

## Important tool distinction
- **Google AI Studio** is the intended prompt-driven environment for building the ILLYUM application.
- **Google Flow** is relevant to ILLYUM's Skill 2 output workflow for creating video-generation prompts / videos. It is not assumed to be the application builder.
- Do not claim that AI Studio automatically maintains a durable project tracker unless the tracker file is actually updated and retained in the project.

## Build operating procedure
For every phase:
1. Read the PRD and current tracker.
2. Inspect the current app and identify what is already implemented.
3. State the exact scope of this step and what is intentionally not being built yet.
4. Build only that scope.
5. Run the relevant acceptance tests.
6. Report: completed, partially completed, not completed, issues, files changed, tests and results.
7. Update `07_BUILD_TRACKER.csv` and `08_CHANGE_LOG.md`.
8. Do not start the next phase until the user has reviewed the result and the current phase is accepted.

## User workflow
The assistant provides one focused prompt at a time. The user pastes it into Google AI Studio and returns the complete result (including errors/screenshots when relevant). The assistant audits it against this pack and gives the next prompt. The user is not expected to code.
