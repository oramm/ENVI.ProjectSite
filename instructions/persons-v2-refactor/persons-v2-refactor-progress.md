# Postęp refaktoru Persons v2 (FE)

Data bazowa: 2026-02-12
Owner: Frontend
Status ogólny: ACTIVE

## Session Contract

1. Start każdej sesji: odczytaj ten plik i wybierz tylko pierwszy checkpoint `OPEN` z planu.
2. Realizacja sesji obejmuje tylko ten jeden pierwszy checkpoint `OPEN`.
3. Zakończenie sesji musi użyć jednego z formatów:
    - `DONE` + `Next OPEN: FE-PV2-XX`
    - `WAITING` + `Required user action: ...`
4. Każdy log sesji zawiera evidence i następny krok.

## Status language (wymagane literalnie)

- `DONE`
- `OPEN`
- `WAITING`

Nie używamy innych etykiet (np. `In progress`, `Blocked`, `Pending`).

## Bieżący stan checkpointów

- FE-PV2-01: DONE
- FE-PV2-02: DONE
- FE-PV2-03: OPEN
- FE-PV2-04: OPEN
- FE-PV2-05: OPEN
- FE-PV2-06: OPEN
- FE-PV2-07: OPEN
- FE-PV2-08: OPEN
- FE-PV2-09: OPEN
- FE-PV2-10: OPEN
- FE-PV2-11: OPEN
- FE-PV2-12: OPEN

Pierwszy `OPEN` checkpoint do następnej sesji: `FE-PV2-03`

## Szablon logu sesji (kompaktowy)

Data: RRRR-MM-DD
Checkpoint: FE-PV2-XX
Status: DONE | WAITING
Evidence:

- zmienione obszary/pliki: ...
- walidacja (build/smoke/manual): ...
  Next:
- jeśli DONE: Next OPEN: FE-PV2-YY
- jeśli WAITING: Required user action: ...

## Dziennik sesji

(uzupełniać od najnowszej sesji na górze)

### Sesja 003

Data: 2026-02-12
Checkpoint: FE-PV2-02
Status: DONE
Evidence:

- Analiza: przeczytano bussinesTypes.d.ts (RepositoryDataItem.id, PersonAccountV2Payload.personId, PersonProfileV2Payload.personId), RepositoryReact.ts (editItem - jak id buduje URL), GeneralModal.tsx (przepływ currentItems[0].id), SystemUserModalButtons.tsx, PersonModalButtons.tsx
- Projekt walidacji personId:

#### Lokalizacja pliku

`src/Persons/personsV2Helpers.ts` -- wspólny moduł pomocniczy dla obu modułów (Persons i Admin/SystemUsers). Oba moduły importują z tego samego pliku.

#### Sygnatura funkcji

```typescript
/**
 * Waliduje personId przed wywolaniem endpointow v2.
 * Rzuca Error jesli personId nie jest dodatnia liczba calkowita.
 *
 * @param personId - identyfikator osoby (z repository.currentItems[0].id)
 * @param context - opcjonalny kontekst do komunikatu bledu (np. "GET account", "PUT profile")
 * @returns personId (typ number) -- zwraca wartosc dla wygody chainowania
 * @throws Error jesli personId jest undefined/null, nie jest liczba, <= 0 lub nie jest calkowita
 */
export function validatePersonId(personId: unknown, context?: string): number {
    if (personId == null) {
        throw new Error(`personId jest wymagany${context ? ` (${context})` : ""}`);
    }
    if (typeof personId !== "number" || !Number.isFinite(personId)) {
        throw new Error(`personId musi byc liczba, otrzymano: ${typeof personId}${context ? ` (${context})` : ""}`);
    }
    if (!Number.isInteger(personId) || personId <= 0) {
        throw new Error(`personId musi byc dodatnia liczba calkowita, otrzymano: ${personId}${context ? ` (${context})` : ""}`);
    }
    return personId;
}
```

#### Scenariusze walidacji

| Wejscie | Wynik | Komunikat |
|---|---|---|
| `42` | OK, zwraca `42` | -- |
| `0` | throw Error | `personId musi byc dodatnia liczba calkowita, otrzymano: 0` |
| `-5` | throw Error | `personId musi byc dodatnia liczba calkowita, otrzymano: -5` |
| `3.14` | throw Error | `personId musi byc dodatnia liczba calkowita, otrzymano: 3.14` |
| `undefined` | throw Error | `personId jest wymagany` |
| `null` | throw Error | `personId jest wymagany` |
| `"abc"` | throw Error | `personId musi byc liczba, otrzymano: string` |
| `NaN` | throw Error | `personId musi byc liczba, otrzymano: number` |

