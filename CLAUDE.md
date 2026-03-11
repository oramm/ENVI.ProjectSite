# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**

- `yarn install` - Install dependencies
- `yarn start` - Start webpack dev server on port 9000 with HMR
- `yarn build` - Full production build (clean → tsc → webpack → copy-files to `docs/`)
- `yarn clean` - Remove `docs/` output directory

**Testing:**

- `yarn screenshot` - Run Puppeteer screenshot utility with default route/output in `tmp/ui-browser-loop/` (see `scripts/screenshot.js`)
    - Options: `node scripts/screenshot.js http://localhost:9000/docs/#/persons tmp/ui-browser-loop/persons-logged.png --mock-login`
- `yarn screenshot:contract` - Capture the local contract screen into `tmp/ui-browser-loop/`
- `yarn screenshot:cleanup` - Remove temporary browser-loop screenshots from `tmp/ui-browser-loop/`

**Compilation:**

- `tsc` - TypeScript compilation only (outputs to `docs/`)
- `webpack` - Bundle only (requires tsc to run first)

## Tech Stack

- **Language:** TypeScript 5.x with strict mode enabled
- **Frontend:** React 18.2, React Router 6.17 (HashRouter), React Bootstrap 2.7
- **Forms:** react-hook-form 7.x + yup 1.x validation
- **Auth:** Google OAuth (@react-oauth/google 0.9.x)
- **Build:** Webpack 5.75 + ts-loader 9.x
- **Backend API:** Node.js/Express (separate repo) at `https://erp-envi.herokuapp.com/` or `http://localhost:3000/`

## Architecture Overview

### Entry Points

- **Webpack entry:** `src/React/MainWindow/index.tsx`
- **HTML shell:** `src/index.html` (loads `bundle.js`)
- **Output:** `docs/bundle.js` (entire SPA compiled to single bundle)
- **Bootstrap:** `MainController.main()` → `setRepositories()` → loads global data repositories

### Domain Structure

Code organized by business domains (not by technical layers):

```
src/
├── React/           - Core infrastructure (MainSetup, MainController, RepositoryReact)
├── View/            - Reusable UI (FilterableTable, Modals, CommonComponents)
├── Contracts/       - Contract management (lists, dates, roles)
├── Projects/        - Project management
├── Persons/         - Person/Employee management
├── Entities/        - Business entities (companies, clients)
├── TasksGlobal/     - Cross-domain task management
├── financialAidProgrammes/ - Financial aid, focus areas, needs
├── Erp/             - ERP integration (invoices)
├── Admin/           - Admin modules (Cities, ContractRanges, SystemUsers)
├── Offers/          - Offers and offer letters
└── Letters/         - Letter management

Typings/             - Shared TypeScript types (bussinesTypes.d.ts)
```

### RepositoryReact — Core Rules

The app uses `RepositoryReact<T>` (not Redux/Context) for ALL data management.

**Single Source of Truth:** Always sync component state FROM `repository.items`:

- `setObjects([...repository.items])` after every CRUD operation
- Never mutate component state directly (`objects.push()`, `setObjects([...objects, newItem])`)
- Global repos in `MainSetup` (sessionStorage-backed); local repos (`_temp` suffix) for selectors

**CRUD flow:** User action → `repository.addNewItem(data)` → callback → `setObjects([...repository.items])` → `updateSnapshot()`

Full details: [`instructions/AI_GUIDELINES.md`](instructions/AI_GUIDELINES.md)

### Key Components

- **FilterableTable** — Standard list view with filtering, sorting, pagination, CRUD callbacks, sessionStorage snapshots
- **Business Object Selectors** — `ProjectSelector`, `ContractSelector`, `PersonSelector` with local repositories
- **MainSetup** — Static service registry (currentUser, serverUrl, global repositories, enums)
- **MainController** — Bootstrap: `isSessionSet()`, `setRepositories()`, `logout()`

### Routing

HashRouter: `#/persons`, `#/contracts/123`. No server-side routing (SPA). Params via `useParams()`.

## Development Guidelines

**State rules:** Always use repository methods for CRUD. Sync from `repository.items`. Call `updateSnapshot()`. Create local repos for selectors. Never mutate state directly, never reuse global repos in selectors.

**Backend-First:** Console warnings like `Brak wymaganego pola` → fix in backend, not frontend workarounds.

**TypeScript:** Types in `Typings/bussinesTypes.d.ts`, all extend `RepositoryDataItem` (requires `id: number`). Strict mode, avoid `any`.

Full guidelines: [`instructions/AI_GUIDELINES.md`](instructions/AI_GUIDELINES.md)

## Common Patterns

**New CRUD module:** Full guide with templates: [`instructions/crud-module-guide.md`](instructions/crud-module-guide.md). Skill: `/new-crud-module NazwaEncji`.

**Form modal:** react-hook-form + yup → `repository.addNewItem(data)` → `setObjects([...repository.items])` → `updateSnapshot()`.

**Selectors:** Local `RepositoryReact` with `_temp` suffix to avoid state pollution.

## Environment Variables

Create `.env` in project root:

```bash
MODE=development
ENABLE_DEV_LOGIN=true  # Mock auth for local dev
```

**Security:** Never commit `.env` to git (already in `.gitignore`).

## Extended Documentation

Detailed guides in `instructions/` directory:

**Architecture:**

- `selectors-architecture.md` - 3-layer selector architecture, validation, creating new selectors
- `filterable-table-data-flow.md` - Component hierarchy, state flow, CRUD operations
- `TasksGlobalView.md` - Cross-domain task management

**Development:**

- `DEVELOPMENT.md` - .env config, dev login, Puppeteer testing
- `backend-computed-fields.md` - Backend field computation patterns
- `business-object-selectors.md` - Selector usage, examples, debugging

**AI Workflow:**

- `AI_GUIDELINES.md` - General AI development workflows
- `ui-browser-loop.md` - UI testing loop mode

Use the `ui-browser-loop` skill for iterative browser-based UI verification with automated screenshots, mock login, and viewport controls.
Treat `tmp/ui-browser-loop/` as temporary workspace output and clean it after verification.

All docs indexed in `instructions/README.md`.

## Definition of Done

Before marking work complete:

1. TypeScript compiles: `yarn build` passes
2. App renders: `yarn start` → verify in browser
3. State sync correct: Component state matches `repository.items`
4. SessionStorage updated: `updateSnapshot()` called after changes
5. No console errors/warnings (except legacy code)
6. Existing features work (manual regression)
