# ENVI.ProjectSite — Copilot Instructions

React 18 + TypeScript SPA (HashRouter, React Bootstrap, react-hook-form + yup, Webpack).
Backend lives in a separate repo: `C:\Apache24\htdocs\PS-nodeJS`.

## Read first

- [CLAUDE.md](../CLAUDE.md) — stack, commands, architecture overview, definition of done
- [instructions/AI_GUIDELINES.md](../instructions/AI_GUIDELINES.md) — FE rules (repository sync, FilterableTable, modals, typical mistakes)
- [instructions/selectors.md](../instructions/selectors.md) — selector rules
- [instructions/crud-module-guide.md](../instructions/crud-module-guide.md) — new CRUD module recipe
- [instructions/DEVELOPMENT.md](../instructions/DEVELOPMENT.md) — `.env`, dev login, screenshots

## Non-negotiable rules

1. **Single source of truth:** all data lives in `repository.items`; components sync FROM it
   (`setObjects([...repository.items])`) and call `updateSnapshot()`. Never mutate state directly.
2. **Every selector gets its own `RepositoryReact`** with a unique `_temp` name — a shared name
   overwrites the main list's sessionStorage entry.
3. **Backend-First:** a missing field in the API is fixed in the Node.js controller, never
   worked around in React.
4. **API contract is owned by the backend:** read `C:\Apache24\htdocs\PS-nodeJS\src\types\types.d.ts`
   before touching `Typings/bussinesTypes.d.ts`.
5. Strict TypeScript, avoid `any`; type guards in `Typings/typeGuards.ts`.

## New CRUD module

Follow [instructions/crud-module-guide.md](../instructions/crud-module-guide.md) when the task means
a new entity with a list and add/edit modals — even if the user does not say "CRUD". Not for small
edits in existing modules.
If the full recipe would be overkill, ask the user: full module or minimal change.
