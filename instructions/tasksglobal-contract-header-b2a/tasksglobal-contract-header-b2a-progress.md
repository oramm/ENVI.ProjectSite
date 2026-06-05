# TasksGlobal OtherContract Header B2-a — Progress

## Current Status

- **Active phase:** N3 COMPLETE — hero separator aligned to approved mockup,
  `tsc` green, visually verified on real data. Pending: optional commit.
- **Last completed checkpoint:** N3 — light `·` separator (`.contract-hero-sep`)
  verified in the running app (computed `color:#c7ccd1`, `font-weight:400`); no
  collision with ACTIVE action menu; OurContract regression clean.
- **Next checkpoint:** None. Optional commit on user request.

## Checkpoint Index

| ID | Title | Status |
| --- | --- | --- |
| N1 | Implement B2-a (code + CSS) + typecheck | DONE |
| N2 | Visual verification + regression | DONE |
| OPT-A | Fallback screenshot (`b2a-fallback.png`) | DONE |
| OPT-B | Commit B2-a on branch | DONE (committed 175c124) |
| N3 | Hero separator fidelity to approved mockup | DONE (code + visual verify) |

## Mockup fidelity note (source of truth)

The approved visual is the mockup reconstructed at
`tmp/ui-browser-loop/header-B2a-approved.html` (originally
`header-B2-status.png`). Hero = `alias · wykonawca`, where the middle `·` is a
**light, thin separator** (`#c7ccd1`, weight 400) — NOT bold/dark like the rest
of the hero. The user confirmed: "Energetyka" = alias, "ESIX Sp. z o.o" =
contractor; OurContract (ENVI) intentionally has no contractor and stays as-is.

**Identifier line — RESOLVED (2026-06-05):** user confirmed the identifier must be
`${_type.name} ${number} ➔ ${ourId}` — i.e. KEEP the type-name prefix (plan wins
over the simplified mockup). Code already matches
(`TasksGlobal.tsx` → `${contract._type.name} ${contract.number} ➔ ${ourRelatedId}`);
no change needed. No longer an open deviation.

## Sessions

### Session 4 — N3 Hero separator fidelity to mockup (2026-06-05)

- **Scope:** The committed B2-a (175c124) differed visually from the approved
  mockup: the `·` between alias and contractor was rendered via
  `heroParts.join(" · ")`, so it inherited the hero's bold/dark style instead of
  the mockup's light thin separator. Reconstructed the approved mockup from the
  prior session transcript and aligned the live code to it.
- **Completed:**
  - Recovered approved mockup → `tmp/ui-browser-loop/header-B2a-approved.html`
    (was `header-B2-status.png`, since cleaned from `tmp/`).
  - `makeOtherContractTitleHeader` (`src/TasksGlobal/TasksGlobal.tsx`): replaced
    `heroText` string join with `heroNodes` that interleaves a
    `<span className="contract-hero-sep"> · </span>` between anchor parts; fallback
    (no anchor) still renders the plain contract name.
  - `TasksGlobal.css`: added `.contract-hero-sep { color:#c7ccd1; font-weight:400 }`.
  - Confirmed `React` namespace already imported (Fragments/spans used).
- **Evidence:** `npx tsc --noEmit` → exit 0.
- **Risks/Blockers:** Visual verification in the running app still pending (start
  frontend :9000 + backend :3000, mock-login, `#/tasksGlobal` → Europark →
  ESIX/Energetyka header; compare hero separator to
  `header-B2a-approved.html`).
- **Next session exact actions:**
  1. Visual verify N3 on real data (Europark ESIX/Energetyka), capture
     `b2a-hero-sep.png`; confirm the `·` is light/thin and the OurContract header
     is still unchanged.
  2. ID-line deviation — RESOLVED: keep `${_type.name} ${number} ➔ ${ourId}`
     (already in code, no change).
  3. Commit on a branch off `master` if approved.
