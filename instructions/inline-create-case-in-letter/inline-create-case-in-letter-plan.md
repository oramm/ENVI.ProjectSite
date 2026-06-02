# Inline Create Case in Letter — Implementation Plan

## Context

When registering a Letter (`Pismo`) the user must assign it to one or more Cases
(`Sprawa`, field `_cases`). Today the Case selector in the letter form
(`CaseSelectMenuElement`) can only **pick** existing cases. Case CRUD lives only
in `TasksGlobal`, so to add a missing case the user must close the letter modal,
go to TasksGlobal, create the case, and reopen the letter form. This is the pain
point we remove.

**Goal (PR1):** allow creating a Case **in place** from the letter form via a
side panel (Offcanvas), keeping the letter form visible, then auto-select the new
case in `_cases`. Build it so the create-in-place mechanism can later be
generalized into a reusable "pick-or-create" pattern across all selectors.

**Decisions locked (from product owner):**
- Scope now: fix Case-in-Letter only; write code so the drawer can be reused later.
- UI form: side panel (`react-bootstrap` `Offcanvas`, `placement="end"`), letter form stays visible.
- Depth: only Case level. Milestone parent must already exist. Recursive
  Milestone-create is a future hook (TODO), NOT implemented now. If recursion
  would heavily complicate the drawer, stay at Case level and defer to a separate refactor.
- UI must be reviewed as a Claude `frontend-design` prototype and approved BEFORE implementation.

## Data Model (verified in code)

- Hierarchy: `Contract → Milestone (MilestoneData) → Case`.
- `Case` requires `_parent` = `MilestoneData` + a case type (`CaseTypeSelector`).
- `CaseSelectMenuElement` loads cases via
  `repository.loadItemsFromServerPOST([{ contractId, milestoneParentType: "CONTRACT" }])`
  and groups them by milestone.
- `milestonesRepository` exists in `LettersController.ts` and `TasksGlobalController.ts`,
  but there is **no** `MilestoneSelector` component yet.
- No `Offcanvas` usage exists in the codebase yet (new pattern).

## Mandatory Project Context (future execution must read)

- `CLAUDE.md` (repo root) — RepositoryReact rules: sync state FROM `repository.items`,
  never mutate state directly, call `updateSnapshot()` after CRUD.
- `instructions/AI_GUIDELINES.md`
- `instructions/selectors-architecture.md`
- `instructions/business-object-selectors.md`
- `instructions/filterable-table-data-flow.md`

## Key Files

| Purpose | Path |
| --- | --- |
| Letter form body (host) | `src/Letters/LettersList/Modals/LetterModalBody.tsx` |
| Case selector | `src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx` (`CaseSelectMenuElement`, ~L1328) |
| Case form body (reused in drawer) | `src/TasksGlobal/Modals/Case/CaseModalBody.tsx` |
| Case validation | `src/TasksGlobal/Modals/Case/CaseValidationSchema.ts` |
| Letter repos (cases, milestones) | `src/Letters/LettersList/LettersController.ts` |
| Modal infra (reference for FormProvider) | `src/View/Modals/GeneralModal.tsx`, `GeneralModalButtons.tsx` |
| New: generic drawer | `src/View/Modals/InlineCreateDrawer.tsx` |
| New: milestone selector | `src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx` (`MilestoneSelector`) |

## Interface Contracts

### `InlineCreateDrawer<T extends RepositoryDataItem>` (new, generic)
```ts
interface InlineCreateDrawerProps<T extends RepositoryDataItem> {
  show: boolean;
  onHide: () => void;
  title: string;
  repository: RepositoryReact<T>;
  ModalBodyComponent: React.ComponentType<ModalBodyProps<T>>;
  makeValidationSchema?: (...args: any[]) => AnyObjectSchema;
  contextData?: unknown;            // e.g. selected Milestone passed to CaseModalBody._parent
  additionalModalBodyProps?: Record<string, unknown>;
  onCreated: (created: T) => void;  // parent appends to options + auto-selects
}
```
- Renders `Offcanvas placement="end" backdrop={false}` so the letter modal stays interactive/visible.
- Owns a `FormProvider` (mirrors `GeneralModal` form wiring) + Save/Cancel.
- On save: `repository.addNewItem(data)` → on success `onCreated(newItem)` → `onHide()`.
- TODO(graf) marker: drawers may stack (a future Milestone drawer opened from inside).

### `MilestoneSelector` (new)
```ts
interface MilestoneSelectorProps {
  name?: string;                 // default "_parent"
  repository: RepositoryReact<MilestoneData>;
  _contract: Contract;           // loads milestones for this contract
  readOnly?: boolean;
  showValidationInfo?: boolean;
  // TODO(graf): optional onRequestCreate?: () => void for future inline Milestone create
}
```
- Loads via `repository.loadItemsFromServerPOST([{ contractId, milestoneParentType: "CONTRACT" }])`
  (mirror the load already used by `CaseSelectMenuElement`; confirm exact backend contract during impl).

### `CaseSelectMenuElement` (extend, non-breaking)
- Add optional prop `onRequestCreate?: () => void`.
- When provided, render a `+ Nowa sprawa` button beside the Typeahead.
- When omitted, behavior is unchanged (no button) — all existing call sites untouched.

