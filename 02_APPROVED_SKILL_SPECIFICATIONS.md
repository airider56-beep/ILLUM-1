# ILLYUM — Approved Skill Specifications

These specifications are locked baseline requirements. Do not simplify or reinterpret them without user approval.

## Skill 0 — Source Story Analysis (APPROVED & PHASE 1 IMPLEMENTED)
**Purpose:** Pre-analyze the complete raw source material, extract structured facts across 7 dimensions, enforce a zero-hallucination guardrail, and manage a versioned, approval-ready analysis entity prior to script writing.

**Inputs**
- Original story source (pasted text, uploaded file, or extracted web article).

**Data Model & Lifecycle (Phase 1 Backend)**
- Dedicated `AnalysisRecord`: `id`, `version`, `sourceVersion`, `sourceFingerprint` (SHA-256), `analysis`, `status` (`Draft`, `Needs Review`, `Approved`, `Stale`), timestamps (`createdAt`, `updatedAt`, `approvedAt`), and `modelUsed`.
- Approval lifecycle:
  - Generation starts in `Needs Review` (never auto-approved).
  - Editing an analysis resets status to `Needs Review` and clears approval.
  - Modifying the source story text invalidates previous analysis and marks it `Stale`.
  - Re-approval verifies `sourceFingerprint` matches current source text.
  - Regeneration archives previous versions into `analysisVersions` and increments version number.

**Extracted Dimensions (7 Core Outputs)**
1. `mainSubjectAndCharacters`: List of verified entities/characters.
2. `keyFacts`: Bulleted list of strictly verified factual assertions.
3. `chronology`: Ordered sequence of events.
4. `locationsAndDates`: Verified spatial and temporal references.
5. `keyDevelopments`: Discoveries, twists, or turning points.
6. `narrativeArc`: Beginning, Middle, and Ending summaries.
7. `missingOrAmbiguous`: Gaps or ambiguous points explicitly flagged (no AI imagination).

## Skill 1 — Story-to-Script (APPROVED & PHASE 3 UPDATED)
**Purpose:** Convert the user's original story source into a faithful short-form video voiceover script grounded in mandatory source analysis.

**Inputs**
- Story source (text/article/URL/transcript or supported source input).
- Internal structured Source Story Analysis.
- Automatically read from project settings (Single Source of Truth):
  - Project Target Video Duration (calculated via 8-second formula).
  - Project Language (Hindi or English).
  - Project Aspect Ratio (9:16 or 16:9, persisted for downstream Skill 2 and Skill 3).

**Mandatory Source Analysis Pre-Stage**
- Must analyze the complete original Source Story before generating scripts:
  - Extract: Main subject & characters, key facts, chronology, locations & dates, key discoveries/developments, narrative arc (beginning, middle, ending), and missing/ambiguous details.
  - Scripts must be generated strictly from this analysis and the original source text.
  - Zero hallucination guardrail: Never invent characters, incidents, dialogue, dates, locations, facts, or conclusions. Flag missing information.
  - Source Analysis review section rendered in UI for user inspection prior to script approval.

**Rules**
- **Duration System (8-Second Formula):**
  - Every script part represents a maximum of 8 seconds (estimatedDuration <= 8).
  - For 9:16 Aspect Ratio:
    - 3 Parts = 24 Seconds
    - 4 Parts = 32 Seconds
    - 5 Parts = 40 Seconds
    - 6 Parts = 48 Seconds
    - Formula: `Total Duration = Parts × 8s`.
  - For 16:9 Aspect Ratio:
    - Minimum video duration: 3 minutes (values < 3 min rejected).
    - Formula: `Total Seconds = Minutes × 60`.
    - Formula: `Number of Parts = Ceiling(Total Seconds ÷ 8)`.
    - Examples: 3m = 180s = 23 parts; 4m = 240s = 30 parts; 5m = 300s = 38 parts; 6m = 360s = 45 parts.
- **Structure:**
  - Part 1: Attractive curiosity-based opening hook.
  - Middle parts: Narrative story development in connected flow.
  - Final part: Meaningful, satisfying ending.
- **Strict Language Consistency:**
  - Hindi: Complete voiceover in natural spoken Hindi using Devanagari script. Zero mixed English sentences or paragraphs. Retain unavoidable proper nouns/technical terms in Latin only when necessary.
  - English: Complete voiceover in natural conversational English. Zero Devanagari characters or mixed Hindi sentences.
  - Validation: Every part is validated before saving; violations trigger retries or clear errors. Never silently accept mixed-language output.
- **Source Fidelity:** Preserve source facts/events and chronology. Do not invent facts, characters, or incidents. Incomplete details must be flagged in ambiguities.
- Natural voiceover flow in the selected language.

**Required output for every part**
- Part Number
- Part Type: Hook / Story / Ending
- Voiceover Script
- Estimated Audio Duration (&le;8s)