- **Checkpoint status:** N3 CODE DONE; visual verify OPEN.

### Session 0 — Planning (2026-06-04)

- **Scope:** Define the sessionized plan for the OtherContract header redesign
  (Variant B2-a) in TasksGlobal.
- **Completed:**
  - Variant exploration done via local Bootstrap mockups on real data
    (project Europark, contract ESIX/Energetyka).
  - Decisions locked: B2-a layout, status inline (not right-aligned), no city,
    empty-anchor fallback, OtherContract-only scope.
  - Planning artifacts created under `instructions/tasksglobal-contract-header-b2a/`.
- **Evidence:**
  - Mockups: `tmp/ui-browser-loop/header-B2-status.png`,
    `tmp/ui-browser-loop/header-variants-B.png`.
- **Risks/Blockers:**
  - Working tree has uncommitted changes from this session
    (`.task-leaf-row` subordination — KEEP; line-3 `Wykonawca:` block — to be
    REPLACED by B2-a). Executor must `git diff` before editing.
  - Empty alias+contractor contracts exist in real data → fallback is mandatory,
    not optional.
- **Next session exact actions (N1):**
  1. `git status` + `git diff src/TasksGlobal/` to confirm working-tree state.
  2. Rebuild `makeOtherContractTitleHeader` (`src/TasksGlobal/TasksGlobal.tsx`)
     per the plan's interface contract.
  3. Update `TasksGlobal.css`: add `.contract-hero`, `.contract-name-demoted`;
     remove dead `.contract-contractors-label` (+ `.contract-contractors` if unused).
  4. `npx tsc --noEmit` → expect exit 0.
- **Checkpoint status:** N1 OPEN.

### Session 1 — N1 Implement B2-a (2026-06-04)

- **Scope:** Execute checkpoint N1 — rebuild `makeOtherContractTitleHeader` to
  Variant B2-a, update CSS, typecheck.
- **Completed:**
  - Confirmed working-tree state via `git status` / `git diff src/TasksGlobal/`
    (matched plan: `.task-leaf-row` KEEP; line-3 `Wykonawca:` block to REPLACE).
  - Rebuilt `makeOtherContractTitleHeader` (`src/TasksGlobal/TasksGlobal.tsx`):
    - L1 HERO `alias · wykonawca` (`.contract-hero`) + `ContractStatusBadge`
      inline in the left block (no `justify-content-between`).
    - L2 identifier `${_type.name} ${number} ➔ ${ourRelatedId}` — alias removed.
    - L3 demoted name (`.contract-name-demoted`) rendered only when `hasAnchor`.
    - Empty-anchor fallback: `heroParts = [alias, ...contractorNames].filter(Boolean)`;
      when empty → hero = name, L3 omitted.
    - L4 dates/manager unchanged.
  - CSS: removed dead `.contract-contractors-label` + `.contract-contractors`
    (grep confirmed no other caller); added `.contract-hero`,
    `.contract-name-demoted`.
  - `makeOurContractTitleHeader` untouched (diff confirms no mention).
- **Evidence:**
  - `npx tsc --noEmit` → `EXIT=0`.
  - `git diff src/TasksGlobal/TasksGlobal.tsx` shows no `makeOurContract*` lines.
- **Risks/Blockers:** None. Visual verification (N2) still pending — needs running
  frontend + backend and ui-browser-loop screenshots on real Europark data.
- **Checkpoint status:** N1 DONE; N2 OPEN.

### Session 2 — N2 Visual verification + regression (2026-06-04)

- **Scope:** Execute checkpoint N2 — verify B2-a on real data and confirm no
  regression. Servers already running (backend :3000, frontend :9000),
  mock-logged-in as `playwright_test_user`. Verified via Playwright MCP
  (`#/tasksGlobal` → search `Europark` → `ZBS.ROZNE.01.PLAD Europark`).
