# Public Profile Submission V1 - Activity Log

## 2026-02-20 - Docs sync with actual code state

- Zsynchronizowano dokumentacje (`progress`, `Flow`, `api-contract`) do aktualnego stanu implementacji FE+BE.
- Skorygowane rozjazdy:
    1. `S2` nie jest juz oznaczony jako `OPEN`; stan odzwierciedla wdrozone W3-W9 i etap rollout readiness.
    2. `Flow.md` usuwa krok "Zastosuj" i potwierdza auto-close bez osobnego apply.
    3. `W10 Poprawki` oznaczone jako out-of-scope dla V1.
    4. `POST /link` kontrakt uzupelniony o request `recipientEmail`, `sendNow` oraz response `dispatch`.
    5. Staff `search/details` uzupelnione o pola: `lastLinkRecipientEmail`, `lastLinkEventAt`, `lastLinkEventType` (+ `lastLinkEventByPersonId`).
    6. Error codes uzgodnione z backendem (w tym `LINK_RECOVERY_RATE_LIMITED`, `ITEM_NOT_FOUND`, `RECIPIENT_EMAIL_REQUIRED`).
- Bez zmian funkcjonalnych; sesja dotyczyla tylko porzadkowania i synchronizacji dokumentacji.

## 2026-02-19 - S1 DONE: Backend contract freeze

- Audyt spojnosci kod BE vs plan:
    - 12/12 endpointow zgodnych (PublicProfileSubmissionRouters.ts L36-255).
    - Auth model: link-token 32B (L52), session-token 48B (L147), OTP via generateCode().
    - Error codes: 8 w const enum, 2 hardcoded (SUBMISSION_ALREADY_CLOSED, SUBMISSION_HAS_PENDING_ITEMS).
    - Logika: ACCEPT -> importFromDto() (L516-530), auto-close (L375-378).
- Wykryto 1 rozbiezdnosc payload:
    - Plan/FE zaklada `{ draft: { experiences, educations, skills } }`.
    - BE przyjmuje flat: `{ experiences, educations, skills }`.
    - FE musi to uwzglednic w S2.
- 5 blokerow FE identyfikowanych:
    1. Token w URL path (FE uzywa flat baseUrl).
    2. Brak email verification flow w FE.
    3. Import-confirm routes nie istnieja w BE (FE musi mapowac na PUT /draft).
    4. Staff routes maja inne nazwy niz FE.
    5. Brak UI recenzji per-rekord (W9).
- Utworzono `api-contract.md` jako referencje dla S2.
- Zaktualizowano progress: S1 DONE, S2 OPEN.

## 2026-02-19 - Reset baseline

- Przeprowadzono audyt spojnosci FE/BE wzgledem planu V1.
- Uznano, ze dotychczasowy stan jest niespojny kontraktowo (frontend != backend routes).
- Przyjeto nowy plan "Server + Client" z canonical API po stronie backendu.
- Zmniejszono granulacje planu do 2 sesji wdrozeniowych: `S1` (backend freeze + testy), `S2` (frontend E2E + rollout).
- Potwierdzono decyzje zakresowe:
    - brak petli poprawek (`W10` out of scope),
    - recenzja per rekord (`ACCEPT`/`REJECT`),
    - auto-close bez osobnego kroku "Apply".
- Zresetowano dokumenty postepu do nowego baseline (start od `S1`).

## Archiwum poprzedniej proby (skrot)

- Poprzednie sesje frontendowe (F1-F7) zostaly wykonane technicznie, ale nie domknely spojnosci end-to-end z backendem.
- Zachowano hash-route i reuse importu CV jako wartosciowe elementy do ponownego wykorzystania.
- Dalsze wdrozenie bedzie prowadzone wg nowego planu i kolejnosci `S1 -> S2`.
