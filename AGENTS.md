# Agent Rules For This Repository

## Cross-repo workspace rules

1. This repository is frontend: `C:\Apache24\htdocs\ENVI.ProjectSite`.
2. Backend lives in a separate repository: `C:\Apache24\htdocs\PS-nodeJS`.
3. If requested files are missing in current `cwd`, check the sibling repository by absolute path before reporting blocker.
4. Do not conclude "files do not exist" until both repositories are checked.
5. For backend changes, switch working directory to `C:\Apache24\htdocs\PS-nodeJS` and report touched files from that repo.
