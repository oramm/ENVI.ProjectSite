# Inline Create Case in Letter — Activity Log

## 2026-06-02 — Planning
- **Checkpoint:** (planning)
- **Summary:**
  - Diagnosed pain point: Case selector in letter form only picks; Case CRUD only in TasksGlobal.
  - Locked decisions: side panel (Offcanvas), Case-level only, design-first approval gate, reusable drawer.
  - Verified data model (Contract → Milestone → Case) and that no MilestoneSelector / Offcanvas exist yet.
  - Defined checkpoints N0–N5.
- **Files touched:**
  - `instructions/inline-create-case-in-letter/inline-create-case-in-letter-plan.md`
  - `instructions/inline-create-case-in-letter/inline-create-case-in-letter-progress.md`
  - `instructions/inline-create-case-in-letter/inline-create-case-in-letter-activity-log.md`
- **Impact type:** Docs
- **Notes:** N0 is an approval gate — frontend-design prototype must be approved before any `src/` changes.

## 2026-06-02 — N0 UI prototype (CLOSED)
- **Checkpoint:** N0
- **Summary:**
  - Built interactive frontend-design prototype of the inline create-case flow.
  - Captured 3 states: letter form, panel open, empty-milestone state.
  - Product owner approved UX as-is; decisions locked (no backdrop dimming, button at field label, empty-state links to TasksGlobal, 420px panel).
- **Files touched:**
  - `tmp/ui-browser-loop/inline-create-case-prototype.html`
  - `tmp/ui-browser-loop/proto-1-letter-form.png`, `proto-2-panel-open.png`, `proto-3-empty-state.png`
- **Impact type:** UI (prototype only — no `src/` changes)
- **Notes:** Next is N1 — `InlineCreateDrawer` skeleton. Execution handled by envi-dev-session-executor.

## 2026-06-02 — N1 InlineCreateDrawer skeleton (CLOSED)
- **Checkpoint:** N1
- **Summary:**
  - Created generic `InlineCreateDrawer<T>` Offcanvas wrapper (`placement="end"`, `backdrop={false}`, 420px) with own `FormProvider` + Save/Cancel.
  - Mirrors `GeneralModal` add path: file-vs-JSON detection, `_contextData` injection, `repository.addNewItem` → `onCreated(newItem)` → `onHide()`. Reused `FormProvider`, `ModalBodyProps`, `parseFieldValuestoFormData`, `ErrorBoundary`, `ToolsFetch` (no duplication).
  - Verified: `tsc --noEmit` clean; `yarn build` compiled successfully.
- **Files touched:**
  - `src/View/Modals/InlineCreateDrawer.tsx` (new)
- **Impact type:** Code (new generic component; not yet mounted at any call site)
- **Notes:** Over-modal screenshot deferred to N4 (drawer has no host until LetterModalBody wiring). Next is N2 — `MilestoneSelector`.

## 2026-06-02 — N2 MilestoneSelector (CLOSED)
- **Checkpoint:** N2
- **Summary:**
  - Added `MilestoneSelector` to `BussinesObjectSelectors.tsx` (after `CaseSelectMenuElement`): single-select Typeahead, default field `_parent`, own local `RepositoryReact<MilestoneData>` via `useMemo` (`milestoneSelector_temp`, route `milestones`) — repository NOT passed via props.
  - Loads by contract: `loadItemsFromServerPOST([{ contractId, milestoneParentType: "CONTRACT" }])`; options synced FROM `localRepository.items`; clears when no `_contract`. labelKey `_FolderNumber_TypeName_Name`.
  - Left `onRequestCreate?: () => void` as a TODO(graf) hook (future inline Milestone create).
  - Confirmed backend `POST /milestones` (PS-nodeJS): reads `orConditions` + top-level `parentType` (defaults CONTRACT); `milestoneParentType` inside orCondition is ignored — loading by `contractId` is correct.
  - Verified: `yarn build` compiled successfully (`Done in 65.53s`).
- **Files touched:**
  - `src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx` (added `MilestoneSelector` + props interface)
- **Impact type:** Code (new selector; not yet mounted at any call site)
- **Notes:** Live milestone-options screenshot deferred to N3/N4 (selector has no host form until drawer body composition). Next is N3 — extend `CaseSelectMenuElement` (`+ Nowa sprawa`) + compose drawer body with `MilestoneSelector` + `CaseModalBody`.

## 2026-06-02 — N3 CaseSelectMenuElement `+ Nowa sprawa` + drawer body (CLOSED)
- **Checkpoint:** N3
- **Summary:**
  - Extended `CaseSelectMenuElement` (`BussinesObjectSelectors.tsx`) with optional `onRequestCreate?: () => void`. When set, the Typeahead is wrapped in a flex row with an `outline-success` `+ Nowa sprawa` button (`disabled={readonly}`); when omitted, returns the bare `<Controller/>` selector (identical to prior behavior). Added `Button` to `react-bootstrap` import.
  - Created `src/TasksGlobal/Modals/Case/CaseInlineCreateBody.tsx` — composed `ModalBodyProps<Case>` body = `MilestoneSelector` (writes `_parent`) + the **unmodified** `CaseModalBody`, mounted only once a milestone is watched in the form and passed as `contextData` (so `CaseModalBody` injects it as `_parent` and `CaseTypeSelector` gets `_parent._type` safely). Shows a hint Alert before a milestone is picked. `_contract` flows via `additionalProps._contract`.
  - Reuse-only composition: no edits to `CaseModalBody`, `MilestoneSelector`, or `InlineCreateDrawer`.
  - Verified `CaseModalBody` contract: reads `initialData?._parent || contextData`; deferring its mount until milestone selected satisfies "drawer injects Milestone as `_parent`".
  - Call-site audit: 7 `CaseSelectMenuElement` usages, none pass `onRequestCreate` → behavior unchanged everywhere.
  - Verified: `npx tsc --noEmit` clean; `yarn build` compiled successfully (`Done in 75.63s`).