#### Typ parametru: `unknown`

Parametr wejsciowy ma typ `unknown` (nie `number`), poniewaz:
- `repository.currentItems[0]` moze byc `undefined` jesli lista jest pusta
- Dane z formularza moga zawierac string zamiast number
- Bezpieczniej walidowac runtime niz ufac typom TS

#### Miejsce wywolania (oba moduly identycznie)

Walidacja bedzie wolana w kodzie domenowym (ModalButtons lub dedykowany handler v2), PRZED kazdym wywolaniem v2:

```typescript
// Przyklad uzycia w SystemUsers i Persons (identyczny wzorzec):
import { validatePersonId } from "../../Persons/personsV2Helpers";

// Przed GET v2
const personId = validatePersonId(repository.currentItems[0]?.id, "GET account");
const accountData = await fetch(`${serverUrl}/v2/persons/${personId}/account`);

// Przed PUT v2
const personId = validatePersonId(repository.currentItems[0]?.id, "PUT account");
await fetch(`${serverUrl}/v2/persons/${personId}/account`, { method: "PUT", body: ... });
```

#### Decyzje projektowe

1. **Jeden plik, jedna funkcja** -- brak potrzeby osobnych walidatorow per modul, bo reguly sa identyczne
2. **Nie modyfikujemy GeneralModal ani RepositoryReact** -- walidacja jest domenowa (v2 persons), wiec nie wchodzi do generycznych komponentow
3. **Zwraca wartosc** -- umozliwia `const id = validatePersonId(x)` zamiast oddzielnego wywolania i uzycia
4. **Parametr `context`** -- ulatwia debugowanie, ktore wywolanie v2 zawiodlo

- walidacja: checkpoint projektowy (design-only), brak zmian w kodzie zrodlowym

Next:
- Next OPEN: FE-PV2-03

### Sesja 002

Data: 2026-02-12
Checkpoint: FE-PV2-01
Status: DONE
Evidence:

- Analiza: przeczytano SystemUserModalBody.tsx, PersonModalBody.tsx, bussinesTypes.d.ts, oba ValidationSchema
- Mapa pól formularzy → payloady v2:

| Pole formularza | Moduł | Cel v2 | Pole v2 payload | Uwagi |
|---|---|---|---|---|
| `_entity` | both | person-base | entityId (z `_entity.id`) | required |
| `name` | both | person-base | name | required, max 50 |
| `surname` | both | person-base | surname | required, max 50 |
| `position` | both | person-base | position | required, max 200 |
| `email` | both | person-base | email | opcjonalny, max 50 |
| `cellPhone` | both | person-base | cellPhone | opcjonalny, max 25 |
| `phone` | both | person-base | phone | opcjonalny, max 25 |
| `comment` | both | person-base | comment | opcjonalny, max 200 |
| `systemRoleId` | SystemUsers (aktywny), Persons (zakomentowany) | account | `PersonAccountV2Payload.systemRoleId` | required w SystemUser schema |
| `systemEmail` | SystemUsers (aktywny), Persons (zakomentowany) | account | `PersonAccountV2Payload.systemEmail` | aktywny w SystemUser |
| `googleId` | oba zakomentowane | account | `PersonAccountV2Payload.googleId` | zakomentowany |
| `googleRefreshToken` | oba zakomentowane | account | `PersonAccountV2Payload.googleRefreshToken` | zakomentowany |

- Pola v2 bez odpowiednika w UI: `microsoftId`, `microsoftRefreshToken`, `isActive` (account); `headline`, `summary`, `profileIsVisible` (profile)
- Żadne aktywne pole formularza nie mapuje się do profile payload
- walidacja: analiza kodu, brak zmian w kodzie

Next:
- Next OPEN: FE-PV2-02

### Sesja 001

Data: 2026-02-12
Checkpoint: FE-PV2-01
Status: OPEN
Evidence:

- Start planu i przygotowanie struktury checkpointów.
  Next:
- Next OPEN: FE-PV2-01

## Blockers

- Brak aktywnych blokerów.
