# Inline Create Case in Letter — Progress

## Status Snapshot
- **Active phase:** N5 — Docs + future-hook notes (flow complete; uniqueness icon unified)
- **Last completed checkpoint:** N4 (wired into LetterModalBody + onCreated auto-select + uniqueness-icon unification, build-verified 2026-06-02)
- **Next checkpoint:** N5

## Checkpoint Index
| ID | Title | Status |
| --- | --- | --- |
| N0 | UI design prototype + approval gate | CLOSED |
| N1 | InlineCreateDrawer skeleton (generic) | CLOSED |
| N2 | MilestoneSelector | CLOSED |
| N3 | Extend CaseSelectMenuElement + CaseModalBody reuse | CLOSED |
| N4 | Wire into LetterModalBody + onCreated auto-select | CLOSED |
| N5 | Docs + future-hook notes | OPEN |

## Sessions

### Session 0 — Planning
- **Scope:** Create planning pack; lock decisions; define checkpoints.
- **Completed:** Plan, progress, activity-log artifacts created. Data model and key files verified in code.
- **Evidence:** `instructions/inline-create-case-in-letter/*.md`.
- **Risks/Blockers:** Offcanvas-over-modal z-index/focus; milestone backend load contract; shared casesRepository instance.
- **Next session exact actions:** Execute N0 — produce a `frontend-design` prototype of the
  letter form + right-side create-case Offcanvas; capture screenshots to `tmp/ui-browser-loop/`;
  present to product owner for approval. Do NOT touch `src/` production files in N0.
- **Checkpoint status:** Planning CLOSED; N0 OPEN.

### Session 1 — N0 UI prototype
- **Scope:** Produce a frontend-design prototype of letter form + right-side Offcanvas create-case flow; get UX approval.
- **Completed:** Self-contained interactive prototype built and reviewed. Shows: Case selector with `+ Nowa sprawa` button, right Offcanvas (backdrop=false, letter form stays visible) with Milestone → Case type → Name → Save, auto-select of new case in `_cases`, and empty-milestone state linking to TasksGlobal.
- **Evidence:**
  - `tmp/ui-browser-loop/inline-create-case-prototype.html`
  - `tmp/ui-browser-loop/proto-1-letter-form.png`
  - `tmp/ui-browser-loop/proto-2-panel-open.png`
  - `tmp/ui-browser-loop/proto-3-empty-state.png`
- **Approval:** Product owner approved the layout/flow as-is ("wszystko jest ok") on 2026-06-02. No backdrop dimming, `+ Nowa sprawa` at field label, empty-state = link to TasksGlobal (no inline Milestone in PR1), panel width 420px — all accepted.
- **Risks/Blockers:** Offcanvas-over-modal focus/z-index to validate in N1; shared `casesRepository` instance identity for option refresh.
- **Next session exact actions:** Execute N1 — create `src/View/Modals/InlineCreateDrawer.tsx` (generic Offcanvas wrapper, FormProvider, Save/Cancel, `backdrop={false}`); verify it mounts over the letter modal and saves a trivial item; `yarn build` must pass.
- **Checkpoint status:** N0 CLOSED; N1 OPEN.

### Session 2 — N1 InlineCreateDrawer skeleton
- **Scope:** Create the generic Offcanvas-based create wrapper (`src/View/Modals/InlineCreateDrawer.tsx`) with FormProvider + Save/Cancel + `backdrop={false}`; no Case specifics.
- **Completed:** `InlineCreateDrawer<T extends RepositoryDataItem>` created per the plan's interface contract. Mirrors `GeneralModal`'s add path (FormProvider wiring, file-vs-JSON detection, `_contextData` injection, `repository.addNewItem` → `onCreated(newItem)` → `onHide()`). Uses `react-bootstrap` `Offcanvas placement="end" backdrop={false}` (420px) so the host modal stays visible/interactive. `onCreated` is the parent's hook to append + auto-select. TODO(graf) marker for nested drawers left in the file header doc comment.
- **Evidence:**
  - `npx tsc --noEmit` — clean (no output).
  - `yarn build` — `webpack ... compiled successfully in 19863 ms`, `Done in 49.78s` (full clean → tsc → webpack → copy-files).
  - Reused existing infra: `FormProvider` (`FormContext.ts`), `ModalBodyProps`, `parseFieldValuestoFormData`, `ErrorBoundary`, `ToolsFetch.sendClientErrorReport` — no duplication.
