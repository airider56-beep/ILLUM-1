# ILLYUM — System Architecture & Data Model

## 1. Logical architecture
The implementation should preserve these logical layers, regardless of the final framework:
1. **Frontend/UI:** dashboard, project workspace, forms, tabs, review/approval, copy/export, status display.
2. **Backend/API layer:** validates requests, enforces permissions and dependencies, coordinates persistence and generation.
3. **Authentication/access layer:** suitable for the single owner; exact approach to be selected based on implementation environment and approved by user if consequential.
4. **Database/persistence:** projects, sources, settings, scripts, parts, prompts, SEO results, history, statuses.
5. **File storage:** source uploads and exports where supported.
6. **AI Workflow Orchestrator:** calls skills in the correct order, enforces required approvals, manages dynamic model discovery, and handles automatic fallback across verified free-tier models when rate limits (429) or temporary service errors occur.
7. **Four skill engines:** Skill 1, Skill 2, Skill 3, Skill 4, each isolated with its own prompt and validation.
8. **AI model provider & free-tier registry:** model discovery, capability check, free/paid classification, availability/cooldown tracking; credentials handled strictly on backend.
9. **Search/trends provider:** optional/live research for Skill 4 when available.

## 2. Data entities
The planned logical entities are:
- **Users:** owner account and settings.
- **Projects:** project identity, name, lifecycle status, timestamps, demo flag (`isDemo`), and configuration settings (Single Source of Truth):
  - `aspectRatio`: `'9:16'` (Vertical Shorts/Reels) or `'16:9'` (Horizontal YouTube).
  - `language`: `'Hindi'` or `'English'`.
  - `selectedPartCount`: `3`, `4`, `5`, or `6` for 9:16 format (24s, 32s, 40s, 48s).
  - `durationMinutes`: numeric minutes (&ge; 3) for 16:9 format.
  - `duration`: total calculated duration in seconds.
  - `currentAnalysis`: dedicated `AnalysisRecord` (Skill 0).
  - `analysisVersions`: archived versions array of analysis records.
  - `analysisStatus`: `'Analysis Pending'`, `'Analysis Needs Review'`, `'Analysis Approved'`, `'Analysis Stale'`.
  - `sourceAnalysis`: backward compatibility object.
- **Source Stories:** original story content or supported reference, word/character count, source type, extraction/import status, version, fingerprint, and legacy `analysis` object.
- **Analysis Records (Skill 0):** dedicated versioned analysis entity: `id`, `version`, `sourceVersion`, `sourceFingerprint` (SHA-256 hash), `analysis` (all 7 factual dimensions: subject & characters, key facts, chronology, locations & dates, developments, narrative arc, missing gaps), `status` (`Draft`, `Needs Review`, `Approved`, `Stale`), timestamps (`createdAt`, `updatedAt`, `approvedAt`), and `modelUsed`.
- **Scripts:** generated script versions, language, target duration, dynamic parts count, total estimated duration, approval status, model used.
- **Script Parts:** part number, part type (Hook / Story / Ending), voiceover text, estimated duration (maximum 8s each), parent script version.
- **Video Prompts:** prompt per script part, ratio (read from project), resolution, structured fields, script-version reference, status.
- **Thumbnail Prompts:** exactly two options per approved script, ratio (read from project), structured fields, script-version reference, status.
- **SEO Results:** separate YouTube and Instagram records, both linked to source and script versions.
- **SEO Research:** keyword groups, evidence/source, retrieval date, trending/evergreen classification, availability note.
- **AI Models Registry:** discovered models, provider, tier classification (`Verified Free`, `Paid/Pro`, `Unverified`), availability status, cooldown timers.
- **Model Fallback Events:** record of rate-limit/failure occurrences, original model, fallback model used, outcome.
- **Generation History:** skill, input references, model used, fallback indicator, output version, timestamps, result/error, status.

## 3. Relationships and integrity
- One user can own multiple projects.
- One project can have one or more source-story versions.
- One project can have multiple script versions.
- One script version contains multiple ordered script parts.
- Each script part can have a corresponding video prompt.
- Each approved script version can have exactly two thumbnail prompt options.
- SEO result records must distinguish platform (`YouTube` or `Instagram`) and link to both source and script versions.
- Generation history records which inputs and prompt/skill version were used.
- Keep project data isolated.

## 4. Data dependency map
Source Story + selected duration + language -> Skill 1 -> Script review/approval.
Approved Script -> Skill 2 -> Video prompts.
Approved Script -> Skill 3 -> exactly two thumbnail prompts.
Source Story + Approved Script -> Skill 4 -> YouTube SEO + Instagram SEO.
Approved Script revision -> mark Skill 2, Skill 3, Skill 4 results stale.

## 5. Stack decisions
This PRD intentionally specifies logical architecture, not a mandatory framework/database/hosting provider. Google AI Studio may recommend implementation choices. Before adopting a consequential provider, database, authentication model, hosting, or paid service, the assistant must explain:
- what the choice does,
- why it is needed,
- expected cost or free-tier caveats if known,
- data/security implications,
- alternatives,
and obtain the user's approval where appropriate.
Never hard-code secrets in browser/client code.
