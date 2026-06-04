# Zero-Waste AI Production Workflow

**For MalickLand / MEDjAi / BloFin Builds**

**Purpose:** Prevent patch-chasing, architecture confusion, unsafe deployments, and wasted AI work.

---

## Core Rule

No one writes code until these 5 questions are answered:

1. What is the current truth?
2. What exact outcome are we trying to create?
3. What files, services, routes, env vars, databases, or deployment configs may be touched?
4. How will we prove it works?
5. Who receives the next handoff after completion?

**No answer = no build.**

### Default Operating Boundary

- Use existing project architecture unless Phil explicitly approves a change.
- Deployment is always **NO** unless Phil explicitly approves deployment.

For **MEDjAi / BloFin**:

```
PAPER_MODE=true
ALLOW_LIVE_ORDER=false
```

These must remain locked unless Phil explicitly approves live-trading promotion in a separate approval step.

---

## Master Handoff Chain

Use this chain for every major task:

```
Claude Code → Gemini → Codex → Phil → Claude Code → Codex → Phil → Deploy → Verify → Document
```

### Role Responsibilities

**Claude Code:**
- Inspect repo truth.
- Build only after approval.
- Make the smallest safe change.
- Produce completion reports.
- Must not guess, deploy without approval, rewrite architecture, or touch unrelated files.

**Gemini:**
- Reconcile architecture.
- Identify stale, dead, or conflicting paths.
- Recommend the smallest safe implementation path.
- Must not modify files.

**Codex:**
- Independently verify audit, plan, build, tests, scope, deployment risk, and rollback.
- Must not rubber-stamp.
- Must not modify files unless Phil explicitly changes its role.

**Phil:**
- Approves scope, business direction, compliance direction, trading risk, deployment, and rollback decisions.

**ChatGPT:**
- Creates prompts, operating documents, checklists, and handoff templates.
- Must not pretend repo truth without evidence.

**Cursor / Copilot:**
- May assist inside the editor only.
- Must not make strategic decisions.

---

## Phase 0 — Truth Lock

**Owner:** Claude Code
**Mode:** READ-ONLY ONLY

**Allowed:**
- Inspect files, logs, repo state, deployment config, tests, routes
- Inspect database/storage references
- Inspect env var usage

**Forbidden:**
- No edits, commits, installs, deploys, config changes
- No architectural rewrites
- No cleanup

**Required Output — TRUTH AUDIT REPORT:**

1. Repo path
2. Branch
3. Remote
4. Runtime entrypoint
5. Current app architecture
6. Current production path
7. Current database/storage path
8. Current routes
9. Current env vars
10. Deployment configuration
11. Existing tests
12. Confirmed facts
13. Assumptions
14. Unknowns
15. Contradictions
16. Broken or stale paths
17. Deployment risks
18. Recommended next action requiring Phil approval

**Gate:** Nothing moves forward until the report clearly separates: Confirmed / Assumed / Unknown / Contradicted.

---

## Phase 1 — Architecture Reconciliation

**Owner:** Gemini
**Mode:** ANALYSIS ONLY
**Input:** Claude's Truth Audit Report

**ARCHITECTURE RECONCILIATION MEMO:**

1. What is confirmed true?
2. What is unknown?
3. What is contradicted?
4. What architecture should be treated as current?
5. What should remain untouched?
6. What is stale, dead, duplicated, or conflicting?
7. What is the smallest safe implementation path?
8. What risks could cause patch-chasing?
9. What should Claude build first?
10. What should Codex verify after?
11. Recommended next action requiring Phil approval

**Gate:** No build until Gemini gives a clean, scoped implementation path.

---

## Phase 2 — Independent Verification

**Owner:** Codex
**Mode:** READ-ONLY VERIFICATION
**Input:** Claude Truth Audit Report + Gemini Architecture Reconciliation Memo

**INDEPENDENT VERIFICATION REPORT:**

1. Does Claude's audit match the repo?
2. Does Gemini's architecture memo match the repo?
3. Are any proposed changes unsafe?
4. Are any files missing from the plan?
5. Are deployment risks addressed?
6. Are env var risks addressed?
7. Are data persistence risks addressed?
8. Are tests and acceptance criteria complete?
9. Is implementation ready?

Codex must output **only one** of these statuses:

```
READY TO BUILD
```

or

```
NOT READY — BLOCKERS:
1.
2.
3.
```

No partial green lights.

---

