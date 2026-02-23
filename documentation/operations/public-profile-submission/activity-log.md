# Experience Update - Activity Log

## 2026-02-20 14:10 - Doc-first Gate kickoff

- Scope:
    - synchronizacja dokumentacji klienta z nowym planem wdrozenia,
    - hard-cut nazewnictwa API na `experience-updates`/`experience-update`,
    - opis modelu `1 profil = 1 aktywny link` i workflow `uzupelnij braki`.
- Files:
    - `instructions/public-profile-submission/public-profile-submission-plan.md`
    - `instructions/public-profile-submission/public-profile-submission-progress.md`
    - `instructions/public-profile-submission/public-profile-submission-activity-log.md`
    - `instructions/public-profile-submission/Flow.md`
    - `instructions/public-profile-submission/api-contract.md`
    - `instructions/public-profile-submission/public-profile-submission-post-change-checklist.md`

## 2026-02-20 16:20 - Frontend hard cut implementation

- Scope:
    - przepiecie endpointow i tras na `experience-update(s)`,
    - uproszczenie panelu operacyjnego do pojedynczego aktywnego procesu,
    - obsluga `copyLink` + `lastDispatch`,
    - wysylanie komentarza dla `REJECT`.
- Files:
    - `src/Persons/PersonProfile/PublicProfileSubmission/publicProfileSubmissionApi.ts`
    - `src/Persons/PersonProfile/PublicProfileSubmission/personPublicProfileSubmissionReviewApi.ts`
    - `src/Persons/PersonProfile/PersonProfilePage.tsx`
    - `src/React/MainWindow/index.tsx`
- Verification:
    - `yarn tsc --noEmit` pass,
    - `yarn build` pass.