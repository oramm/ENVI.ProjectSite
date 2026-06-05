# TasksGlobal OtherContract Header — Variant B2-a Redesign — Implementation Plan

## Context

In the `TasksGlobal` view (`#/tasksGlobal`), the right-panel tree renders each
works contract (`OtherContract`) as an Accordion section header. Today the header
leads with the long contract **name** as the hero, which users cannot use as a
memory anchor (names are long and similar). Users locate contracts by
**alias · contractor · number**, so the typography must be inverted.

**Goal:** rebuild `makeOtherContractTitleHeader` to **Variant B2-a** (approved on
mockups): anchor = hero, status inline after the anchor, long name demoted to a
secondary line.

`makeOurContractTitleHeader` (our IK contract) is **out of scope** and must stay
unchanged — our contracts have no contractor, by design.

## Decisions locked (approved visually on mockups)

Reference mockups: `tmp/ui-browser-loop/header-B2-status.png` (B2-a active +
resting), `tmp/ui-browser-loop/header-variants-B.png`.

Header layout for `OtherContract` (top → bottom):

- **L1 — HERO** (`~1.3rem`, bold, primary color): `alias · wykonawca`
  (e.g. `Energetyka · ESIX Sp. z o.o`), followed **inline** by the
  `ContractStatusBadge`.
- **L2 — identifier** (`--section-text-xs`, uppercase, secondary):
  `${_type.name} ${number} ➔ ${ourRelatedId}` — **without alias** (alias now
  lives in the hero; do not duplicate).
- **L3 — demoted name** (`--section-text-base` = 1rem, color `#495057`, no bold):
  full contract name, second-plane.
- **L4 — unchanged**: dates (`ToolsDate.dateYMDtoDMY`) + coordinator/manager.

### Critical constraint — status placement

The status badge MUST stay in the **left block, inline after the hero**.
It MUST NOT be right-aligned (no `justify-content-between` at the header root),
because on the **ACTIVE** state the row's action menu (collapse · Drive · edit ·
"Dodaj kamień milowy") appears on the right and would visually collide / blend.

### Other locked decisions

- **No "city"** — not present in the `contractsWithChildren` payload
  (`_ourContract` has no `_city`). Rejected by product owner. Do not add.
- **Replaces, not adds**: Variant B2-a **supersedes** the current line-3
  `Wykonawca:` block (added earlier this session). Rebuild the function; do not
  stack the new layout next to the old contractor line.
- **Fallback when anchor is empty**: some works contracts have empty `alias` and
  empty `_contractors` (e.g. ids 1730/1731 in project Europark).
  - `heroParts = [alias, ...contractorNames].filter(Boolean)`
  - if `heroParts.length > 0` → `hero = heroParts.join(" · ")` AND render the L3
    demoted name.
  - else → `hero = truncateText(name, 200)` AND **omit** the L3 demoted name
    (it would duplicate the hero).

## Working-tree state to be aware of (NOT committed)

This session already modified the working tree (uncommitted):
1. `.task-leaf-row` task-row subordination in `TasksGlobal.tsx` +
   `TasksGlobal.css` — **KEEP**, unrelated to this change.
2. Line-3 `Wykonawca:` label block in `makeOtherContractTitleHeader` +
   `.contract-contractors-label` / bold `.contract-contractors` in CSS —
   **WILL BE REPLACED** by B2-a. Remove the now-dead CSS.

The executor must `git status` / `git diff` first to see this state before editing.

## Mandatory Project Context (future execution must read)

- `CLAUDE.md` (repo root) — Bootstrap (NOT Tailwind), RepositoryReact rules,
  Definition of Done (`yarn build` / tsc passes, verify in browser).
- `instructions/TasksGlobalView.md` — view structure, Grid-vs-Flex rule
  (Grid = columns, Flex = internal layout; do not mix `<Row>` with `d-flex`).
- `instructions/AI_GUIDELINES.md`.

## Key Files

| Purpose | Path |
| --- | --- |
| Header builder (edit) | `src/TasksGlobal/TasksGlobal.tsx` → `makeOtherContractTitleHeader` (~L248) |
| View styles (edit) | `src/TasksGlobal/TasksGlobal.css` |
| Status badge component | `src/View/Resultsets/CommonComponents.tsx` → `ContractStatusBadge` |
| Out of scope (do NOT touch) | `makeOtherContractTitleHeader`'s sibling `makeOurContractTitleHeader` (~L204) |
| Design tokens | `src/View/Resultsets/FilterableTable/FilterableTable.css` (`--section-text-base` etc.) |

## Interface Contract — `makeOtherContractTitleHeader(contract: OtherContract): JSX.Element`

Target structure (pseudocode):

