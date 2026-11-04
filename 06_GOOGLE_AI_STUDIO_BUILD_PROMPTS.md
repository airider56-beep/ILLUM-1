# ILLYUM — Google AI Studio Prompt Pack

## How to use
- Paste one prompt at a time into Google AI Studio.
- Do not paste all phases at once.
- After each response, share the result with the assistant for audit.
- Keep this PRD package attached/available in the AI Studio project context.
- Ask AI Studio to inspect existing work before changing anything.
- Never accept a claim of completion without evidence and tests.

## MASTER PROJECT INSTRUCTION (paste first)
You are helping build ILLYUM, a single-owner AI-assisted content creation web application. The owner is a non-coder and will not manually write code. Treat the attached ILLYUM PRD package as the authoritative product specification. Read every file before proposing implementation. Do not omit, simplify, rename, merge, or invent requirements. Do not silently change approved Skills 1–4. If anything conflicts or is unclear, stop and ask. Preserve the exact skill boundaries and dependency rules. Google AI Studio is the app-building environment; Google Flow is a downstream video-generation tool relevant to Skill 2, not the assumed app builder.

Maintain a persistent implementation tracker based on `07_BUILD_TRACKER.csv`. At the start of every task, report the current phase and statuses. At the end, report what was completed, partially completed, not completed, errors, files changed, tests run and evidence, remaining work, and next single action. Update the tracker and change log. If you cannot persistently edit these files, output their complete updated contents for the user to save. Never claim tracking is saved when it is not.

The owner is non-technical. Give simple explanations and do not ask them to code manually. Work in small steps. Do not start a later phase until the current phase passes acceptance tests and the user accepts it.

## PROMPT 0 — Read and establish project baseline
Read all attached PRD files and the Master Blueprint PDF. Summarize the product vision, screens, four approved skills, input dependencies, data entities, phase gates, and acceptance criteria. Then inspect the current AI Studio project (if one exists). Do not build or modify anything yet. Identify missing information and technical decisions that require owner approval. Create/confirm the tracker baseline. Return a concise scope confirmation and ask only the most important blocking question, if any.

## PROMPT 1 — Technical implementation proposal (no coding yet)
Using the PRD, propose the simplest reliable architecture suitable for a single non-technical owner. Cover frontend, backend/API, authentication, database/persistence, file storage, AI calls, keyword research, hosting/deployment, secrets management, and expected costs/free-tier caveats. Compare viable options briefly. Clearly separate required architecture from optional implementation choices. Do not commit to a paid service or consequential provider choice without explicit owner approval. Do not remove any PRD requirement to make implementation easier. Provide a phased technical plan and update tracker only with planning status, not implementation-complete claims.

## PROMPT 2 — Phase 1: app foundation and navigation
Implement only the approved foundation for the first phase after the technical choices are approved: app shell, responsive layout, main navigation (Dashboard, Projects, Create New Project, Settings), project workspace shell and tabs (Source Story, Script, Video Prompts, Thumbnail Prompts, SEO). SEO must visibly contain separate YouTube SEO and Instagram SEO sub-tabs. Use placeholder states only where later phases will implement functionality; label them clearly. Do not fabricate working AI generation or persistence. Run basic navigation/layout checks and report evidence. Update tracker.

## PROMPT 3 — Phase 2: project and source management
Implement project create/open/rename/list and source story intake using the approved architecture. At minimum support pasted story text. Add supported URL/file intake only if actually implemented and verified. Show import/extraction status and errors honestly. Persist projects and source content. Test create, save, refresh, reopen, and project isolation. Do not implement the four skills yet. Update tracker and audit.

## PROMPT 4 — Phase 3: Skill 1 Story-to-Script
Implement Skill 1 exactly as specified in `02_APPROVED_SKILL_SPECIFICATIONS.md` and FR-03. Inputs: story source, total duration, Hindi/English. Duration determines part count; every part max 8 seconds; first Hook, middle Story, last Ending. Preserve source facts, flag missing information, no invented events. Output required fields per part. Add edit/save/version/approval. Do not hard-code four parts. Test short/long durations, both languages, source fidelity, max duration, and approval. Do not begin Skills 2–4 until approved script flow works.

## PROMPT 5 — Phase 4: Skill 2 video prompts
Implement Skill 2 only from the approved Skill 1 script. Enforce the approval gate. Generate one detailed Google Flow-compatible prompt per script part. Include all required fields, exact voiceover, selected ratio and resolution, continuity, audio and timing. Text prompts only; do not generate storyboard images. Test that source story is not passed as a direct input to this skill and that voiceover text is exact. Update tracker.

## PROMPT 6 — Phase 5: Skill 3 thumbnail prompts
Implement Skill 3 only from the approved Skill 1 script. Enforce approval gate. Produce exactly OPTION A and OPTION B with fundamentally different visual concepts. Include full analysis and all required prompt fields. Text prompts only; do not generate images. Test exact count, conceptual difference, ratio, and script-only input boundary. Update tracker.

## PROMPT 7 — Phase 6: Skill 4 SEO
Implement Skill 4 using BOTH original source story and approved Skill 1 script. Save YouTube and Instagram results separately. YouTube title must exactly equal first hook. Include all platform-specific fields. Add live keyword research only where supported; label unavailable research and never fabricate metrics or trends. Do not include source article name/author/site/link in SEO description. Test platform separation, exact title, source+script analysis, tags/keywords/hashtags, disclosures, and research honesty. Update tracker.

## PROMPT 8 — Phase 7: orchestration, dependency invalidation, history
Implement workflow orchestration and statuses. Block downstream generation until required approved inputs exist. Store input version references. When approved script changes, mark old Skill 2, Skill 3, and Skill 4 outputs Stale. Add generation history, retry-safe error handling, progress states, and clear messages. Test every dependency and stale-result scenario. Update tracker.

## PROMPT 9 — Phase 8: copy/export, settings, security and polish
Complete copy controls and practical exports supported by the architecture. Complete Settings, validation, responsive layout, accessibility basics, secure secret handling, and error states. Do not expose API keys in client code. Test persistence, export, copy, errors, and secrets handling. Update tracker.

## PROMPT 10 — Final full audit and release readiness
Do not add new features. Run every test in `05_ACCEPTANCE_TESTS.md`. Create a requirement-by-requirement audit with PASS / PARTIAL / FAIL and evidence. List unresolved issues and limitations. Verify all four skills, their dependencies, separate SEO tabs/records, project persistence, versioning, stale invalidation, copy/export, security, and usability for a non-coder. Do not call the app ready if any critical requirement fails. Produce final tracker and release checklist. Wait for the owner's explicit acceptance.

## STANDARD END-OF-STEP REPORT (required every time)
1. Current phase.
2. Requirements addressed (IDs).
3. Completed.
4. Partially completed.
5. Not completed.
6. Files/components changed.
7. Tests performed and results/evidence.
8. Errors/risks/limitations.
9. Tracker rows updated (show exact updated values).
10. Next single action.
11. Ask user to review/accept before moving to the next phase.
