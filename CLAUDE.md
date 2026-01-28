# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `yarn install` - Install dependencies
- `yarn start` - Start webpack dev server on port 9000 with HMR
- `yarn build` - Full production build (clean → tsc → webpack → copy-files to `docs/`)
- `yarn clean` - Remove `docs/` output directory

**Testing:**
- `yarn screenshot` - Run Puppeteer screenshot utility (see `scripts/screenshot.js`)
  - Options: `yarn screenshot http://localhost:9000/page custom-name.png --mock-login`

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

### Critical Pattern: RepositoryReact State Management

**MOST IMPORTANT:** The app uses a custom `RepositoryReact<T>` class (not Redux/Context) for ALL data management.

**Core Principle - Single Source of Truth:**
```typescript
// ✅ ALWAYS sync component state FROM repository.items
setObjects([...repository.items]);

// ❌ NEVER mutate component state directly
setObjects([...objects, newItem]);  // Creates desync with repository!
objects.push(newItem);               // Mutation breaks reactivity!
```

**Data Flow (CRUD operations):**
```
User Action (Modal form submit)
  ↓
repository.addNewItem(data)  // Updates backend + repository.items + sessionStorage
  ↓
Callback fires (onAddNew prop)
  ↓
Component: setObjects([...repository.items])  // Re-sync from source of truth
  ↓
updateSnapshot()  // Persist FilterableTable state to sessionStorage
```

**Global vs Local Repositories:**
- **Global:** Initialized in `MainControllerReact.setRepositories()`, stored in `MainSetup` static properties
  - Examples: `MainSetup.personsEnviRepository`, `MainSetup.contractTypesRepository`
  - Used by main views and shared across components
  - Backed by sessionStorage with repository name as key

- **Local:** Created in `useMemo` for isolated components (selectors, autocomplete)
  ```typescript
  const localRepo = useMemo(() => new RepositoryReact({
    name: "contractSelector_temp",  // _temp suffix prevents global collisions
    actionRoutes: { getRoute: "contracts", ... }
  }), []);
  ```
  - Prevents state pollution in dropdowns/selectors

### Key Components

**FilterableTable** (`src/View/Resultsets/FilterableTable/FilterableTable.tsx`):
- Standard list view component used throughout the app
- Manages filtering, sorting, pagination
- Handles CRUD via callbacks: `handleAddObject`, `handleEditObject`, `handleDeleteObject`
- Persists state to sessionStorage via snapshots (`filtersableTableSnapshot_${id}`)
- Active row tracking: `activeRowId` updates `repository.currentItems[0]`

**Business Object Selectors** (`src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx`):
- Reusable dropdown components: `ProjectSelector`, `ContractSelector`, `PersonSelector`
- Built on `MyAsyncTypeahead` with `ensureLabelKey` validation
- Each selector uses LOCAL repository to avoid state pollution
- Backend must provide computed label fields (e.g., `_ourIdOrNumber_Name`)

**MainSetup** (`src/React/MainSetupReact.ts`):
- Static service registry with:
  - `currentUser` (session data)
  - `serverUrl` (auto-detects localhost vs production)
  - Global repositories (`personsEnviRepository`, `contractTypesRepository`, etc.)
  - Business enums (`ProjectStatuses`, `TaskStatus`, `InvoiceStatuses`, etc.)

**MainController** (`src/React/MainControllerReact.ts`):
- Application bootstrap:
  - `isSessionSet()` - Checks auth session
  - `setRepositories()` - Initializes global data with filters
  - `logout()` - Clears session

### Routing

Uses React Router's `HashRouter`:
- URLs: `http://localhost:9000/#/persons`, `#/contracts/123`, etc.
- No server-side routing needed (SPA)
- Router params accessed via `useParams()` hook

## Development Guidelines

### State Management Rules (CRITICAL)

**DO:**
- Always sync component state from `repository.items`: `setObjects([...repository.items])`
- Use repository methods for CRUD: `repository.addNewItem()`, `repository.editItem()`, `repository.deleteItem()`
- Call `updateSnapshot()` after state changes in FilterableTable
- Create local repositories for selectors/autocomplete components

**DON'T:**
- Never mutate `objects` state directly: `objects.push()`, `objects[i] = ...`
- Never sync from component state: `repository.items = objects`
- Never update component state independently: `setObjects([...objects, newItem])`
- Never reuse global repositories in multiple selectors (causes state pollution)

### Backend-First Principle

When console shows warnings like `⚠️ Brak wymaganego pola "_ourIdOrNumber_Name"`:
- **Fix in backend** - Add computed field in Node.js controller
- **DON'T add frontend workarounds** - Frontend validates, backend provides

See `instructions/backend-computed-fields.md` for examples.

### TypeScript Conventions

- Business types in `Typings/bussinesTypes.d.ts`: `PersonData`, `Contract`, `ProjectData`, etc.
- All types extend `RepositoryDataItem` (requires `id: number`)
- Strict mode enabled - avoid `any`, use explicit types
- Generic repositories: `RepositoryReact<PersonData>`, `RepositoryReact<Contract>`, etc.

### SessionStorage Schema

- Repositories: `sessionStorage.getItem("personsEnvi")`, `sessionStorage.getItem("Contracts repository")`
- User session: `sessionStorage.getItem("Current User")`
- FilterableTable snapshots: `filtersableTableSnapshot_${tableId}` (stores criteria + optional objects)

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

All docs indexed in `instructions/README.md`.

## Common Patterns

### Adding a New Domain Module

1. Create domain folder: `src/NewDomain/`
2. Add `NewDomainList/` with FilterableTable component
3. Define types in `Typings/bussinesTypes.d.ts`
4. Create repository in MainController (if global) or locally (if scoped)
5. Add route in MainWindow router
6. Create modal components in `NewDomain/Modals/`

### Creating a Form Modal

Use react-hook-form + yup:
```typescript
const schema = yup.object({ name: yup.string().required() });
const { register, handleSubmit } = useForm({ resolver: yupResolver(schema) });

const onSubmit = async (data) => {
  await repository.addNewItem(data);
  setObjects([...repository.items]);  // ✅ Sync from repository
  updateSnapshot();
};
```

### Working with Selectors

Use business object selectors with local repositories:
```typescript
const localRepo = useMemo(() => new RepositoryReact({
  name: "myComponent_contracts_temp",
  actionRoutes: { getRoute: "contracts", ... }
}), []);

<ContractSelector
  repository={localRepo}
  onChange={(selected) => setValue("contractId", selected[0]?.id)}
/>
```

## Environment Variables

Create `.env` in project root:
```bash
MODE=development
ENABLE_DEV_LOGIN=true  # Mock auth for local dev
```

**Security:** Never commit `.env` to git (already in `.gitignore`).

## Definition of Done

Before marking work complete:
1. ✅ TypeScript compiles: `yarn build` passes
2. ✅ App renders: `yarn start` → verify in browser
3. ✅ State sync correct: Component state matches `repository.items`
4. ✅ SessionStorage updated: `updateSnapshot()` called after changes
5. ✅ No console errors/warnings (except legacy code)
6. ✅ Existing features work (manual regression)
