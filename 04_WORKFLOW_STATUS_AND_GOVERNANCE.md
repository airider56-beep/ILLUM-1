# ILLYUM — Workflow, Statuses & Governance

## 1. Project lifecycle
Suggested project statuses:
- Draft
- Source Ready
- Script In Progress
- Script Needs Review
- Script Approved
- Video Prompts In Progress
- Video Prompts Ready
- Thumbnail Prompts Ready
- SEO In Progress
- SEO Ready
- Complete
- Error / Needs Attention

Statuses must reflect actual persisted state, not optimistic UI assumptions.

## 2. Skill run statuses
For each skill execution:
- Not Started
- Queued (only if queue exists)
- Running
- Succeeded
- Failed
- Needs Review
- Approved
- Stale (input version changed)

### Model availability statuses (FR-07)
For each discovered AI model:
- `Available` (ready for generation)
- `Cooldown (429 Rate Limit)` (temporary rate limit hit; active cooldown timer)
- `Quota Exhausted (Daily RPD)` (daily free quota reached; unavailable until provider reset)
- `Unverified` (free-tier eligibility not confirmed; excluded from automatic fallback)
- `Degraded / Service Outage` (provider endpoint error)

## 3. Approval gates
- Skill 1 output must be approved before Skill 2 or Skill 3 runs.
- Skill 1 output must be approved before Skill 4 runs.
- Skill 2/3/4 outputs should be reviewable before being treated as final.
- A failed or incomplete input must block dependent generation with a clear explanation.

## 4. Versioning and stale results
- Do not overwrite an approved script without retaining its previous version.
- Record script version identifiers.
- Every downstream output stores the source/script version IDs it used.
- When a new script version is approved, downstream outputs based on an older script become Stale.
- The user can inspect old results, regenerate, or explicitly retain an old result with a visible warning.

## 5. Error handling
- Show understandable error messages and a next action.
- Distinguish input validation errors, source extraction errors, provider/API errors, timeout/network errors, storage errors, and unexpected errors.
- Do not display secrets, raw credentials, or sensitive stack traces to the user.
- Preserve user input if generation fails.
- Provide retry where safe.
- Avoid duplicate records when a retry occurs.
- If a provider is unavailable, disclose that and offer a supported manual/paste fallback when possible.
- **Model fallback & rate-limit handling (FR-07):**
  - Distinguish temporary 429 rate limits (short per-minute cooldown) from daily quota exhaustion.
  - When primary free model hits 429 or temporary outage, automatically invoke the next user-approved verified free model.
  - Never permanently disable a model due to a single transient rate-limit error; return it to `Available` once the cooldown expires.
  - Never switch to a paid or unverified model without explicit user confirmation.
  - Clearly disclose the model that succeeded and indicate if fallback was triggered.
  - If all eligible free models fail, halt generation safely, report cooldown status, and do not charge the user.

## 6. Audit and phase locking
At the end of every build phase:
1. Compare implementation against the relevant PRD requirements.
2. Run acceptance tests.
3. List completed, partial, missing, and failed requirements.
4. Record changed files/components.
5. Record test results and known limitations.
6. Update the build tracker and change log.
7. Present the audit to the user.
8. Wait for user approval before marking the phase Locked/Accepted and moving forward.

A phase must not be called complete merely because code was generated. It is complete only after tests and user review.

## 7. Persistent project tracking
The AI assistant must not claim it will remember progress automatically unless progress is written to a persistent tracker file or an equivalent durable project record. Keep:
- phase,
- requirement IDs,
- status,
- evidence/test result,
- known issue,
- next action,
- user acceptance.
Update `07_BUILD_TRACKER.csv` after each accepted step. If AI Studio cannot edit or preserve this file, provide an updated replacement for the user to upload/store.
