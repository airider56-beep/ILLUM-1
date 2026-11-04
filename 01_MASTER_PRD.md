# ILLYUM — Product Requirements Document (PRD)

**Document status:** Approved baseline  
**Product:** ILLYUM  
**Primary user:** Single owner/operator; non-coder  
**Build approach:** Prompt-guided development in Google AI Studio  
**Scope rule:** Implement the approved requirements below; no silent additions or omissions.

## 1. Product vision
ILLYUM is a single-user AI-assisted content creation application that takes a story source and helps the user produce:
- a short-form video voiceover script,
- detailed Google Flow-compatible video-generation prompts,
- two distinct thumbnail-generation prompts,
- separate YouTube and Instagram SEO packages.

The application must preserve source accuracy, keep each skill's inputs controlled, and make each stage reviewable and reusable.

## 2. Primary user and operating principles
- The user is a non-coder and should operate the app through a clear graphical interface.
- Avoid requiring the user to edit source code, database queries, configuration files, or command-line instructions.
- Use clear labels, guided steps, validation, progress/status indicators, and useful error messages.
- Generated outputs must be editable, savable, copyable, and exportable.
- The application must show what is complete, pending, failed, or needs review.
- Do not imply that AI output is guaranteed error-free, viral, or ranked.

## 3. Core user journey
1. Open dashboard.
2. Create a new project.
3. Enter project name and add the original story source (text, article, URL, transcript, or other supported source type).
4. Configure Skill 1: desired video duration and language (Hindi or English).
5. Generate and review the script; approve it before downstream generation.
6. Generate Skill 2 video prompts from the approved Skill 1 script; review and save.
7. Generate Skill 3 exactly two thumbnail prompt options from the approved Skill 1 script; review and save.
8. Generate Skill 4 SEO using both the original source story and the approved Skill 1 script.
9. Review YouTube SEO and Instagram SEO separately.
10. Copy or export outputs and return to the project later.

## 4. Application navigation and screens
### 4.1 Main navigation
- Dashboard
- Projects
- Create New Project
- Settings

### 4.2 Project workspace tabs
- Source Story
- Script
- Video Prompts
- Thumbnail Prompts
- SEO

### 4.3 SEO workspace
SEO must contain two separate sub-tabs:
- **YouTube SEO**
- **Instagram SEO**

Each platform's output must be stored and displayed separately. Do not combine the two into one result field.

### 4.4 Common workspace capabilities
- Save project and generated outputs.
- Show generation status and timestamps where available.
- Allow review and approval before downstream use.
- Copy individual fields and complete output.
- Export outputs in practical formats where supported.
- Preserve previously approved versions when a new generation is requested.
- Show source/dependency references so users can understand which approved content was used.

## 5. Functional requirements
### FR-01 Project management & mandatory settings
- Create, open, rename, and manage projects.
- Collect and permanently persist three mandatory project settings during creation:
  - **Aspect Ratio:** Exactly two options: `9:16` (Vertical for Shorts/Reels) or `16:9` (Horizontal for YouTube Landscape). Saved for downstream use in Skill 2 and Skill 3.
  - **Language:** Exactly two options: `Hindi` or `English`.
  - **Target Video Duration (8-Second Formula System):**
    - **For 9:16 Vertical:** Duration is determined by the number of 8-second parts:
      - 3 Parts = 24 Seconds (Hook + 1 Story + Ending)
      - 4 Parts = 32 Seconds (Hook + 2 Story + Ending)
      - 5 Parts = 40 Seconds (Hook + 3 Story + Ending)
      - 6 Parts = 48 Seconds (Hook + 4 Story + Ending)
      - Formula: `Total Duration = Number of Parts × 8 Seconds`.
    - **For 16:9 Horizontal:** Video duration is entered in minutes:
      - Minimum duration is 3 minutes (values below 3 minutes are rejected).
      - Formula: `Total Duration in Seconds = Minutes × 60`.
      - Formula: `Number of Parts = Ceiling(Total Duration in Seconds ÷ 8)`.
      - Examples: 3 min = 180s = 23 parts; 4 min = 240s = 30 parts; 5 min = 300s = 38 parts; 6 min = 360s = 45 parts. Final part may be &le; 8s.
  - Dynamic switching: Duration selection UI dynamically swaps between 9:16 part options and 16:9 minute input.
- **Single Source of Truth:** Settings configured during project creation serve as the single source of truth throughout the project. Downstream editors (e.g. Script Editor) do not duplicate language or duration selectors, but automatically read the saved project settings.
- List projects with useful status, settings badges, and last-updated information.
- Navigation state persistence: Current view, active project, and active tab are persisted across user clicks and browser reloads via client storage.
- **Existing Project Compatibility:** Preserve existing stories, scripts, approvals, and version histories. Distinguish legacy demo data with `[Demo]` badges.