- **Completed:**
  - **OtherContract B2-a (ESIX/Energetyka), resting:** hero
    `Energetyka · ESIX Sp. z o.o` dominant + `W trakcie` status badge inline in
    the left block; identifier line `ŻÓŁTY ZPW/35/IGP/2025-ZADANIE 3 ➔ ZBS.IK.01`
    (uppercase, no alias dup); demoted name
    `Budowa infrastruktury elektroenergetycznej…` reads as second-plane; dates +
    manager unchanged. → `b2a-other-resting.png`.
  - **OtherContract B2-a, ACTIVE:** clicked the header to make it the editing
    section; right-side action menu (collapse · Dysk Google · edit ·
    `Dodaj kamień milowy`) appeared on the right while hero + status badge stayed
    on the LEFT — **no collision** (critical constraint satisfied). →
    `b2a-other-active.png`.
  - **OurContract regression (ZBS.IK.01):** header visually identical to before —
    `ZBS.IK.01 | ZĄBKOWICE STREFA` + status, name as h6 hero, dates/manager.
    `makeOurContractTitleHeader` confirmed untouched. → `b2a-ourcontract-regression.png`.
  - **`.task-leaf-row` regression:** intact — `document.querySelectorAll('.task-leaf-row')`
    = 103 rows, computed `padding-left: 24px` (subordination indent present); task
    rows render visibly subordinate under their Sprawa parents. →
    `b2a-task-leaf-rows.png`.
- **Evidence (in `tmp/ui-browser-loop/`):** `b2a-other-resting.png`,
  `b2a-other-active.png`, `b2a-ourcontract-regression.png`, `b2a-task-leaf-rows.png`.
- **Risks/Blockers:**
  - Pre-existing/legacy console items only (NOT from this change): favicon 404,
    and a React `validateDOMNesting` `<button>`-in-`<button>` warning from
    `ToggleExpandButton`/`RowActionMenu` inside the accordion header button
    (`Section.tsx`), triggered only when the action menu renders.
- **Checkpoint status:** N2 DONE. Plan complete.

### Session 3 — Optional Task A: Fallback screenshot (2026-06-04)

- **Scope:** Capture `b2a-fallback.png` — OtherContract with empty alias AND
  empty `_contractors` list (fallback: hero = name, L3 demoted line omitted).
- **Completed:**
  - DB query via `envi-db` MCP identified multiple OtherContracts with empty
    `Alias` and no CONTRACTOR-role entity linked.
  - Selected contract Id=773: `K.1 OŚ` / `Rozbudowa i modernizacja oczyszczalni
    ścieków w Jelczu-Laskowicach`, project `JLA.GWS.01.NFOS`. Status: W trakcie,
    OurIdRelated: JLA.IK.01. Confirmed empty alias + 0 contractor records in DB.
  - Navigated Playwright to `#/tasksGlobal`, searched "Jelcz", selected
    JLA.GWS.01.NFOS, captured element-screenshot of the accordion header.
  - **Fallback verified visually:**
    - L1 hero: full contract name "Rozbudowa i modernizacja oczyszczalni ścieków
      w Jelczu-Laskowicach" in bold + "W trakcie" badge inline (left block).
    - L2 identifier: "CZERWONY K.1 OŚ → JLA.IK.01" uppercase, secondary.
    - **L3 demoted name: ABSENT** — correctly omitted (no duplicate of hero).
    - L4 dates + manager: intact.
- **Evidence:** `tmp/ui-browser-loop/b2a-fallback.png`
- **Risks/Blockers:** None. All optional tasks complete.
- **Note on Europark contracts 1730/1731:** DB shows `Alias = ""` and `Name =
  "EKO-WOD"/"SUW"` — these are also fallback cases (short names used as hero),
  not anchor cases. The previous session's observation that 1730 "gained alias
  EKO-WOD" was incorrect; the Name field IS "EKO-WOD" (no alias set).
- **Checkpoint status:** OPT-A DONE.
