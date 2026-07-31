# Agent Rules For This Repository

## Docs

1. `instructions/*` holds FE rules, recipes and pitfalls. Code is the source of truth for how the app works — do not write docs that restate code.
2. Temporary `plan`/`progress`/`activity-log` files live under `instructions/<initiative>/` only while the task is open; delete them when it closes (history stays in git).
3. `docs/` is the GitHub Pages build artifact, not documentation.

## API contract

1. The backend owns types, DTOs and endpoints. Read `C:\Apache24\htdocs\PS-nodeJS\src\types\types.d.ts` (or the relevant controller) before updating `Typings/bussinesTypes.d.ts`.
2. Never guess a payload shape from UI code.
3. A missing field in the API response is fixed in the backend, never worked around in React.

## Cross-repo workspace rules

1. This repository is frontend: `C:\Apache24\htdocs\ENVI.ProjectSite`.
2. Backend lives in a separate repository: `C:\Apache24\htdocs\PS-nodeJS`.
3. If requested files are missing in current `cwd`, check the sibling repository by absolute path before reporting blocker.
4. Do not conclude "files do not exist" until both repositories are checked.
5. For backend changes, switch working directory to `C:\Apache24\htdocs\PS-nodeJS` and report touched files from that repo.
6. DB, env and deployment work is backend-owned; GitHub Pages build and UI evidence stay here.