## Phase 3 — Phil Approval

**Owner:** Phil

Phil approves only this scope — **APPROVED BUILD SCOPE:**

- Repo:
- Branch:
- Files allowed:
- Files forbidden:
- Exact objective:
- Acceptance tests:
- Manual smoke test:
- Deployment allowed? Yes/No
- Rollback required? Yes/No
- Compliance risk accepted? Yes/No/Not applicable
- Trading/live-order risk accepted? Yes/No/Not applicable

**Default:** Deployment allowed = No

---

## Phase 4 — Build Execution

**Owner:** Claude Code
**Mode:** SMALLEST SAFE CHANGE

Claude may only:
- Work on the approved branch
- Touch approved files
- Make one scoped change at a time
- Add or update relevant tests
- Keep the system runnable
- Produce a completion report

Claude may not:
- Rewrite architecture
- Replace working systems
- Change env vars without approval
- Deploy without approval
- Add new services without approval
- Clean up unrelated files
- Touch forbidden files
- Expand scope without Phil approval

**Required output after build — COMPLETION REPORT:**

```
Task:
Branch:
Commit:
Files changed:
Files not touched:
Approved scope followed? Yes/No
Tests run:
Test results:
Manual verification:
Known risks:
Deployment risk:
Rollback method:
Next recommended owner:
Next recommended action:
Approval needed from Phil:
```

---

## Phase 5 — Post-Build Verification

**Owner:** Codex
**Mode:** VERIFIER ONLY

Codex verifies — **POST-BUILD VERIFICATION:**

1. Did Claude stay inside approved scope?
2. Did the changed code match the requested objective?
3. Did tests pass?
4. Did anything unrelated change?
5. Are env/deployment assumptions safe?
6. Is data persistence safe?
7. Is rollback clear?
8. Is it ready for deploy approval?

Codex must output one of:

```
PASS — READY FOR PHIL DEPLOY APPROVAL
```

or

```
FAIL — FIX REQUIRED:
1.
2.
3.
```

---

## Phase 6 — Deploy Gate

**Owner:** Phil approves. Claude deploys only if explicitly approved.

**DEPLOYMENT APPROVAL CHECKLIST:**

- Current production commit:
- New commit:
- Branch:
- Deployment target:
- Healthcheck:
- Rollback command:
- Database migration? Yes/No
- Env var changes? Yes/No
- User-facing risk:
- Broker/compliance risk:
- Trading/live-order risk:
- Deployment approved by Phil? Yes/No

For **MEDjAi / BloFin** — these must remain locked unless Phil explicitly approves live trading in a separate written approval:

```
PAPER_MODE=true
ALLOW_LIVE_ORDER=false
exchange_orders_enabled=false
live_orders_enabled=false
```

---

## Phase 7 — Production Verification

**Owner:** Claude checks. Codex verifies.

**PRODUCTION VERIFICATION:**

1. Health endpoint works
2. Main user path works
3. Admin path works
4. Lead/contact path works
5. Logs show no immediate errors
6. Database persistence confirmed
7. Rollback still available
8. Screenshots or command output captured
9. Next owner/action documented

**MalickLand minimum production smoke test:**
- Homepage loads
- Listing page loads
- `/admin` loads
- `/api/properties` works
- `/api/contacts` accepts a test lead
- Test lead is stored
- Notification path verified or marked not configured
- Brokerage/compliance footer visible
- MLS number visible on listing marketing where applicable

**MEDjAi / BloFin minimum production smoke test:**
- `/health` works
- `/status` confirms paper mode
- `exchange_orders_enabled=false`
- `live_orders_enabled=false`
- webhook rejects invalid auth
- webhook accepts diagnostic auth-only signal
- duplicate signal rejected
- stale signal rejected
- no exchange order placed

---

## No Patch-Chasing — Definition of Done

A task is **not** done when code changes.

A task is done **only** when:

1. Current truth was confirmed first
2. Scope was approved
3. Code stayed inside scope
4. Tests were run
5. Manual smoke test passed
6. No unrelated files changed
7. Deployment risk was stated
8. Rollback path exists
9. Next owner/action is written
10. Phil knows whether to approve, reject, fix, or deploy

Every task must end with:

```
Done:
Verified by:
Remaining risk:
Next owner:
Next action:
Approval needed:
```

---

## One-Paste Master Prompt for Claude Code

