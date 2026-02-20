# Public Profile Submission V1 - Session Plan (Server + Client)

Data startu: 2026-02-19
Status dokumentu: ACTIVE
Zakres: Backend (`PS-nodeJS`) + Frontend (`ENVI.ProjectSite`)

## Cel

Uruchomic publiczny proces dostarczania danych profilu osoby bez logowania
(link + email verify), z recenzja biura per rekord, przy zachowaniu:

- reuse istniejacego importu CV po stronie klienta,
- uproszczonej logiki decyzji:
    - `ACCEPT` -> natychmiastowy zapis do profilu osoby,
    - `REJECT` -> rekord pomijany/usuwany bez historii poprawek.

## Ustalenia domenowe (zamrozone)

1. Canonical API: zostawiamy backendowe endpointy jako zrodlo prawdy; frontend dostosowujemy.
2. Brak osobnego kroku "Apply"; zamkniecie zgloszenia nastepuje automatycznie po rozstrzygnieciu wszystkich rekordow.
3. `W10 Poprawki` jest poza zakresem V1.
4. Publiczny URL ma byc budowany po stronie backendu dynamicznie (request-origin/env fallback), bez hardcode hosta.

## Session Contract

1. Kazda sesja realizuje wylacznie pierwszy checkpoint ze statusem `OPEN` lub `IN_PROGRESS`.
2. Kolejnosc checkpointow jest obowiazkowa: `S1 -> S2`.
3. Po sesji aktualizujemy:
    - `public-profile-submission-progress.md`
    - `public-profile-submission-activity-log.md`
    - `public-profile-submission-post-change-checklist.md`

## Checkpointy (zgrubne, 2 sesje)

### `S1` [DONE] Backend contract freeze i gotowosc integracji (PS-nodeJS)

- Zamrozic canonical API (endpointy, request/response DTO, kody bledow domenowych).
- Domknac public URL generation bez hardcode hosta (request-origin/env fallback).
- Potwierdzic security: verify gate, token expiry, rate-limit, error semantics.
- Wykonac testy backend scenariuszowe:
    - link -> verify request/confirm -> draft/analyze/submit
    - review-item `ACCEPT`/`REJECT` + auto-close
- Zaktualizowac dokumentacje backendu dla FE (jedna tabela kontraktu).

### `S2` [IN_PROGRESS] Frontend end-to-end flow i rollout readiness (ENVI.ProjectSite)

- Przepiac adaptery FE do canonical backend routes.
- Public page:
    - `W3` landing,
    - `W4` email verify (request/confirm),
    - `W5` edycja,
    - `W6` reuse importu CV,
    - `W7` submit.
- PersonProfilePage:
    - `W8` lista zgloszen osoby,
    - `W9` recenzja per rekord (`ACCEPT`/`REJECT`) z odswiezaniem stanu.
- Link recovery UI (biuro):
    - obsluga create-link z opcjami `recipientEmail` i `sendNow`,
    - prezentacja statusu `dispatch` po akcji linkowej,
    - pokazanie ostatniego zdarzenia linku (`lastLinkRecipientEmail`, `lastLinkEventAt`, `lastLinkEventType`).
- Potwierdzic brak regresji:
    - HashRouter/public bootstrap,
    - istniejacy import pracownika.
- Wykonac walidacje rollout:
    - `yarn tsc --noEmit`
    - testy celowane public submission
    - `yarn build` (jesli mozliwe)

## Definicja Done per sesja

- `S1 DONE`:
    - Kontrakt backend zamrozony i opisany.
    - Testy backend flow przechodza.
    - Brak nierozstrzygnietych decyzji integracyjnych dla FE.

- `S2 DONE`:
    - FE realizuje pelny flow `W1-W9` bez `W10`.
    - Recenzja per rekord dziala end-to-end.
    - UI biura domyka proces odzyskiwania linku (resend + metadata ostatniego zdarzenia).
    - Brak regresji importu wewnetrznego i HashRouter.
    - Walidacje (`tsc`, testy, build) przechodza.

## Kryteria akceptacji biznesowej

1. Pracownik zalogowany: import działa jak dzis (natychmiastowy zapis zatwierdzony).
2. Uzytkownik publiczny: link -> email verify -> edycja/import -> submit.
3. Biuro: recenzja per rekord.
4. `ACCEPT` natychmiast zapisuje rekord do profilu osoby.
5. `REJECT` nie tworzy petli poprawek i nie przechowuje historii odrzuconych tresci.
6. Brak regresji w istniejacym module importu profilu.
