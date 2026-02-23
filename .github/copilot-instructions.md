<!-- canonical: instructions/AI_GUIDELINES.md -->
<!-- sync: przy edycji ZAWSZE edytuj canonical (instructions/AI_GUIDELINES.md), potem skopiuj tutaj -->

# ENVI.ProjectSite AI Developer Instructions

You are an expert developer working on the "ENVI.ProjectSite" codebase, a React 18 + TypeScript application for business process management (projects, contracts, entities, financial aid programmes).

## 🏗️ Project Architecture & Core Concepts

### 1. State Management: The "Repository" Pattern ⚠️ CRITICAL

The application uses a custom `RepositoryReact` class for data management. This is the **most important** architectural pattern to understand.

#### Single Source of Truth

- All data lives in `repository.items` (fetched from backend, cached in sessionStorage)
- Components sync their local state FROM this source: `setObjects([...repository.items])`
- State flow is **unidirectional**: `repository.items` → component state

#### CRUD Synchronization Flow

```
User Action (Modal)
  → repository.addNewItem/editItem/deleteItem (updates backend + local items + sessionStorage)
  → Callback fires (onAddNew/onEdit/onDelete)
  → Component updates: setObjects([...repository.items])
  → updateSnapshot() persists to sessionStorage
```

#### Global vs. Local Repositories

- **Global**: Initialized in [MainControllerReact.ts](src/React/MainControllerReact.ts), accessed via `MainSetup` static properties
    - Examples: `MainSetup.personsEnviRepository`, `MainSetup.contractTypesRepository`
- **Local**: Created in `useMemo` for helper components (Selectors, Autocomplete) with unique name suffix
    ```typescript
    const localRepo = useMemo(() => new RepositoryReact({
      name: "contractSelector_temp",  // _temp suffix prevents sessionStorage collision
      actionRoutes: { getRoute: "contracts", ... }
    }), []);
    ```

#### Why Local Repositories Matter

Using global repositories in selectors causes **state pollution**: components overwrite each other's data in sessionStorage. See [selectors-architecture.md](instructions/selectors-architecture.md) section 2.

### 2. File Structure & Build Pipeline

- **Source**: `src/` (all TypeScript/React code)
- **Output**: `docs/` (compiled bundle served by Apache)
- **Entry Point**: [src/React/MainWindow/index.tsx](src/React/MainWindow/index.tsx)
- **Build**: `yarn build` runs `tsc` → `webpack` → copies static files (`copyfiles`)
- **Domain Structure**: Code organized by business domain (`Contracts/`, `Persons/`, `Projects/`, `TasksGlobal/`, etc.)

### 3. Key Components & Their Roles

#### FilterableTable ([FilterableTable.tsx](src/View/Resultsets/FilterableTable/FilterableTable.tsx))

Standard component for data lists. Features:

- Renders `repository.items` with filtering/sorting
- Manages active row (`activeRowId` → updates `repository.currentItems[0]`)
- Integrates CRUD callbacks: `handleAddObject`, `handleEditObject`, `handleDeleteObject`
- Persists state via snapshots (`snapshotMode`: `"criteria+objects"` or `"criteria-only"`)

Data flow: See [filterable-table-data-flow.md](instructions/filterable-table-data-flow.md)

#### Business Object Selectors ([BussinesObjectSelectors.tsx](src/View/Modals/CommonFormComponents/BussinesObjectSelectors.tsx))

Reusable dropdowns for entities (Projects, Contracts, Persons). Built with:

- **MyAsyncTypeahead** ([GenericComponents.tsx](src/View/Modals/CommonFormComponents/GenericComponents.tsx)): Core selector logic
- **ensureLabelKey** validation: Ensures backend provides required fields (e.g., `_ourIdOrNumber_Name`)
- **Local repositories**: Each selector creates isolated `RepositoryReact` instance

See [business-object-selectors.md](instructions/business-object-selectors.md) for usage patterns.

#### MainSetup ([MainSetupReact.ts](src/React/MainSetupReact.ts))

Static service registry holding:

- `currentUser` (from session)
- `serverUrl` (auto-detects localhost vs production)
- Global repository instances (`personsEnviRepository`, `contractTypesRepository`, etc.)
- Business status enums (`ProjectStatuses`, `TaskStatus`, `OfferStatus`, etc.)

#### MainControllerReact ([MainControllerReact.ts](src/React/MainControllerReact.ts))

Application bootstrap:

- Checks session via `isSessionSet()`
- Initializes global repositories in `setRepostories()`
- Loads data with filters (e.g., `systemRoleName: "ENVI_EMPLOYEE|ENVI_MANAGER"`)

