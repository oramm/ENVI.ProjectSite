# Public Profile Submission V1 - Progress

Data bazowa: 2026-02-20
Owner: Backend + Frontend
Status ogolny: IN_PROGRESS

## Biezacy stan checkpointow

- S1: DONE
- S2: IN_PROGRESS

## Status implementacji (stan rzeczywisty)

### DONE

- S1 backend contract freeze jest zgodny z kodem `PS-nodeJS`.
- Frontend `ENVI.ProjectSite` ma wdrozone elementy W3-W9:
    - W3 landing,
    - W4 verify email (request/confirm OTP),
    - W5 draft edit,
    - W6 import CV (reuse),
    - W7 submit,
    - W8 staff sekcja na PersonProfilePage,
    - W9 recenzja per rekord (ACCEPT/REJECT).
- Auto-close po rozstrzygnieciu wszystkich rekordow dziala (bez osobnego kroku "Apply").

### IN_PROGRESS

- S2 jako checkpoint rollout/readiness pozostaje otwarty tylko w zakresie domkniecia walidacji rollout.
- Cel odzyskiwania linku (link recovery) jest wdrozony po stronie backendu, ale po stronie UI biura nadal brakuje pelnego wykorzystania kontraktu (`recipientEmail`, `sendNow`, `dispatch`, pola `lastLink*`).

### Do domkniecia S2

- Finalny pass walidacyjny rollout (`tsc`, testy celowane, build) i odnotowanie wynikow.
- Potwierdzenie produkcyjnych ustawien env dla public link base URL.
- Domkniecie UI pod link recovery:
    - akcja ponownej wysylki linku z opcja `sendNow`,
    - mozliwosc podania/zmiany `recipientEmail`,
    - prezentacja ostatniego zdarzenia linku (`lastLinkRecipientEmail`, `lastLinkEventAt`, `lastLinkEventType`).

## Dziennik sesji

### Sesja 000 (Reset baseline)

Data: 2026-02-19
Checkpoint: RESET
Status: DONE

Evidence:

- Wymieniono plan na nowy "Public Profile Submission V1 - Session Plan (Server + Client)".
- Ustalono canonical API: backend routes sa zrodlem prawdy; frontend ma zostac dopasowany.
- Zamrozono decyzje biznesowe:
    - brak puli poprawek (`W10` poza V1),
    - auto-close po rozstrzygnieciu wszystkich rekordow,
    - brak osobnego kroku "Apply".

Next:

- Next OPEN: S1

### Sesja 001 (S1 — Backend contract freeze)

Data: 2026-02-19
Checkpoint: S1
Status: DONE

Evidence:

- Audyt 12 endpointow BE vs plan: 12/12 zgodne (PublicProfileSubmissionRouters.ts).
- Auth model potwierdzony: link-token (32B) -> email OTP -> session-token (48B) jako Bearer.
- Error codes: 8/8 w PublicProfileSubmissionErrorCodes const + 2 hardcoded w controllerze (SUBMISSION_ALREADY_CLOSED, SUBMISSION_HAS_PENDING_ITEMS).
- Logika biznesowa potwierdzona: ACCEPT -> importFromDto, REJECT -> markItemRejected, auto-close po 0 PENDING.
- Zidentyfikowano 1 korekte: PUT /draft przyjmuje flat payload `{experiences, educations, skills}` (bez wrappera `draft:{}`).
- Utworzono plik kontraktu API: `api-contract.md`.
- 5 blokerow FE<->BE zidentyfikowanych i opisanych w kontrakcie.

Next:

- Next checkpoint in progress: S2 (Frontend E2E + rollout readiness)