### FR-02 Source story intake & mandatory source analysis
- Accept source material supported by the chosen implementation (at minimum pasted text; URL/file intake where supported).
- Store the original source or a durable reference to it.
- **Mandatory Source Analysis Stage:** Prior to script generation, the complete original story source must be analyzed:
  - Extract: Main subject & characters, key facts, chronology of events, locations & dates, key discoveries/developments, narrative arc (beginning, middle, ending), and missing/ambiguous information.
  - Internal structured analysis grounds all script generation.
  - Zero hallucination guardrail: Never invent characters, incidents, dialogue, dates, locations, facts, or conclusions.
  - Show a Source Analysis review section in the UI for user inspection before approving the generated script.
- If a URL cannot be accessed or content extraction fails, clearly ask for pasted text or a supported file; do not pretend it was read.
- Record source type and extraction/import status.

### FR-03 Skill 1 script generation
- Inputs: Original story source and internal Source Story Analysis, automatically reading saved project settings (aspect ratio, language, duration/part count).
- **Strict Language Consistency:**
  - Hindi: 100% natural Hindi narration using Devanagari script. Zero mixed English sentences or paragraphs. Proper nouns/technical terms in Latin retained only when unavoidable.
  - English: 100% natural English narration with zero Devanagari characters or mixed Hindi sentences.
  - Output validation: Every part is validated for language consistency before saving. If output violates the selected language, the engine retries or shows a clear error; mixed-language output is never silently accepted.
- **8-Second Part Limit & Dynamic Distribution:**
  - Every script part must have an estimated duration of maximum 8 seconds.
  - Total part count strictly follows the Aspect Ratio formula:
    - 9:16: 3 parts (24s), 4 parts (32s), 5 parts (40s), 6 parts (48s).
    - 16:9: `Ceiling(Minutes × 60 ÷ 8)` parts (e.g. 23 parts for 3m, 30 parts for 4m).
  - Part 1 must be Hook (attractive curiosity opener).
  - Middle parts must be Story (advancing narrative in connected flow).
  - Final part must be Ending (satisfying conclusion).
- Preserve source facts, events, people, and chronology. Do not invent facts, characters, or incidents.
- Flag missing, ambiguous, or incomplete source information.
- Output fields per part: Part Number, Part Type (Hook/Story/Ending), Voiceover Script, Estimated Audio Duration.
- User must be able to review, edit, save, and approve the script. Edits are also validated for language consistency.
- Downstream Skills 2 and 3 must use the approved Skill 1 script, not independently reinterpret the original source.

### FR-04 Skill 2 video prompt generation
- Direct/primary input is ONLY the approved Skill 1 script. Do not directly use the original story source.
- Generate one detailed Google Flow-compatible video-generation prompt for each script part.
- Each generated video part is at most 8 seconds; final part may be shorter.
- Explicitly state selected screen ratio and resolution in every prompt:
  - 9:16: vertical 9:16 for YouTube Shorts/Reels.
  - 16:9: horizontal 16:9 for YouTube landscape.
- Include visual description, characters, environment, actions, expressions, camera angle/movement/zoom/composition/transitions, lighting, and action timeline.
- Maintain character consistency across parts (face, age, hairstyle, clothing, body appearance), unless the script explicitly requires a change.
- Maintain scene continuity (location, environment, weather, objects, visual style).
- Include the exact approved voiceover script, in the same language.
- Keep a consistent male or female voice across the video, including pitch, tone, accent, and delivery.
- Sync visuals to voiceover. Do not convert narration into character dialogue. Use lip-sync only when a character actually speaks in the script.
- Audio requirements: consistent music identity across the whole video; mood/intensity may vary; synchronized sound effects; voiceover clarity is the priority; define audio timing and natural transitions between parts.
- Include complete prompt and structured fields: part number, script reference, duration, ratio, resolution, visual description, character details, environment, camera, lighting, action timeline, exact voiceover, voice details, background music, SFX, audio timeline, continuity notes, complete Google Flow prompt.
- Text prompts only; do not create storyboard images.
- Review compatibility and safety. Give alternatives where a requested depiction may be problematic; do not promise flawless generation.

### FR-05 Skill 3 thumbnail prompt generation
- Direct source is ONLY the current project's approved Skill 1 script. Do not directly use the original story source.
- Do not generate images; output image-generation prompts only.
- Generate exactly two options for every script:
  - OPTION A: one distinct visual vibe/concept.
  - OPTION B: a completely different visual vibe/concept, not merely a color or lighting variation.
- Analyze the whole script to identify strongest visual moment, emotion, mystery/shock, main character/object, central conflict, and curiosity angle.
- Do not automatically choose the first scene. Choose the strongest visual moment.
- Create a curiosity gap without revealing the full ending or misleading the viewer.
- Keep character appearance consistent within the script.
- Ensure mobile visibility, strong focal point, clear visual hierarchy, uncluttered composition.
- Text is optional. If useful, suggest 2–5 powerful, accurate words; otherwise recommend no text.
- Specify cinematic lighting and high-quality visuals. Avoid distorted faces, extra fingers/limbs, blur, unnatural proportions, unwanted text, and watermarks.
- Explicitly specify selected aspect ratio:
  - 9:16 vertical for Shorts/Reels; no horizontal composition.
  - 16:9 horizontal for YouTube video thumbnail.