## 🛠️ Developer Workflow

### Environment Setup

1. **Clone & Install**: `yarn install`
2. **Configure `.env`** (in project root):
    ```bash
    MODE=development
    ENABLE_DEV_LOGIN=true  # Mock authentication for local testing
    ```
    **⚠️ NEVER commit `.env` files** - see [DEVELOPMENT.md](instructions/DEVELOPMENT.md) security guidelines

### Build & Run

- **Dev Server**: `yarn start` (Webpack Dev Server on port 9000 with HMR)
- **Production Build**: `yarn build` (TypeScript compilation + bundling + asset copying to `docs/`)
- **Clean**: `yarn clean` (removes `docs/` directory)

### Routing & API

- **Routing**: React Router with `HashRouter` (URLs like `#/persons`, `#/contracts`)
- **API Base URL**: `MainSetup.serverUrl` (auto-detects `localhost:3000` vs production Heroku)
- **Dev Login**: Set `ENABLE_DEV_LOGIN=true` in `.env` for mock authentication (see [DEVELOPMENT.md](instructions/DEVELOPMENT.md#-dev-login--mock-authentication))

## 📋 Coding Conventions & Patterns

### Data Flow Rules ⚠️ CRITICAL

#### ❌ NEVER Do This

```typescript
objects.push(newItem);           // Direct mutation
setObjects([...objects, newItem]); // Creates desync with repository
setObjects(objects.map(...));      // Bypasses repository as source of truth
```

#### ✅ ALWAYS Do This

```typescript
// After repository.addNewItem/editItem/deleteItem:
setObjects([...repository.items]); // Re-sync from single source of truth
updateSnapshot(); // Persist to sessionStorage
```

**Why**: Components must stay synchronized with `repository.items`. Manual mutations create stale data and bugs.

### Backend-First Principle

- Frontend **validates** data from API and **logs warnings** when fields are missing
- When you see console warnings like `⚠️ Brak wymaganego pola "_ourIdOrNumber_Name"`:
    - **Fix the backend** (Node.js/Express controllers) by adding computed fields
    - **DON'T add workarounds** in frontend code
- See [backend-computed-fields.md](instructions/backend-computed-fields.md) for examples

### Types & Type Safety

- **Business Types**: Defined in [Typings/bussinesTypes.d.ts](Typings/bussinesTypes.d.ts)
    - Examples: `PersonData`, `ContractType`, `ProjectData`, `RepositoryDataItem`
- **Strict TypeScript**: `tsconfig.json` has `"strict": true` - avoid `any` types
- **Type Guards**: Available in `Typings/typeGuards.ts` for runtime checks

### SessionStorage & Snapshots

- Repositories persist data to sessionStorage via `saveToSessionStorage()`
- FilterableTable creates snapshots: `filtersableTableSnapshot_${id}`
- Snapshot modes:
    - `"criteria+objects"`: Stores filter criteria AND data
    - `"criteria-only"`: Stores only filter criteria (data reloaded on mount)

### Copilot Prompt Trigger: New CRUD Module

- Use `.github/prompts/new-crud-module.prompt.md` when context indicates creating a new CRUD module, even if user does not explicitly say "CRUD".
- Treat as context signals: new entity + list + add/edit modals, request for new `FilterableTable` page, or plan checkpoint requiring a new module from scratch.
- Do not use this prompt for small edits/refactors in existing modules.
- If CRUD guide rules do not fit the task or would create unnecessary complexity, ask the user to choose between:
    - full CRUD module from guide,
    - minimal change in existing code.
- This clarification is allowed and required both during planning and during implementation.

## 📚 Extended Documentation

### Architecture Deep Dives

- **Selectors Architecture**: [selectors-architecture.md](instructions/selectors-architecture.md) - 3-layer architecture, validation layer, creating new selectors
- **FilterableTable Data Flow**: [filterable-table-data-flow.md](instructions/filterable-table-data-flow.md) - Component hierarchy, state management, CRUD operations
- **TasksGlobal View**: [instructions/TasksGlobalView.md](instructions/TasksGlobalView.md) - Cross-domain task management architecture

### Developer Guides

- **Development Setup**: [DEVELOPMENT.md](instructions/DEVELOPMENT.md) - .env config, scripts, dev login, Puppeteer testing
- **AI Guidelines**: [AI_GUIDELINES.md](instructions/AI_GUIDELINES.md) - General AI developer workflows, UI Browser Loop mode
- **Business Object Selectors Usage**: [business-object-selectors.md](instructions/business-object-selectors.md) - Quick start, examples, debugging

### Navigation

All documentation indexed in [instructions/README.md](instructions/README.md) with Quick Links for common scenarios.
