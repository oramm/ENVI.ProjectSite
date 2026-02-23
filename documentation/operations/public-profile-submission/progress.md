# Experience Update - Progress

Data bazowa: 2026-02-20
Owner: Backend + Frontend
Status ogolny: IN_PROGRESS

## Checkpointy

- F0-DOC-FIRST-GATE: DONE
- F1-BACKEND-HARD-CUT: DONE
- F2-FRONTEND-HARD-CUT: DONE
- F3-REVIEW-AND-RELEASE-GATE: IN_PROGRESS

## Status

### DONE

- FE trasy publiczne przepiete na `/public/experience-update/:token`.
- API adaptery FE przepiete na `/v2/public/experience-update/*` i `/v2/persons/:personId/experience-updates/*`.
- Widok operacyjny uproszczony do pojedynczego aktywnego procesu.
- Dodano obsluge `copyLink` i `lastDispatch`.
- Recenzja `REJECT` wysyla wymagany komentarz.

### IN_PROGRESS

- Finalny review loop i release gate.

## Evidence

- `yarn tsc --noEmit` pass.
- `yarn build` pass.