- **Design notes / deviations:** No edit mode (create-only by design). Visual "drawer over the letter modal" screenshot is deferred to N4 — the drawer is not yet mounted at any call site (it has no host until `LetterModalBody` wiring), so a meaningful over-modal screenshot is only possible once N3/N4 land. Build + type verification stands in as N1 evidence.
- **Risks/Blockers:** Offcanvas-over-modal focus/z-index still to validate visually once mounted (N4). Shared `casesRepository` instance identity for option refresh — to confirm in N3/N4.
- **Next session exact actions:** Execute N2 — add `MilestoneSelector` to `src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx`: local `_temp` repository, load milestones by contract via `loadItemsFromServerPOST([{ contractId, milestoneParentType: "CONTRACT" }])` (mirror `CaseSelectMenuElement`; confirm backend contract against `PS-nodeJS`), Typeahead single-select, leave `onRequestCreate` as a TODO(graf) hook. `yarn build` must pass.
- **Checkpoint status:** N1 CLOSED; N2 OPEN.

### Session 3 — N2 MilestoneSelector
- **Scope:** Add `MilestoneSelector` to `src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx`: local `_temp` repository, load milestones by contract, Typeahead single-select, TODO(graf) inline-create hook.
- **Completed:** `MilestoneSelector` added (immediately after `CaseSelectMenuElement`). Single-select Typeahead, default field name `_parent` (matches `Case._parent`). Uses its OWN local `RepositoryReact<MilestoneData>` via `useMemo` with `name: "milestoneSelector_temp"` and `getRoute: "milestones"` — repository is NOT passed via props (per task rule, avoids global-repo pollution). Loads on `_contract` change via `loadItemsFromServerPOST([{ contractId: _contract.id, milestoneParentType: "CONTRACT" }])`; options synced FROM `localRepository.items`; clears when no contract. labelKey `_FolderNumber_TypeName_Name` (reliably computed backend-side). `onRequestCreate?: () => void` left as a TODO(graf) hook (declared, unused — future inline Milestone create).
- **Backend contract confirmed (PS-nodeJS):** `POST /milestones` (`src/contracts/milestones/MilestonesRouters.ts`) reads `req.parsedBody.orConditions` (`MilestonesSearchParams[]`, uses `contractId`) and a **top-level** `req.parsedBody.parentType` that **defaults to `"CONTRACT"`** when absent. `RepositoryReact.loadItemsFromServerPOST` sends only `{ orConditions }`, so `parentType` defaults to CONTRACT. The `milestoneParentType` key inside the orCondition is **ignored** by the milestones endpoint (`validateConditions` only checks `contractId`/`offerId`); kept for shape-consistency with `CaseSelectMenuElement`. Net: loading by `contractId` returns that contract's milestones correctly.
- **Evidence:**
  - `yarn build` — `webpack 5.104.1 compiled successfully in 37654 ms`, `Done in 65.53s` (full clean → tsc → webpack → copy-files).
  - Reused existing infra: `Typeahead`, `Controller`/`useFormContext`, `ensureLabelKey`, `ErrorMessage`, `RepositoryReact` — no duplication. Local-`_temp`-repo pattern mirrors `LetterSelector`/`SkillSelector` in the same file.
- **Design notes / deviations:** Plan's draft interface listed `repository` as a prop; per this session's explicit rule the selector owns a local `_temp` repo instead (no prop). Live screenshot of milestone options deferred to N3/N4 — `MilestoneSelector` is not yet mounted at any call site (no host form until the drawer body composition in N3), so a meaningful screenshot needs N3/N4. Build + type verification stands as N2 evidence (same rationale as N1).
- **Risks/Blockers:** Offcanvas-over-modal focus/z-index still to validate visually once mounted (N4). Shared `casesRepository` instance identity for option refresh — to confirm in N3/N4.
- **Next session exact actions:** Execute N3 — extend `CaseSelectMenuElement` with optional `onRequestCreate?: () => void` (render `+ Nowa sprawa` only when provided; omitted ⇒ unchanged behavior at all existing call sites). Compose the drawer body = `MilestoneSelector` then existing `CaseModalBody` (`src/TasksGlobal/Modals/Case/CaseModalBody.tsx`); verify `CaseModalBody` works with `contextData = milestone` (drawer injects it as `_parent`). `yarn build` must pass.
- **Checkpoint status:** N2 CLOSED; N3 OPEN.