**Approval:** User reviews/edits and approves the script. Edits are strictly validated for language consistency. Skill 2 and Skill 3 must consume this approved script only.

## Skill 2 — Script-to-Video Generation Prompt (APPROVED)
**Purpose:** Turn each approved script part into a detailed Google Flow-compatible video-generation prompt.

**Input boundary:** ONLY the approved Skill 1 script. Never directly use the original story source.

**Rules**
- One prompt per script part; each video part max 8 seconds; final may be shorter.
- Every prompt explicitly states selected aspect ratio and resolution.
- 9:16 = vertical Shorts/Reels; 16:9 = horizontal YouTube landscape.
- Describe visuals, characters, environment, actions, expressions, camera, movement, zoom, composition, transitions, lighting, and timeline.
- Keep characters and scenes consistent across parts.
- Include exact approved voiceover text and same language.
- Keep one consistent male or female narrator voice, with pitch/tone/accent/delivery specified.
- Voiceover remains narration unless script explicitly has a speaking character. Lip-sync only for actual character dialogue.
- Keep music identity consistent; mood/intensity may change. Sync SFX; prioritize voice clarity; define audio timing and transitions.
- Include all structured fields and the complete Google Flow prompt.
- Text prompt output only; no storyboard images.
- Check compatibility and safety; offer alternatives if needed; no guarantee of perfect generation.

**Required output fields**
Part number; script reference; duration; aspect ratio; resolution; visual description; character details; environment; camera; lighting; action timeline; exact voiceover; voice details; background music; SFX; audio timeline; continuity notes; complete Google Flow prompt.

## Skill 3 — Script-to-Thumbnail Generation Prompt (APPROVED)
**Purpose:** Produce image-generation prompts, not images, from the approved script.

**Input boundary:** ONLY the current project's approved Skill 1 script. Do not use the original source directly.

**Rules**
- Exactly two options per script.
- OPTION A and OPTION B must be fundamentally different concepts/vibes, not simple color variations.
- Analyze the whole script and choose the strongest visual moment, not automatically the first scene.
- Identify strongest emotion, mystery/shock, main subject, conflict, curiosity angle.
- Create curiosity without misleading or revealing the entire ending.
- Preserve character appearance consistency.
- Strong mobile readability, focal point, hierarchy, uncluttered composition.
- Text optional; if used, suggest 2–5 accurate words.
- Specify aspect ratio explicitly: 9:16 vertical for Shorts/Reels, or 16:9 horizontal for YouTube thumbnail.
- Include visual quality instructions and negative constraints (distorted faces, extra limbs/fingers, blur, unnatural proportions, unwanted text, watermarks).

**Required output**
Thumbnail analysis; OPTION A and OPTION B; each with vibe, concept, composition, subject/character, lighting/colors, text recommendation, ratio, mobile visibility, and complete image prompt.

## Skill 4 — Story & Script-to-SEO (APPROVED)
**Purpose:** Generate platform-specific discoverability metadata using both the source story and approved script.

**Input boundary:** BOTH original main source story AND approved Skill 1 script.

**Rules**
- Analyze source story and script separately, then combine.
- Do not include original article title, author, website, or source link in SEO description.
- Save YouTube SEO and Instagram SEO separately.
- YouTube title must be the exact first hook from the approved script.
- YouTube description includes attractive intro, story lines, topic, naturally integrated keywords, curiosity, CTA, transparent AI-assisted disclosure, relevant hashtags.
- YouTube tags: primary, secondary, long-tail, question-based, related search phrases; comma-separated.
- YouTube hashtags: relevant, limited, copy-paste format.
- Instagram caption: hook, short story intro, searchable keywords, curiosity, CTA, transparent AI-assisted disclosure.
- Instagram keywords: topic, niche, story phrases, long-tail.
- Instagram hashtags: relevant topic/niche/story/discovery, not excessive.
- Live research where possible (Google Trends, YouTube suggestions, related queries/results). Separate primary/secondary/long-tail; label trending vs evergreen. Never invent metrics or trends; disclose when live research unavailable.
- Avoid irrelevant trends and keyword stuffing.
- Optimize YouTube for search relevance, title/description, thumbnail-title match, interest, retention, watch time, satisfaction.
- Optimize Instagram for caption/search keywords/hashtags, watch time, shares, saves, engagement.
- Never guarantee ranking or virality.

**Required output**
Source-story analysis; script analysis; combined SEO analysis; YouTube title/description/disclosure/tags/hashtags; Instagram caption/keywords/hashtags/disclosure; keyword research with primary/secondary/long-tail/related queries/verified trends/evergreen.

## Cross-skill invalidation
If the approved script version changes, downstream outputs must be marked stale:
- Skill 2 video prompts
- Skill 3 thumbnail prompts
- Skill 4 SEO results
Require the user to regenerate or explicitly review them against the new script version.