- **Files touched:**
  - `src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx` (extended `CaseSelectMenuElement` + `Button` import)
  - `src/TasksGlobal/Modals/Case/CaseInlineCreateBody.tsx` (new — composed drawer body)
- **Impact type:** Code (non-breaking selector extension + new composed body; not yet mounted at any call site)
- **Notes:** Live over-modal screenshot deferred to N4 (drawer/body unmounted until `LetterModalBody` wiring). N4 must use the SAME `casesRepository` instance as the selector and gate Save on milestone presence (schema validates only `name`/`description`). Next is N4 — wire `InlineCreateDrawer` into `LetterModalBody` + `onCreated` auto-select.

## 2026-06-02 — N4 Wire into LetterModalBody + auto-select + uniqueness-icon unification (CLOSED)
- **Checkpoint:** N4
- **Summary:**
  - Mounted `InlineCreateDrawer<Case>` in `LetterModalBody`: `+ Nowa sprawa` → `setShowCreateCase(true)` → side panel → Save. Drawer uses the SAME `casesRepository` instance as the selector (resolves N3 shared-instance risk), `ModalBodyComponent={CaseInlineCreateBody}`, `additionalModalBodyProps={{ _contract }}`, `makeValidationSchema={makeInlineCaseValidationSchema}`.
  - `handleCaseCreated`: re-reads the new case from `casesRepository.items` (source of truth), `setValue("_cases", [...current, created], { shouldValidate: true })` (dedup-guarded), bumps `caseOptionsRefreshToken`. No direct state mutation.
  - `CaseSelectMenuElement`: added optional `refreshToken?: number` to the fetch `useEffect` deps so a token bump rebuilds options from `repository.items`. Omitted ⇒ unchanged (7 call-sites untouched).
  - Validation question from prior handoff CLOSED: drawer's `mode: "onChange"` + `yupResolver` re-validates the whole schema on `_type` change → conditional `name` requirement fires immediately (multiple ⇒ name visible+required; unique ⇒ hidden, `name=null`).
  - Uniqueness-icon unification (emoji 🔐/♾ → FontAwesome): shared `UniquenessIcon({ isUnique, title? })` (`faLock` grey / `faLayerGroup` blue, `size="sm"`, tooltip) + `CaseMultiplicityIcon` delegating to it. Used in `CaseTypeSelector`, "Dotyczy spraw" list, and `TasksGlobal` tree (`makeMilestoneTitleLabel`/`makeCaseTitleLabel` now return JSX). Removed `getSymbolByUniqueness`; deleted `src/View/Symbols.ts` (zero references).
  - Verified: end-to-end browser flow (dev :9000, mock-login) confirmed; `npx tsc --noEmit` clean; `yarn build` compiled successfully (`Done in 74.58s`).
- **Files touched:**
  - `src/Letters/LettersList/Modals/LetterModalBody.tsx` (drawer host + `onRequestCreate` + `refreshToken` + `handleCaseCreated`)
  - `src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx` (`UniquenessIcon`, `CaseMultiplicityIcon`, `refreshToken` prop, icon usages)
  - `src/TasksGlobal/TasksGlobal.tsx` (`makeMilestoneTitleLabel`/`makeCaseTitleLabel` → JSX with `UniquenessIcon`)
  - `src/View/Symbols.ts` (deleted)
  - `src/TasksGlobal/Modals/Case/CaseInlineCreateBody.tsx` (`makeInlineCaseValidationSchema` consumed by host)
- **Impact type:** Code (feature wired live + cross-domain icon unification)
- **Notes:** Offcanvas-over-modal z-index/focus risk (N0→N3) validated visually (`backdrop={false}`). Screenshots: `n4-03-before-letter-form-with-button.png`, `n4-04-drawer-open-save-disabled.png`. Next is N5 — future-hook notes (`MilestoneSelector.onRequestCreate`, generic `InlineCreateDrawer` reuse) + optional icon screenshots.

## 2026-06-02 — N5 Docs + future-hook notes (CLOSED)
- **Checkpoint:** N5
- **Summary:**
  - Added "Wzorzec: Pick-or-Create (inline tworzenie w panelu bocznym)" section to `instructions/business-object-selectors.md` — documents `InlineCreateDrawer<T>` Offcanvas pattern, the 4 pattern elements (drawer / `CaseSelectMenuElement.onRequestCreate` / `CaseInlineCreateBody` composition / `LetterModalBody` host), RepositoryReact wiring rules (shared repo instance, `onCreated` from `repository.items`, `refreshToken`, onChange validation), and the `TODO(graf)` future hooks.
  - Indexed the new section in `instructions/README.md` Quick Links.
  - Confirmed `TODO(graf)` markers already present (no code change): `InlineCreateDrawer.tsx:21` (drawer nesting), `BussinesObjectSelectors.tsx:1510` (`MilestoneSelector.onRequestCreate`).
- **Files touched:**
  - `instructions/business-object-selectors.md` (new pick-or-create section)
  - `instructions/README.md` (Quick Links index entry)
- **Impact type:** Docs (no `src/` production changes)
- **Notes:** PR1 plan (N0–N5) fully executed. Optional follow-ups (recursive Milestone inline-create, generic drawer reuse for other selectors) remain as `TODO(graf)` hooks for a future PR2.
