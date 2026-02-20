# Public Profile Submission V1 - API Contract

Status: ALIGNED WITH CODE (2026-02-20)
Source of truth: `PS-nodeJS/src/persons/publicProfileSubmission/PublicProfileSubmissionRouters.ts`

## Auth model

### 3 tokeny

1. **Link token** (32-byte hex) — w URL path `/:token/...`, waliduje link
2. **Email OTP** (6-cyfrowy kod) — wysylany na email, jednorazowy, max 5 prob
3. **Session token** (48-byte hex) — zwracany po verify-email, uzyty jako `Authorization: Bearer {sessionToken}`

### Sekwencja auth

```
GET /:token           <- link-token (w URL)
POST /request-code    <- link-token (w URL) + {email}
POST /confirm-code    <- link-token (w URL) + {email, code} -> zwraca publicSessionToken
GET  /draft           <- link-token (w URL) + Bearer session-token
PUT  /draft           <- link-token (w URL) + Bearer session-token
POST /analyze-file    <- link-token (w URL) + Bearer session-token
POST /submit          <- link-token (w URL) + Bearer session-token
```

## Endpointy publiczne (bez logowania)

Base: `/v2/public/profile-submission`

### 1. GET `/:token`

Auth: link-token w URL
Response:

```json
{
  "id": 1,
  "linkId": 1,
  "personId": 123,
  "email": "jan@example.com",
  "status": "DRAFT",
  "submittedAt": null,
  "closedAt": null,
  "createdAt": "...",
  "updatedAt": "...",
  "items": [
    {
      "id": 1,
      "itemType": "EXPERIENCE",
      "itemStatus": "PENDING",
      "payload": { "organizationName": "...", ... },
      "acceptedTargetId": null,
      "reviewedByPersonId": null,
      "reviewedAt": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### 2. POST `/:token/verify-email/request-code`

Auth: link-token w URL
Request: `{ "email": "jan@example.com" }`
Response: `{ "submissionId": 1, "email": "jan@example.com", "codeExpiresAt": "..." }`
Side effect: Wysyla email z kodem OTP.

### 3. POST `/:token/verify-email/confirm-code`

Auth: link-token w URL
Request: `{ "email": "jan@example.com", "code": "123456" }`
Response: `{ "submissionId": 1, "publicSessionToken": "abc123...", "expiresAt": "..." }`

### 4. GET `/:token/draft`

Auth: Bearer session-token
Response:

```json
{
  "status": "DRAFT",
  "experiences": [{ "id": 1, "status": "PENDING", "organizationName": "...", ... }],
  "educations": [{ "id": 2, "status": "PENDING", "schoolName": "...", ... }],
  "skills": [{ "id": 3, "status": "PENDING", "name": "...", ... }]
}
```

### 5. PUT `/:token/draft`

Auth: Bearer session-token
Request (**UWAGA: flat payload, bez wrappera `draft`**):

```json
{
  "experiences": [{ "organizationName": "ENVI", "positionName": "Inzynier", ... }],
  "educations": [{ "schoolName": "PWr", "degreeName": "Magister", ... }],
  "skills": [{ "name": "AutoCAD", "levelCode": "SENIOR", ... }]
}
```

Response: taka sama struktura jak GET /draft (odswiezona).
Logika: Usuwa PENDING items danego typu i wstawia nowe.

### 6. POST `/:token/analyze-file`

Auth: Bearer session-token
Request: `multipart/form-data` z polem `file` + opcjonalnym `hint`
Response:

```json
{
  "experiences": [{ "organizationName": "...", ... }],
  "educations": [{ "schoolName": "...", ... }],
  "skills": [{ "name": "...", ... }],
  "_extractedText": "...",
  "_model": "...",
  "_usage": { ... }
}
```

**WAZNE:** NIE zapisuje do bazy. Wyniki sa zwracane do FE, user wybiera, FE robi PUT /draft.

### 7. POST `/:token/submit`

Auth: Bearer session-token
Response: pelen rekord submission (status zmieniony na SUBMITTED).

## Endpointy staff (wymagaja zalogowanej sesji)

Base: `/v2/persons/:personId/public-profile-submissions`

### 8. POST `/link`

Tworzy nowy link (revokuje poprzedni).

Request (opcjonalny):

```json
{
    "recipientEmail": "jan@example.com",
    "sendNow": true
}
```

Response:

```json
{
    "personId": 123,
    "token": "abc...",
    "url": "https://...",
    "expiresAt": "...",
    "submissionId": 1,
    "dispatch": {
        "recipientEmail": "jan@example.com",
        "status": "LINK_SENT",
        "eventAt": "...",
        "sendNowRequested": true
    }
}
```

`dispatch.status` moze byc: `LINK_GENERATED`, `LINK_SENT`, `LINK_SEND_FAILED`.

### 9. POST `/search`

Request: `{ "status": "SUBMITTED" }` (opcjonalne)
Response: tablica submissions z polami m.in.:

- `id`, `linkId`, `personId`, `email`, `status`
- `lastLinkRecipientEmail`
- `lastLinkEventAt`
- `lastLinkEventType`
- `lastLinkEventByPersonId`
- `submittedAt`, `closedAt`, `createdAt`, `updatedAt`

### 10. GET `/:submissionId`

Response: pelny submission z items (jak GET /:token ale przez staff), zawiera takze:

- `lastLinkRecipientEmail`
- `lastLinkEventAt`
- `lastLinkEventType`
- `lastLinkEventByPersonId`

### 11. POST `/:submissionId/items/:itemId/review`

Request: `{ "decision": "ACCEPT" }` lub `{ "decision": "REJECT" }`
Response:

```json
{
    "submissionId": 1,
    "itemId": 5,
    "decision": "ACCEPT",
    "acceptedTargetId": 42,
    "autoClosed": false
}
```

Logika ACCEPT: wywoluje `importFromDto()` na odpowiednim controllerze (Experience/Education/Skill).
Auto-close: jesli po review 0 PENDING items, submission jest zamykany automatycznie.

### 12. POST `/:submissionId/close`

Reczne zamkniecie. Rzuca `SUBMISSION_HAS_PENDING_ITEMS` (409) jesli sa jeszcze PENDING.
Response: `{ "submissionId": 1, "closed": true }`

## Error codes

Zrodlo: `PublicProfileSubmissionErrors.ts` + hardcoded w router/controllerze.

| Kod                            | HTTP | Kontekst                                        |
| ------------------------------ | ---- | ----------------------------------------------- |
| `PUBLIC_TOKEN_INVALID`         | 404  | Token nie istnieje / revoked                    |
| `PUBLIC_TOKEN_EXPIRED`         | 410  | Token po terminie                               |
| `EMAIL_VERIFY_REQUIRED`        | 401  | Brak/bledny Bearer session token                |
| `EMAIL_CODE_INVALID`           | 400  | Zly kod OTP                                     |
| `EMAIL_CODE_EXPIRED`           | 400  | Kod po terminie                                 |
| `EMAIL_VERIFY_RATE_LIMITED`    | 429  | Wyczerpano proby (max 5)                        |
| `LINK_RECOVERY_RATE_LIMITED`   | 429  | Cooldown na generowanie kolejnych linkow        |
| `ITEM_ALREADY_RESOLVED`        | 409  | Item nie jest PENDING                           |
| `FORBIDDEN`                    | 403  | Brak roli staff                                 |
| `SUBMISSION_ALREADY_CLOSED`    | 409  | Nie mozna edytowac zamknietego                  |
| `SUBMISSION_HAS_PENDING_ITEMS` | 409  | Nie mozna zamknac z PENDING items               |
| `SUBMISSION_NOT_FOUND`         | 404  | Submission nie istnieje                         |
| `ITEM_NOT_FOUND`               | 404  | Item nie istnieje w submission                  |
| `INVALID_REVIEW_DECISION`      | 400  | Decision musi byc ACCEPT lub REJECT             |
| `INVALID_EMAIL`                | 400  | Bledny email                                    |
| `RECIPIENT_EMAIL_REQUIRED`     | 400  | `sendNow=true`, ale brak recipienta i fallbacku |
| `INVALID_VERIFY_INPUT`         | 400  | Brak email lub code                             |
| `INVALID_PATH_PARAM`           | 400  | Bledny parametr URL                             |
| `FILE_REQUIRED`                | 400  | Brak pliku w analyze-file                       |

## Env variables (BE)

| Zmienna                                              | Default                                                    | Opis                         |
| ---------------------------------------------------- | ---------------------------------------------------------- | ---------------------------- |
| `PUBLIC_PROFILE_SUBMISSION_LINK_TTL_DAYS`            | 30                                                         | Czas zycia linku (dni)       |
| `PUBLIC_PROFILE_SUBMISSION_VERIFY_CODE_TTL_MINUTES`  | 10                                                         | Czas zycia kodu OTP (minuty) |
| `PUBLIC_PROFILE_SUBMISSION_VERIFY_CODE_MAX_ATTEMPTS` | 5                                                          | Max prob weryfikacji         |
| `PUBLIC_PROFILE_SUBMISSION_SESSION_TTL_HOURS`        | 24                                                         | Czas zycia sesji (godziny)   |
| `PUBLIC_PROFILE_SUBMISSION_BASE_URL`                 | `https://ps.envi.com.pl/React/#/public/profile-submission` | Baza URL publicznego linku   |

## Krytyczne uwagi dla FE (S2)

1. **Token w URL path** — kazdy publiczny request musi miec token w URL, np. `/:token/draft`.
2. **PUT /draft payload jest FLAT** — `{ experiences, educations, skills }`, NIE `{ draft: { ... } }`.
3. **analyze-file NIE zapisuje** — FE musi zebrac wyniki, user wybiera, potem FE robi PUT /draft.
4. **Session token jako Bearer** — po confirm-code, kazdy nastepny request uzywa `Authorization: Bearer {publicSessionToken}`.
5. **Staff routes** — prefix to `/public-profile-submissions/` (NIE `/profile/public-submission-review`).
6. **Link recovery UI** — backend wspiera `recipientEmail` + `sendNow` + `dispatch` oraz pola `lastLink*`, ale UI biura musi jawnie to obsluzyc, aby proces odzyskiwania linku byl domkniety end-to-end.