### Session 4 — N3 Extend CaseSelectMenuElement + drawer body composition
- **Scope:** Add optional `onRequestCreate?: () => void` to `CaseSelectMenuElement` (`+ Nowa sprawa` button only when provided; omitted ⇒ unchanged). Compose drawer body = `MilestoneSelector` + existing `CaseModalBody`; verify `CaseModalBody` works with `contextData = selected Milestone` (injected as `_parent`).
- **Completed:**
  - `CaseSelectMenuElement` (`BussinesObjectSelectors.tsx`) extended: added `onRequestCreate?: () => void` prop. When provided, the Typeahead is wrapped in a `d-flex` row with an `outline-success` `+ Nowa sprawa` button (`text-nowrap`, `disabled={readonly}`); when omitted, the component returns the bare `<Controller/>` selector — byte-for-byte the previous render path. Added `Button` to the `react-bootstrap` import.
  - New `src/TasksGlobal/Modals/Case/CaseInlineCreateBody.tsx`: composed `ModalBodyProps<Case>` body that renders `MilestoneSelector` (writes `_parent`) then, once a milestone is watched in the form, renders the **unmodified** `CaseModalBody` with `contextData = selectedMilestone`. Before a milestone is chosen it shows a light hint Alert. This satisfies the contract "drawer injects Milestone as `_parent`": `CaseModalBody` reads `initialData?._parent || contextData` and drives `CaseTypeSelector` via `_parent._type`, so deferring its mount until a milestone exists avoids the `_parent._type` crash. `_contract` for `MilestoneSelector` flows via `additionalProps._contract`.
  - Reuse-only: no edits to `CaseModalBody`, `MilestoneSelector`, or `InlineCreateDrawer` — purely composition.
- **Evidence:**
  - `npx tsc --noEmit` — clean (no output).
  - `yarn build` — `webpack 5.104.1 compiled successfully in 44464 ms`, `Done in 75.63s` (full clean → tsc → webpack → copy-files).
  - Call-site audit (grep `CaseSelectMenuElement` across `**/*.tsx`): 7 usages (`Letters/.../LetterModalBody`, `Letters/.../LetterFilterBody`, `Offers/.../LetterModalBody`, `Offers/.../LetterFilterBody`, `Contracts/.../TasksFilterBody`, `Contracts/.../TasksFilterBodyCommonFields`, `Contracts/.../MeetingArrangementModalBody`) — none pass `onRequestCreate`, so all keep the bare-selector render path. Behavior unchanged confirmed.
- **Design notes / deviations:** Live over-modal screenshot (drawer with milestone + case fields) deferred to N4 — `CaseInlineCreateBody` / `InlineCreateDrawer` are not mounted at any call site until the `LetterModalBody` wiring lands, so a meaningful screenshot is only possible in N4. Build + type verification + call-site audit stand as N3 evidence (same rationale as N1/N2). Button placement is "beside Typeahead" per the N3 task; the N0-approved "at field label" placement is a host-level concern handled in N4's `LetterModalBody` wiring.
- **Risks/Blockers:** Offcanvas-over-modal focus/z-index still to validate visually once mounted (N4). Shared `casesRepository` instance identity for option refresh — to confirm in N4 (drawer must use the SAME `casesRepository` the selector reads). Note `makeCaseValidationSchema` validates only `name`/`description`, not `_parent`/`_type`; N4 must gate Save / handle the no-milestone state so a case can't be created without a parent.
- **Next session exact actions:** Execute N4 — wire `InlineCreateDrawer` into `src/Letters/LettersList/Modals/LetterModalBody.tsx`: add `const [showCreateCase, setShowCreateCase] = useState(false)`; pass `onRequestCreate={() => setShowCreateCase(true)}` to `CaseSelectMenuElement`; mount `<InlineCreateDrawer<Case>>` with `repository={casesRepository}` (SAME instance as the selector), `ModalBodyComponent={CaseInlineCreateBody}`, `additionalModalBodyProps={{ _contract }}`, `makeValidationSchema={makeCaseValidationSchema}`; implement `onCreated(newCase)` → sync from `casesRepository.items`, append to selector options, `setValue("_cases", [...current, newCase], { shouldValidate: true })`, `updateSnapshot()` if applicable; handle empty-milestone state (link to TasksGlobal per N0). `yarn build` must pass; capture full-flow screenshots.
- **Checkpoint status:** N3 CLOSED; N4 OPEN.