- Output thumbnail analysis plus OPTION A and OPTION B, each with vibe, concept, composition, character/subject, lighting/colors, text recommendation, ratio, mobile visibility, and complete image prompt.

### FR-06 Skill 4 story & script SEO
- Primary sources BOTH:
  1. Original main source story.
  2. Approved Skill 1 generated script.
- Analyze both separately and together: source-story analysis, script analysis, combined SEO analysis.
- Do not add original source article name, author, website, or link in the SEO description.
- Produce separate YouTube SEO and Instagram SEO packages, separately formatted and saved.
- YouTube title must be the exact first hook from the approved script; do not rewrite it.
- YouTube description: attractive intro, story-related lines, topic, relevant naturally integrated keywords, curiosity, CTA, transparent AI-assisted disclosure, relevant hashtags.
- YouTube tags: primary, secondary, long-tail, question-based, and related search phrases; provide comma-separated copy/paste format.
- YouTube hashtags: relevant and limited; copy/paste format.
- Instagram Reel caption: attractive opening hook, short story intro, searchable keywords, curiosity, CTA, transparent AI-assisted disclosure.
- Instagram search keywords: main topic, niche, story phrases, long-tail.
- Instagram hashtags: topic/niche/story/discovery, not excessive or irrelevant.
- Conduct live keyword research where possible using Google Trends, YouTube search suggestions, related queries/results. Separate primary, secondary, and long-tail keywords; distinguish current trending from evergreen.
- Never fabricate search volume, rankings, or trend claims. If live research is unavailable, say so.
- Do not use irrelevant trending terms or keyword stuffing.
- Platform optimization:
  - YouTube: search relevance, title/description, thumbnail-title match, interest, retention, watch time, audience satisfaction.
  - Instagram: caption/search keywords/hashtags, watch time, shares, saves, engagement.
- Do not guarantee ranking or virality.
- Output: source + script analysis, YouTube SEO (title, description, disclosure, tags, hashtags), Instagram SEO (caption, keywords, hashtags, disclosure), keyword research (primary, secondary, long-tail, related queries, verified current trends, evergreen).

### FR-07 Free AI model discovery, selection & fallback
- Dynamic discovery of available AI models supported by the configured provider.
- Clear classification into three categories:
  - Verified Free: documented free-tier eligible models with verified rate/quota allowances.
  - Paid / Pro: advanced models requiring explicit user opt-in and confirmation.
  - Unverified: models whose free-tier eligibility cannot be verified; strictly excluded from automatic fallback.
- User-controlled selection of primary free model.
- User-controlled fallback priority list among verified free models.
- Automatic fallback execution: when primary free model encounters 429 rate limits, quota limits, or temporary outages, automatically try the next verified free model in the user-approved queue.
- Absolute paid barrier: never switch to a paid or unverified model without explicit user approval.
- Generation transparency: display the actual model that successfully generated every output and state if fallback occurred.
- Availability & cooldown management: maintain model availability and track cooldown periods without permanently disabling a model for a single transient error.
- Distinct failure handling: differentiate per-minute rate limits (short cooldown) from daily quota exhaustion.
- Quota awareness: do not assume separate models possess independent quotas under the same provider account.
- Security: API keys managed strictly on the backend; never exposed in frontend code.

## 6. Dependency rules (mandatory)
- Skill 1 depends on the original story source and user settings.
- Skill 2 depends ONLY on the approved Skill 1 script.
- Skill 3 depends ONLY on the approved Skill 1 script.
- Skill 4 depends on BOTH the original story source and approved Skill 1 script.
- If Skill 1 script changes after approval, mark Skill 2, Skill 3, and Skill 4 outputs as potentially outdated and require regeneration/review. Do not silently treat old downstream results as current.
- Never let a downstream skill run with missing or unapproved required inputs.

## 7. Non-functional requirements
- Usability: simple, guided interface for a non-technical single user.
- Reliability: save data safely and show failures clearly.
- Data integrity: maintain project separation, versions, source references, and approval states.
- Traceability: show which source/script version generated each output.
- Maintainability: modular skill services and clear boundaries.
- Security: protect user data, use secure provider-side secret handling, never expose API keys in client code.
- Responsivity: usable on desktop and mobile layouts where feasible.
- Accessibility: readable contrast, labels, keyboard-friendly controls where supported.
- Performance: show progress during long-running generation; do not freeze the interface.

## 8. Out of scope unless separately approved
- Multi-user collaboration, team roles, public social publishing, automatic uploading, payments/subscriptions, analytics dashboards, mobile native apps, and features not listed in this PRD.
- Do not select a technology stack or third-party service as an approved decision unless the user explicitly approves it. The implementation environment may recommend options, but must explain trade-offs and ask before committing to consequential choices.

## 9. Definition of product completion
The application is ready only when:
- All approved screens and project workflow are implemented.
- All four skills meet their detailed requirements.
- Skill input dependencies and approval gates work.
- YouTube and Instagram SEO are separate and saved separately.
- Projects and outputs persist after refresh/reopen using the chosen supported storage approach.
- Statuses, errors, history, copy/export, and audit tests pass.
- The user has reviewed and accepted the final phase.