### `LetterModalBody` (host wiring)
- Local `const [showCreateCase, setShowCreateCase] = useState(false)`.
- Pass `onRequestCreate={() => setShowCreateCase(true)}` to `CaseSelectMenuElement`.
- Render `InlineCreateDrawer` for Case with `contextData = selected Milestone`.
- `onCreated(newCase)`: read fresh from `casesRepository.items`, append `newCase` to
  the selector options, set `_cases` = `[...current, newCase]` via `setValue(..., { shouldValidate: true })`.
- Respect repo rules: sync from `casesRepository.items`, call `updateSnapshot()` if a snapshot context applies.

## Checkpoints

### N0 — UI design prototype (Claude frontend-design), approval gate
- **Goal:** Visual, clickable-feeling prototype of the letter form + right-side Offcanvas
  create-case panel, for product-owner approval BEFORE any production code.
- **Tasks:**
  - Use the `frontend-design` skill to produce a self-contained HTML/React prototype
    showing: letter form (modal) with the Case selector + `+ Nowa sprawa` button; the
    right Offcanvas opening with Milestone selector → case type → name → Save; the new
    case appearing selected in `_cases` after save.
  - Match ENVI look (react-bootstrap, existing form styling) closely enough to judge UX.
  - Include an empty-milestone state note ("brak kamieni milowych → przejdź do TasksGlobal" placeholder).
- **Acceptance:** Product owner approves the layout/flow (or requests changes). No `src/` production files changed.
- **Evidence:** Prototype file path + screenshot(s) in `tmp/ui-browser-loop/`; explicit approval recorded in progress file.

### N1 — `InlineCreateDrawer` skeleton (generic)
- **Goal:** Reusable Offcanvas-based create wrapper with FormProvider + Save/Cancel, no Case specifics.
- **Tasks:** Create `src/View/Modals/InlineCreateDrawer.tsx` per contract above; wire
  `repository.addNewItem` + `onCreated`; ensure `backdrop={false}` keeps host modal usable.
- **Acceptance:** `yarn build` passes; drawer can be mounted with a trivial body and saves an item.
- **Evidence:** Build log; screenshot of empty drawer opened over the letter modal.

### N2 — `MilestoneSelector`
- **Goal:** Selector that lists milestones for a given contract (needed as Case `_parent`).
- **Tasks:** Add `MilestoneSelector` to `BussinesObjectSelectors.tsx`; load milestones by
  contract; Typeahead single-select; leave `onRequestCreate` TODO hook.
- **Acceptance:** `yarn build` passes; selecting a contract populates milestone options.
- **Evidence:** Build log; screenshot showing milestone options for a real contract.

### N3 — Extend `CaseSelectMenuElement` + `CaseModalBody` reuse in drawer
- **Goal:** `+ Nowa sprawa` button (only when `onRequestCreate` set); drawer renders
  `MilestoneSelector` + existing `CaseModalBody`.
- **Tasks:** Add optional `onRequestCreate` prop + button; verify `CaseModalBody` works
  with `contextData = milestone`; compose drawer body = MilestoneSelector then CaseModalBody.
- **Acceptance:** `yarn build` passes; existing call sites of `CaseSelectMenuElement` unchanged in behavior.
- **Evidence:** Build log; screenshot of drawer with milestone + case fields.

### N4 — Wire into `LetterModalBody` + onCreated auto-select
- **Goal:** End-to-end: create case in panel → it auto-selects in the letter's `_cases`.
- **Tasks:** Add `showCreateCase` state; pass `onRequestCreate`; implement `onCreated`
  (append option + `setValue("_cases", [...])`, sync from `casesRepository.items`,
  `updateSnapshot()` where applicable); handle empty-milestone state with a clear message.
- **Acceptance:** Manual flow works without leaving the letter form; `yarn build` passes;
  no console errors; state matches `casesRepository.items`.
- **Evidence:** Screenshots of full flow (before/after); build log; brief regression note that
  letter create/edit still works.

### N5 — Docs + future-hook notes
- **Goal:** Record the new pattern and the deferred Milestone recursion.
- **Tasks:** Short note in `instructions/business-object-selectors.md` (or new doc) describing
  `InlineCreateDrawer` pick-or-create pattern; add `// TODO(graf): recursive Milestone create`
  markers in `MilestoneSelector` and drawer; index in `instructions/README.md`.
- **Acceptance:** Docs build/readable; TODO markers present.
- **Evidence:** Doc diff; grep of TODO markers.

## Out of Scope (PR1)
- Generalizing the drawer to other selectors (Contract/Project/Person) — future PR2.
- Recursive inline Milestone creation — future refactor (hook left in place).
- Global graph navigation / passing history-context between windows — separate iteration.

## Risks
- Offcanvas + open Bootstrap modal z-index/focus interplay (`backdrop={false}` + focus trap). Validate early in N1.
- Backend load contract for milestones must match `milestoneParentType: "CONTRACT"`; confirm against `PS-nodeJS`.
- `casesRepository` instance identity: ensure the drawer and the selector use the SAME repository instance so options refresh.

## Handoff
Execution of the first OPEN checkpoint (N0) is handled by `envi-dev-session-executor`.
