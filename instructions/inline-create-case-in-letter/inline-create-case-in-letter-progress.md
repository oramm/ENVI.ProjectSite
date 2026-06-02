# Inline Create Case in Letter — Progress

## Status Snapshot
- **Active phase:** N1 — InlineCreateDrawer skeleton (generic)
- **Last completed checkpoint:** N0 (UI prototype APPROVED by product owner 2026-06-02)
- **Next checkpoint:** N1

## Checkpoint Index
| ID | Title | Status |
| --- | --- | --- |
| N0 | UI design prototype + approval gate | CLOSED |
| N1 | InlineCreateDrawer skeleton (generic) | OPEN |
| N2 | MilestoneSelector | OPEN |
| N3 | Extend CaseSelectMenuElement + CaseModalBody reuse | OPEN |
| N4 | Wire into LetterModalBody + onCreated auto-select | OPEN |
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
