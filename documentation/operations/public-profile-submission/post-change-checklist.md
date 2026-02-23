# Experience Update - Post-change Checklist

Data: 2026-02-20
Sesja: IMPLEMENTATION-1

## Doc-first Gate

- [x] Plan/progress/activity (client) zaktualizowane
- [x] Flow i API contract zaktualizowane
- [x] Synchronizacja zakresu i daty z dokumentacja server

## Impact DB/env/deploy

- [x] Zmiany DB wymagane (F1)
- [x] Zmiany `.env` wymagane (`PUBLIC_PROFILE_SUBMISSION_BASE_URL` sample path)
- [x] Zmiany deployment/config wymagane (hard-cut release)

## Validation

- [x] `yarn tsc --noEmit`
- [x] `yarn build`

## Notes

- [x] Start implementacji byl zablokowany do czasu doc-sync.
- [x] Hard cut endpointow i brak aliasow wdrozone.
- [x] Model `1 profil = 1 aktywny link` wdrozony.