```tsx
const identifier = `${contract._type.name} ${contract.number} ➔ ${ourRelatedId}`; // NO alias
const contractName = truncateText(contract.name, 200);
const contractorNames = (contract._contractors ?? []).map(c => c.name);
const heroParts = [contract.alias, ...contractorNames].filter(Boolean);
const hasAnchor = heroParts.length > 0;
const heroText = hasAnchor ? heroParts.join(" · ") : contractName;

return (
  <div className="d-flex flex-column gap-2">
    {/* L1 HERO + status inline (left block, NOT right-aligned) */}
    <div className="d-flex align-items-center flex-wrap gap-2">
      <span className="contract-hero">{heroText}</span>
      <ContractStatusBadge status={contract.status} className="contract-status-badge" />
    </div>
    {/* L2 identifier */}
    <span className="contract-id">{identifier}</span>
    {/* L3 demoted name — only when hero is the anchor (avoid duplicate) */}
    {hasAnchor && <div className="contract-name-demoted">{contractName}</div>}
    {/* L4 dates + manager — unchanged from current implementation */}
    {/* ...existing date/manager JSX... */}
  </div>
);
```

### CSS contract (`TasksGlobal.css`)

Add:
```css
.contract-hero {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--section-text-primary);
    line-height: 1.2;
}
.contract-name-demoted {
    font-size: var(--section-text-base); /* 1rem */
    color: #495057;
}
```
Remove (dead after B2-a): `.contract-contractors-label`, and the
`.contract-contractors` override added this session (delete the rule if no other
caller remains — verify with a repo grep).

## Checkpoints

### N1 — Implement B2-a (code + CSS) + typecheck  `OPEN`

**Goal:** `makeOtherContractTitleHeader` renders the 4-line B2-a layout; dead
contractor-line CSS removed; `makeOurContractTitleHeader` untouched.

**Tasks:**
1. `git status` + `git diff src/TasksGlobal/` to confirm working-tree state above.
2. Rebuild `makeOtherContractTitleHeader` per the interface contract (remove the
   line-3 `Wykonawca:` block; keep L4 dates/manager as-is).
3. Ensure status badge is inline in the left block; remove any
   `justify-content-between` at the header root.
4. Update `TasksGlobal.css`: add `.contract-hero`, `.contract-name-demoted`;
   remove `.contract-contractors-label` (+ `.contract-contractors` if unused — grep first).
5. Do NOT touch data/`buildTree`/`RepositoryReact`/`makeOurContractTitleHeader`.

**Acceptance criteria:**
- Alias appears only in hero, never duplicated on the identifier line.
- Contractor appears inline in hero (no separate contractor line).
- Status badge inline after hero, left block; header root has no
  `justify-content-between`.
- Empty-anchor fallback implemented (hero = name, L3 omitted).
- `makeOurContractTitleHeader` diff is empty.
- `npx tsc --noEmit` exits 0.

**Evidence:** `git diff` of the two files; `tsc --noEmit` output (exit 0).

### N2 — Visual verification + regression  `OPEN`

**Goal:** confirm B2-a on real data and no regression elsewhere.

**Tasks (ui-browser-loop):**
1. Start backend `PS-nodeJS` (`yarn start`, port 3000) and frontend
   (`yarn start`, port 9000). Mock-login.
2. Open `#/tasksGlobal`, search `Europark`, select `ZBS.ROZNE.01.PLAD Europark`.
3. Capture the `OtherContract` "Energetyka / ESIX" header in **resting** and
   **active** states (active = row selected, action menu visible on the right).
4. Capture a contract with empty alias+contractor (e.g. number
   `ZPW.15/IGP/2024- Z.1.1. KS`) to verify the fallback.
5. Regression: confirm `ZBS.IK.01` (OurContract) header is unchanged and task
   rows are still subordinate (`.task-leaf-row` intact).

**Acceptance criteria:**
- Hero (`alias · wykonawca`) is the dominant element; long name reads as
  secondary.
- Status badge does NOT collide with the right-side action menu on ACTIVE.
- Fallback contract shows name as hero without a duplicated/empty line.
- OurContract header visually identical to before.

**Evidence:** before/after screenshots in `tmp/ui-browser-loop/`
(`b2a-other-active.png`, `b2a-other-resting.png`, `b2a-fallback.png`,
`b2a-ourcontract-regression.png`). Optional: commit on a branch off `master`
with message `feat(tasksglobal): OtherContract header B2-a (anchor-first typography)`.

## Out of Scope (explicit)

- `makeOurContractTitleHeader` / our IK contract header.
- Adding "city" or any new backend field.
- Date-format unification, column headers, empty-case dimming, emoji→FA (separate
  backlog items from the earlier UI audit).
- Committing the unrelated `.task-leaf-row` change (leave as-is unless asked).

## Handoff

Execution of the first OPEN checkpoint (N1) is handled by
`envi-dev-session-executor`.
