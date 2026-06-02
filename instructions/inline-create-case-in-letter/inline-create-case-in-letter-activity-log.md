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
