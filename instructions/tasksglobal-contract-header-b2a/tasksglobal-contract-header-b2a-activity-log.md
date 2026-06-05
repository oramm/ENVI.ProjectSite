# TasksGlobal OtherContract Header B2-a — Activity Log

## 2026-06-04 — Optional Task A: Fallback screenshot

- **Checkpoint:** OPT-A — Capture `b2a-fallback.png` (empty-anchor fallback)
- **Summary:**
  - Queried `envi-db` MCP for OtherContracts with empty `Alias` AND no
    `CONTRACTOR` entities. Found 50+ candidates across projects.
  - Selected Id=773 (`K.1 OŚ`, project JLA.GWS.01.NFOS): long name, no alias,
    no contractors, status W trakcie, linked to JLA.IK.01.
  - Captured element-screenshot via Playwright MCP after navigating to
    `#/tasksGlobal`, searching "Jelcz", clicking the project card.
  - **Fallback confirmed:** hero = full contract name (bold), "W trakcie" badge
    inline, identifier line secondary, **no L3 demoted name** (fallback omits it
    to avoid duplication) — matches plan's pseudocode exactly.
  - Also clarified: Europark contracts 1730/1731 have `Alias=""` and short
    `Name` ("EKO-WOD"/"SUW") — they ARE fallback cases too, not anchor cases
    (the previous session misread "EKO-WOD" as an alias; it's the contract Name).
- **Files touched:**
  - `tmp/ui-browser-loop/b2a-fallback.png` (new screenshot)
  - `instructions/tasksglobal-contract-header-b2a/tasksglobal-contract-header-b2a-progress.md`
  - `instructions/tasksglobal-contract-header-b2a/tasksglobal-contract-header-b2a-activity-log.md`
- **Impact type:** Verification (no code change)
- **Verification:** Playwright element screenshot + DB query evidence.
  Outstanding: OPT-B (commit) — awaits explicit user request.

## 2026-06-04 — N2 Visual verification + regression

- **Checkpoint:** N2 — Visual verification + regression
- **Summary:**
  - Verified B2-a live via Playwright MCP on `#/tasksGlobal` → `ZBS.ROZNE.01.PLAD
    Europark`, mock-logged-in (servers already up: backend :3000, frontend :9000).
  - ESIX/Energetyka OtherContract: hero (`alias · wykonawca`) dominant, status
    inline left, identifier without alias, name demoted — resting + active states.
  - ACTIVE state: right-side action menu does NOT collide with the left-block
    status badge (critical constraint confirmed).
  - Regression: OurContract `ZBS.IK.01` header unchanged; `.task-leaf-row` rows
    still subordinate (103 rows, 24px indent).
  - Fallback (`b2a-fallback.png`) not captured — no empty-anchor contract in
    current data (planned example now has alias `EKO-WOD`); code-correct by
    inspection.
- **Files touched:** docs only (progress + activity log). Screenshots written to
  `tmp/ui-browser-loop/` (b2a-other-resting/active, b2a-ourcontract-regression,
  b2a-task-leaf-rows).
- **Impact type:** Verification (no code change).
- **Verification:** Playwright MCP element screenshots + DOM `getComputedStyle`
  check on `.task-leaf-row`. Console: only legacy favicon-404 + `validateDOMNesting`
  button-in-button warning from `Section.tsx` (not from this change).

## 2026-06-04 — N1 Implement B2-a

- **Checkpoint:** N1 — Implement B2-a (code + CSS) + typecheck
- **Summary:**
  - Rebuilt `makeOtherContractTitleHeader` to Variant B2-a: hero
    (`alias · wykonawca`) + inline status badge (left block), identifier line
    without alias, demoted name line (anchor-only), unchanged L4 dates/manager.
  - Implemented empty-anchor fallback (hero = name, demoted line omitted).
  - Removed dead CSS (`.contract-contractors-label`, `.contract-contractors`),
    added `.contract-hero` and `.contract-name-demoted`.
  - `makeOurContractTitleHeader` left untouched.
- **Files touched:**
  - `src/TasksGlobal/TasksGlobal.tsx`
  - `src/TasksGlobal/TasksGlobal.css`
- **Impact type:** Code (UI)
- **Verification:** `npx tsc --noEmit` → exit 0. Diff confirms OurContract header
  unchanged. Browser/visual verification deferred to N2.

## 2026-06-04 — Planning

- **Checkpoint:** N0 / Planning
- **Summary:**
  - Explored 3 header variants + 3 name-prominence sub-variants + 2 status
    placements as local Bootstrap mockups on real Europark/ESIX data.
  - Locked Variant B2-a: anchor (`alias · wykonawca`) as hero, status inline
    after hero (left block — not right-aligned, to avoid collision with the
    ACTIVE-state action menu), long name demoted to a secondary line.
  - Locked decisions: no "city" (absent from payload), empty-anchor fallback,
    OtherContract-only scope, B2-a replaces the line-3 `Wykonawca:` block.
  - Authored sessionized planning pack (plan / progress / activity-log).
- **Files touched:**
  - `instructions/tasksglobal-contract-header-b2a/tasksglobal-contract-header-b2a-plan.md` (new)
  - `instructions/tasksglobal-contract-header-b2a/tasksglobal-contract-header-b2a-progress.md` (new)
  - `instructions/tasksglobal-contract-header-b2a/tasksglobal-contract-header-b2a-activity-log.md` (new)
- **Impact type:** Docs
- **Notes:** Implementation deferred to a separate session per product owner.
  Reference mockups in `tmp/ui-browser-loop/` (header-B2-status.png,
  header-variants-B.png).