```
You are Claude Code working on Phil Malick's active project.

MODE:
PLAN FIRST.
READ-ONLY UNTIL APPROVED.
DO NOT MODIFY FILES UNTIL PHIL APPROVES THE IMPLEMENTATION SCOPE.

OBJECTIVE:
Build or fix the requested item without creating patch-chasing, architecture
confusion, production risk, trading risk, compliance risk, or unrelated changes.

OPERATING RULES:
- Confirm current repo truth before proposing changes.
- Do not guess.
- Do not rewrite working systems.
- Do not modify files until Phil approves scope.
- Do not deploy unless Phil explicitly approves deployment.
- Make the smallest safe change.
- Every claim must cite file path and code evidence.
- Every proposed change must include tests and rollback.
- Deployment defaults to NO.
- For MEDjAi / BloFin, keep PAPER_MODE=true and ALLOW_LIVE_ORDER=false unless Phil explicitly approves otherwise.

PHASE 1 — TRUTH CHECK
Report:
1. Repo path
2. Branch
3. Remote
4. Current app architecture
5. Runtime entrypoint
6. Routes involved
7. Env vars involved
8. Database/files/storage involved
9. Deployment config involved
10. Existing tests involved
11. Confirmed facts
12. Assumptions
13. Unknowns
14. Contradictions
15. Risks

PHASE 2 — IMPLEMENTATION PLAN
Before editing, provide:
1. Exact objective
2. Files to change
3. Files not to touch
4. Step-by-step plan
5. Tests to run
6. Manual smoke test
7. Rollback plan
8. Deployment risk
9. Compliance/security/trading risks
10. Questions or blockers

PHASE 3 — WAIT
Stop after the plan and wait for Phil approval.

FINAL OUTPUT FORMAT:
Recommended next action requiring Phil approval:
```

---

## One-Paste Master Prompt for Gemini Reconciliation

```
You are Gemini acting as architecture reconciler for Phil Malick.

MODE:
ANALYSIS ONLY.
DO NOT WRITE CODE.
DO NOT MODIFY FILES.
DO NOT RECOMMEND REBUILDS UNLESS ABSOLUTELY REQUIRED.

INPUT:
Use Claude's Truth Audit and, when available, Codex's verification report.

TASK:
Produce an architecture reconciliation memo that prevents wasted work,
architecture drift, and patch-chasing.

ANSWER:
1. What is confirmed true?
2. What is unknown?
3. What is contradicted?
4. What architecture should be treated as current?
5. What should not be touched?
6. What is stale, dead, duplicated, or conflicting?
7. What is the smallest safe implementation path?
8. What tests prove completion?
9. What risks would cause follow-up patches?
10. What should Claude do next?
11. What should Codex verify after?

FINAL LINE:
Recommended next action requiring Phil approval:
```

---

## One-Paste Master Prompt for Codex Verification

```
You are Codex acting as independent verifier for Phil Malick.

MODE:
READ-ONLY VERIFICATION.
NO FILE MODIFICATIONS.
NO COMMITS.
NO DEPLOYS.
NO INSTALLS.

TASK:
Verify whether Claude's audit, plan, or build is correct, scoped, safe,
and evidence-based.

CHECK:
1. Does the stated repo/branch match reality?
2. Do the changed files match the approved scope?
3. Were any unrelated files changed?
4. Does the implementation match the stated objective?
5. Are tests present and relevant?
6. Do tests pass?
7. Is deployment config affected?
8. Are env vars affected?
9. Is data persistence affected?
10. Is rollback clear?
11. Are there compliance, security, broker, or live-trading risks?
12. Is the next owner/action clear?

OUTPUT:
PASS or FAIL.

If PASS:
- Explain why
- List exact file/path evidence
- State next action requiring Phil approval

If FAIL:
- List blockers
- List exact files/evidence
- Recommend the smallest safe fix
```

---

## Immediate Implementation Order

Use this order for the next work cycle:

1. MalickLand compliance, wording, disclaimers
2. Lead capture and lead tagging
3. Admin/listing stability
4. SEO, schema, sitemap, property pages
5. MEDjAi / BloFin bot gates and paper-mode verification
6. Strategy optimization or expansion only after the above are stable

**Priority principle:**
Compliance first. Lead reliability second. Bot gates third. Optimization last.

---

## Core Operating Principle

Every task must produce the next task.

Never end with only:

```
Done.
```

Always end with:

```
Done:
Verified by:
Remaining risk:
Next owner:
Next action:
Approval needed:
```
