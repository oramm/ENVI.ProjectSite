# ENVI.ProjectSite AI Developer Instructions

You are an expert developer working on the "ENVI.ProjectSite" codebase, a React 18 + TypeScript application for business process management.

## Project Architecture & Core Concepts

### 1. State Management: The "Repository" Pattern

The application uses a custom `RepositoryReact` class for data management. This is the **most critical** architectural pattern.

-   **Single Source of Truth**: All data lives in `repository.items`. Components should sync their local state from this source.
-   **Synchronization Flow**:
    1. User performs action (e.g., Add) via Modal.
    2. Modal calls `repository.addNewItem()`.
    3. `repository` updates backend, then its local `.items` array, then session storage.
    4. Callback (e.g., `onAddNew`) fires.
    5. Component updates state: `setObjects([...repository.items])`.
-   **Global vs. Local**:
    -   Global repositories (e.g., for main lists) are initialized in `MainControllerReact.ts` and accessed via `MainSetup`.
    -   Helper components (Selectors, Autocomplete) **MUST** use isolated, local repositories to avoid polluting global state.

### 2. File Structure

-   **Source**: `src/` contains all app logic.
-   **Output**: `docs/` is the build target (served by Apache).
-   **Domains**: Code is organized by business domain:
    -   `src/Contracts/`, `src/Persons/`, `src/Admin/`
    -   `src/TasksGlobal/`: Cross-domain task management.

### 3. Key Components

-   **FilterableTable**: The standard component for displaying data lists. Handles filtering, sorting, and CRUD callback integration.
-   **MainSetup**: Static class acting as a service registry (holds `currentUser`, `serverUrl`, and global instances like `personsEnviRepository`).
-   **MainControllerReact**: Bootstraps the application, handles auth checks and repository initialization.

## Developer Workflow

### Build & Run

-   **Install**: `yarn install`
-   **Dev Server**: `yarn start` (runs Webpack Dev Server on port 9000 with HMR).
-   **Production Build**: `yarn build` (Runs `tsc`, `webpack`, and copies assets to `docs/`).
-   **Clean**: `yarn clean` (Rimrafs `docs/`).

### Routing & Environment

-   **Routing**: Uses `HashRouter` (React Router).
-   **API URL**: Dynamic based on environment. `MainSetup.serverUrl` detects `localhost` vs production.

## Coding Conventions

### Data Flow Rules

-   **❌ NEVER** manually modify specific items in local state (e.g., `objects.push(newItem)`).
-   **✅ ALWAYS** re-sync completely from the repository (e.g., `setObjects([...repository.items])`) after any CRUD operation.
-   **snapshots**: Call `updateSnapshot()` after syncing state to persist filters and data to sessionStorage.
-   **Immutability**: Always create new array references when updating state to ensure React re-renders.

### Business Object Selectors

If implementing a dropdown/selector for a business entity (e.g., ContractSelector):

-   **Isolation**: Instantiate a _new, local_ `RepositoryReact` inside `useMemo` with a unique name suffix (e.g., `_temp`).
-   **Reason**: Using global repositories for selectors causes state conflicts with main table views.

### Other documentation

-   **Computed Fields**: `instructions/backend-computed-fields.md` - how to handle missing fields from the backend.
-   **Selectors Architecture**: `instructions/selectors-architecture.md` - architecture and rules for selectors.
-   **Business Object Selectors**: `instructions/business-object-selectors.md` - usage guide for selectors.
-   **Filterable Table**: `instructions/filterable-table-data-flow.md` - data flow in the main list component.
-   **Tasks Global**: `instructions/TasksGlobalView.md` - architecture of the tasks view.

### Types

-   **Business Types**: Defined in `src/Typings/bussinesTypes.d.ts` (e.g., `PersonData`, `ContractType`).
-   **Strictness**: `tsconfig.json` is set up; ensure strict typing and avoid `any` where possible.