### Session 5 — N4 Wire into LetterModalBody + onCreated auto-select + uniqueness-icon unification
- **Scope:** Mount `InlineCreateDrawer<Case>` in `LetterModalBody`, wire `+ Nowa sprawa` → drawer
  → save → auto-select the new case in `_cases` (from the single-source-of-truth `casesRepository.items`).
  Verify end-to-end in the browser. Unify the case/milestone "multiplicity" icon (emoji → FontAwesome).
- **Completed:**
  - **Wiring (`LetterModalBody.tsx`):** added `const [showCreateCase, setShowCreateCase] = useState(false)`
    + a `caseOptionsRefreshToken` counter. `CaseSelectMenuElement` now receives
    `onRequestCreate={() => setShowCreateCase(true)}` and `refreshToken={caseOptionsRefreshToken}`.
    Mounted `<InlineCreateDrawer<Case>>` with `repository={casesRepository}` — the SAME instance the
    selector reads (resolves the N3 shared-instance risk) — `ModalBodyComponent={CaseInlineCreateBody}`,
    `additionalModalBodyProps={{ _contract }}`, `makeValidationSchema={makeInlineCaseValidationSchema}`,
    `onCreated={handleCaseCreated}`.
  - **Auto-select (`handleCaseCreated`):** after `addNewItem` has appended the case to
    `casesRepository.items`, it re-reads the item from the repo (source of truth),
    `setValue("_cases", [...current, created], { shouldValidate: true })` (dedup-guarded), and bumps
    `caseOptionsRefreshToken` so the selector rebuilds its options from `repository.items`. No direct
    state mutation — only `setValue`/`setState`.
  - **Selector refresh hook (`CaseSelectMenuElement`):** added optional `refreshToken?: number`; added to
    the fetch `useEffect` deps so a token bump re-runs option-loading from `repository.items`. Omitted
    ⇒ unchanged behavior (existing 7 call-sites untouched).
  - **Validation verified:** `InlineCreateDrawer` runs `mode: "onChange"` + `yupResolver`, so the whole
    schema re-validates on every `_type` change. The conditional `name` requirement in
    `CaseValidationSchema.ts` fires immediately: multiple-type ⇒ "Nazwa sprawy" visible + required;
    unique-type ⇒ hidden, `name=null`. (Closed the open question from the prior handoff.)
  - **Uniqueness-icon unification (emoji 🔐/♾ → FontAwesome):** new shared
    `UniquenessIcon({ isUnique, title? })` in `BussinesObjectSelectors.tsx` — `faLock` (grey, unique) /
    `faLayerGroup` (blue, multiple), `size="sm"`, tooltip via `title`. `CaseMultiplicityIcon({ caseType })`
    delegates to it. Used in: `CaseTypeSelector` option render ("+ Nowa sprawa" panel) and the
    "Dotyczy spraw" list; `TasksGlobal.tsx` tree (`makeMilestoneTitleLabel` → `isUniquePerContract`,
    `makeCaseTitleLabel` → `isUniquePerMilestone`, both now return JSX). Removed `getSymbolByUniqueness`
    and deleted `src/View/Symbols.ts` (zero remaining references).
- **Evidence:**
  - End-to-end browser run (dev :9000, mock-login): "Rejestruj wychodzące" → project → contract →
    "+ Nowa sprawa" → side panel (Offcanvas over the modal, host stays visible) → milestone → type →
    Save → new case auto-checked in "Dotyczy spraw". Confirmed manually.
  - `npx tsc --noEmit` — clean (exit 0).
  - `yarn build` — `webpack 5.104.1 compiled successfully in 36448 ms`, `Done in 74.58s`
    (full clean → tsc → webpack → copy-files).
  - Screenshots: `n4-03-before-letter-form-with-button.png`, `n4-04-drawer-open-save-disabled.png`.
- **Design notes / deviations:** Offcanvas-over-modal z-index/focus (the long-standing N0→N3 risk)
  validated visually — `backdrop={false}` keeps the letter modal visible and the panel mounts above it.
  Shared-`casesRepository`-instance risk resolved (drawer + selector share one instance; refresh via token).
- **Risks/Blockers:** None blocking. Remaining: optional screenshots of the new icons in the expanded
  "Typ Sprawy" list and the TasksGlobal tree (cosmetic evidence only).
- **Next session exact actions:** Execute N5 — record the future-hook notes (`onRequestCreate` on
  `MilestoneSelector` for inline Milestone create; generic `InlineCreateDrawer` reuse for other
  pick-or-create selectors) in the plan/docs, attach the icon screenshots, and close N5.
- **Checkpoint status:** N4 CLOSED; N5 OPEN.
