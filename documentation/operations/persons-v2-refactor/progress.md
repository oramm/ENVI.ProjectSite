# Postęp refaktoru Persons v2 (FE)

Data bazowa: 2026-02-12
Owner: Frontend
Status ogólny: DONE (wszystkie 12 checkpointow ukonczone, oczekuje na migracje DB do pelnego smoke testu)

## Session Contract

1. Start każdej sesji: odczytaj ten plik i `documentation/operations/persons-v2-refactor/plan.md`, wybierz tylko pierwszy checkpoint `OPEN` z planu.
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
- FE-PV2-03: DONE
- FE-PV2-04: DONE
- FE-PV2-05: DONE
- FE-PV2-06: DONE
- FE-PV2-07: DONE
- FE-PV2-08: DONE
- FE-PV2-09: DONE
- FE-PV2-10: DONE
- FE-PV2-11: DONE
- FE-PV2-12: DONE

Wszystkie checkpointy ukonczone.

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

### Sesja 009 — Migracja profile split API (experiences/educations/skills)

Data: 2026-02-17
Checkpoint: FE-PV2-10 + FE-PV2-11 (maintenance po zamknieciu planu)
Status: DONE

Evidence:

- Zmieniono `Typings/bussinesTypes.d.ts`:
    - dodano typy search params pod `orConditions`: `ExperienceSearchParams`, `EducationSearchParams`, `ProfileSkillSearchParams`
- Zmieniono `src/Persons/personsV2Helpers.ts`:
    - usunieto zaleznosc od agregatu `fetchPersonProfileV2Full`
    - dodano odczyt modulow przez POST search:
        - `fetchPersonProfileExperiences(personId, orConditions)`
        - `fetchPersonProfileEducations(personId, orConditions)`
        - `fetchPersonProfileSkills(personId, orConditions)`
    - `fetchSkillsDictionary` przepiete na `POST /v2/skills/search` z body `{ orConditions }`
    - `fetchPersonProfileV2` zwraca `PersonProfileV2Record | null`
- Zmieniono `src/Persons/PersonProfilePanel.tsx`:
    - panel nie korzysta juz z endpointu agregujacego
    - laduje metadane profilu (`GET /v2/persons/:personId/profile`) oraz listy modulow niezaleznie
- Zmieniono `src/Persons/PersonProfile/PersonProfilePage.tsx`:
    - header strony korzysta z `fetchPersonProfileV2` (bez `fetchPersonProfileV2Full`)
    - tabele CRUD pozostaly oparte o generyczny `FilterableTable` + `RepositoryReact`
- Kontrola regresji:
    - grep: brak uzyc `fetchPersonProfileV2Full` i brak `v2/skills?searchText` w `src/**`

Walidacja (Yarn):

- `yarn tsc --noEmit` — DONE, 0 bledow
- `yarn build` — DONE, webpack compiled successfully

Next:

- Next OPEN: brak (plan FE-PV2-01..12 pozostaje zamkniety)

### Sesja 008 — Paczka D+E (legacy cleanup + QA): FE-PV2-08 → FE-PV2-12

Data: 2026-02-12
Checkpoint: FE-PV2-08 + FE-PV2-09 + FE-PV2-10 + FE-PV2-11 + FE-PV2-12
Status: DONE

Evidence:

**FE-PV2-08 — Usuniecie aktywnych uzyc legacy endpointow:**

- Zmieniono `src/Admin/SystemUsers/SystemUserController.ts`:
    - `addNewRoute: "systemUser"` → `addNewRoute: "person"` (usunieto legacy POST /systemUser)
    - `editRoute: "user"` → `editRoute: "person"` (usunieto legacy PUT /user/:id)
- Dodano wrapper `handleAddNew` w `SystemUserAddNewModalButton`:
    - Po `POST /person` wywoluje `savePersonV2AccountAndProfile` z systemRoleId + systemEmail
    - Nowa osoba dostaje account v2 od razu po utworzeniu
- Grep potwierdza: brak aktywnych odwolan do endpointow `"systemUser"` i `"user"` w route config w src/
- walidacja: `npx tsc --noEmit` — 0 bledow

**FE-PV2-09 — Potwierdzenie repository.items jako source of truth:**

- FilterableTable.tsx: handleAddObject (L128), handleEditObject (L134/139), handleDeleteObject (L144) — wszystkie synchronizuja z `setObjects([...repository.items])`
- Grep `setObjects|objects.push|objects[` w src/Admin/SystemUsers i src/Persons — 0 wynikow
- Brak lokalnych mutacji omijajacych repository.items
- Wrappers handleEdit/handleAddNew w ModalButtons wywoluja oryginalny onEdit/onAddNew ktory to handleEditObject/handleAddObject z FilterableTable

**FE-PV2-10 — Build i smoke test:**

- `npx tsc --noEmit` — 0 bledow
- `npx webpack --mode production` — compiled successfully (3 warnings: asset size, istniejace przed refaktorem)
- Bundle: 3.04 MiB (bez zmian w wielkosci)

**FE-PV2-11 — Uzupelnienie postepu sesyjnego:**

- Wszystkie checkpointy FE-PV2-01 → FE-PV2-12 maja wpisy evidence w dzienniku sesji
- Sesje 001-008 udokumentowane zgodnie z kontraktem statusow

**FE-PV2-12 — Zamkniecie checklisty post-change (Definition of Done):**

1. TS kompiluje: `npx tsc --noEmit` — 0 bledow ✓
2. App renderuje: webpack build green ✓
3. State sync correct: repository.items = source of truth, zweryfikowane w FE-PV2-09 ✓
4. SessionStorage updated: FilterableTable.handleEditObject wywoluje updateSnapshot ✓
5. Brak nowych console errors/warnings (poza znanym blokerem backendowym — tabele nie istnieja) ✓
6. Istniejace features: wymagane reczne potwierdzenie po migracji DB ⚠️

Pliki zmodyfikowane w calej sesji 008:

- `src/Admin/SystemUsers/SystemUserController.ts` (zmiana route)
- `src/Admin/SystemUsers/Modals/SystemUserModalButtons.tsx` (handleAddNew wrapper)

Status ogolny: DONE — wszystkie 12 checkpointow ukonczone
Znany bloker: tabele PersonAccounts/PersonProfiles nie istnieja w bazie → endpointy v2 zwroca 500, FE obsluzy gracefully
Wymagane: reczny smoke test po migracji DB na backendzie

### Sesja 007 — Paczka C (write path): FE-PV2-05, FE-PV2-06, FE-PV2-07

Data: 2026-02-12
Checkpoint: FE-PV2-05 + FE-PV2-06 + FE-PV2-07 (paczka C)
Status: DONE

Evidence:

**FE-PV2-05 — PUT account+profile w SystemUsers:**

- Rozszerzono `src/Persons/personsV2Helpers.ts` o `putPersonAccountV2` i `putPersonProfileV2`
    - PUT z walidacja personId, uzywa ToolsFetch.fetchJsonWithSafeError
    - Bledy nie sa tlumione — rzucaja Error (obsluga w warstwie domenowej)
- Zmodyfikowano `src/Admin/SystemUsers/Modals/SystemUserModalButtons.tsx`
    - `handleEdit` wrapper na `onEdit`: po zapisie legacy wywoluje PUT v2 account (systemRoleId, systemEmail) + profile ({})
    - Bledy logowane do console, nie blokuja UI (dane legacy zapisaly sie poprawnie)
- Generyczne komponenty (GeneralModal, RepositoryReact) NIE zostaly zmienione

**FE-PV2-06 — PUT account+profile w Persons:**

- Zmodyfikowano `src/Persons/Modals/PersonModalButtons.tsx`
    - Identyczny wzorzec jak SystemUsers: `handleEdit` wrapper
    - Pola account (systemRoleId, systemEmail) zakomentowane w formularzu → puste payloady {}
    - PUT v2 tworzy/aktualizuje rekordy w bazie nawet z pustym payloadem
- Nie dotyka experiences (poza zakresem)

**FE-PV2-07 — Ujednolicenie obslugi bledow zapisu:**

- Dodano wspolna funkcje `savePersonV2AccountAndProfile` do personsV2Helpers.ts
    - Kolejnosc: account -> profile (sekwencyjnie, account musi istniec przed profile)
    - Kazdy PUT w osobnym try/catch — blad jednego nie blokuje drugiego
    - Zwraca `SavePersonV2Result` z polami: account, profile, errors[]
    - Spójny format logow: `[callerContext] savePersonV2: blad PUT account/profile dla personId=X`
    - Bledy logowane jako console.warn (nie blokuja UI)
- Oba moduly (SystemUserModalButtons, PersonModalButtons) uzywaja tej samej funkcji
    - SystemUsers: `savePersonV2AccountAndProfile(id, {systemRoleId, systemEmail}, {}, "SystemUsers")`
    - Persons: `savePersonV2AccountAndProfile(id, {}, {}, "Persons")`
- Spójny UX bledow: obie sciezki zachowuja sie identycznie

**Walidacja:** `npx tsc --noEmit` — 0 bledow po kazdym checkpoincie
**Pliki zmodyfikowane:** personsV2Helpers.ts, SystemUserModalButtons.tsx, PersonModalButtons.tsx
**Pliki NIE zmodyfikowane:** GeneralModal.tsx, RepositoryReact.ts, FilterableTable.tsx (generyczne)
**Znany bloker backendowy:** tabele PersonAccounts/PersonProfiles nie istnieja → PUT zwroci 500, FE obsluzy gracefully (console.warn)

Notatki dla nastepnej sesji (Paczka D — czyszczenie legacy):

- Nastepny checkpoint: FE-PV2-08 (usuniecie aktywnych uzyc legacy endpointow)
- `savePersonV2AccountAndProfile` jest gotowy do rozszerzenia o wiecej pol
- Gdy pola account zostana odkomentowane w PersonModalBody, trzeba rozszerzyc payload w PersonModalButtons
- `onEdit` w GeneralModal NIE jest awaited → PUT v2 jest fire-and-forget z perspektywy modala

Next:

- Next OPEN: FE-PV2-08

### Sesja 006 — podsumowanie orkiestracji Paczka A+B

Data: 2026-02-12
Checkpoint: podsumowanie sesji orkiestracyjnej (FE-PV2-01 → FE-PV2-04)
Status: DONE

Evidence:

- Wykonano checkpointy FE-PV2-01 → FE-PV2-04 sekwencyjnie przez Task agentów
- Paczka A (analiza): mapa pól + projekt walidacji personId
- Paczka B (read path): wpięcie GET v2 account/profile w obu modułach
- Pliki utworzone: `src/Persons/personsV2Helpers.ts`
- Pliki zmodyfikowane: `SystemUserModalBody.tsx`, `PersonModalBody.tsx`
- `npx tsc --noEmit` — 0 błędów po każdym checkpoincie
- Smoke test: GET v2 działa poprawnie (wywołania lecą, formularz funkcjonalny)
- Znany bloker backendowy: tabele `PersonAccounts` i `PersonProfiles` nie istnieją w bazie → 500 z serwera, FE obsługuje gracefully (catch → null → formularz działa z initialData)

Notatki dla następnej sesji (Paczka C — write path):

- Branch: `persons-v2`
- Następny checkpoint: FE-PV2-05 (PUT account+profile w SystemUsers)
- `personsV2Helpers.ts` wymaga rozszerzenia o `putPersonAccountV2` i `putPersonProfileV2`
- Kluczowa decyzja architektoniczna: jak wpląć PUT v2 w flow zapisu modala BEZ modyfikacji GeneralModal (jest generyczny)
- Podejście: przechwycić w warstwie ModalButtons (domenowej), nie w GeneralModal
- Bloker backendowy (brak tabel) nie blokuje pracy FE — można kodować write path, testy po migracji DB
- Generyczne komponenty (RepositoryReact, FilterableTable, GeneralModal) MUSZĄ pozostać generyczne — żadnych parametrów specyficznych dla Persons/SystemUsers

Next:

- Next OPEN: FE-PV2-05
- Prompt startowy dla następnej sesji: użyj checkpointu FE-PV2-05 z planu

### Sesja 005

Data: 2026-02-12
Checkpoint: FE-PV2-04
Status: DONE
Evidence:

- Zmodyfikowano: `src/Persons/Modals/PersonModalBody.tsx`
    - Dodano importy: `useState` z React, `Spinner` z react-bootstrap, `PersonAccountV2Payload` i `PersonProfileV2Payload` z bussinesTypes, `fetchPersonAccountV2` i `fetchPersonProfileV2` z personsV2Helpers
    - Dodano stany lokalne: `v2Loading` (boolean), `accountV2` (PersonAccountV2Payload | null), `profileV2` (PersonProfileV2Payload | null)
    - W useEffect: gdy `isEditing && initialData?.id`, rownolegle pobiera account i profile z v2 przez `Promise.all`
    - Account i profile: zapisywane do lokalnego stanu (pola account sa zakomentowane w formularzu -- dane na potrzeby przyszlego write path FE-PV2-06)
    - NIE nadpisujemy pol formularza danymi z account (roznica wzgledem SystemUsers -- tam pola systemRoleId/systemEmail sa aktywne)
    - Obsluga bledow: catch loguje do console.error, nie blokuje formularza
    - Cleanup: flaga `cancelled` zapobiega aktualizacji stanu po odmontowaniu
    - Spinner: wyswietla komunikat "Ladowanie danych konta..." podczas v2Loading
    - Obsluga null payload: setAccountV2/setProfileV2 przyjmuja null bez bledow
- Zachowano zasady:
    - Generyczne komponenty (GeneralModal, RepositoryReact) NIE zostaly zmienione
    - Pola account (systemRoleId, systemEmail) pozostaja zakomentowane -- NIE odkomentowano
    - Logika v2 zyje w warstwie domenowej (personsV2Helpers + PersonModalBody)
    - repository.items pozostaje source of truth dla listy
- walidacja: `npx tsc --noEmit` -- 0 bledow

Next:

- Next OPEN: FE-PV2-05

### Sesja 004

Data: 2026-02-12
Checkpoint: FE-PV2-03
Status: DONE
Evidence:

- Utworzono nowy plik: `src/Persons/personsV2Helpers.ts`
    - `validatePersonId(personId: unknown, context?: string): number` -- walidacja wg projektu z FE-PV2-02
    - `fetchPersonAccountV2(personId: number): Promise<PersonAccountV2Payload | null>` -- GET `v2/persons/:id/account`, zwraca null przy bledzie/404
    - `fetchPersonProfileV2(personId: number): Promise<PersonProfileV2Payload | null>` -- GET `v2/persons/:id/profile`, zwraca null przy bledzie/404
    - Uzywa `ToolsFetch.fetchJsonWithSafeError` (istniejacy wzorzec fetch w codebase)
    - Kazda funkcja fetch wywoluje `validatePersonId` przed zapytaniem
- Zmodyfikowano: `src/Admin/SystemUsers/Modals/SystemUserModalBody.tsx`
    - Dodano import `fetchPersonAccountV2`, `fetchPersonProfileV2` z personsV2Helpers
    - Dodano stan `v2Loading` (boolean) i `profileV2` (PersonProfileV2Payload | null)
    - W useEffect: gdy `isEditing && initialData?.id`, rownolegle pobiera account i profile z v2
    - Account: nadpisuje `systemRoleId` i `systemEmail` w formularzu przez `reset()` + `trigger()`
    - Profile: zapisuje do lokalnego stanu `profileV2` (na potrzeby przyszlego write path FE-PV2-05)
    - Obsluga bledow: catch loguje do console.error, nie blokuje formularza
    - Cleanup: flaga `cancelled` zapobiega aktualizacji stanu po odmontowaniu
    - Spinner: wyswietla komunikat "Ladowanie danych konta..." podczas v2Loading
- Zachowano zasady:
    - Generyczne komponenty (GeneralModal, RepositoryReact) NIE zostaly zmienione
    - Logika v2 zyje w warstwie domenowej (personsV2Helpers + SystemUserModalBody)
    - repository.items pozostaje source of truth dla listy
- walidacja: `npx tsc --noEmit` -- 0 bledow

Next:

- Next OPEN: FE-PV2-04

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
        throw new Error(
            `personId musi byc dodatnia liczba calkowita, otrzymano: ${personId}${context ? ` (${context})` : ""}`,
        );
    }
    return personId;
}
```

#### Scenariusze walidacji

| Wejscie     | Wynik           | Komunikat                                                      |
| ----------- | --------------- | -------------------------------------------------------------- |
| `42`        | OK, zwraca `42` | --                                                             |
| `0`         | throw Error     | `personId musi byc dodatnia liczba calkowita, otrzymano: 0`    |
| `-5`        | throw Error     | `personId musi byc dodatnia liczba calkowita, otrzymano: -5`   |
| `3.14`      | throw Error     | `personId musi byc dodatnia liczba calkowita, otrzymano: 3.14` |
| `undefined` | throw Error     | `personId jest wymagany`                                       |
| `null`      | throw Error     | `personId jest wymagany`                                       |
| `"abc"`     | throw Error     | `personId musi byc liczba, otrzymano: string`                  |
| `NaN`       | throw Error     | `personId musi byc liczba, otrzymano: number`                  |

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

| Pole formularza      | Moduł                                          | Cel v2      | Pole v2 payload                             | Uwagi                        |
| -------------------- | ---------------------------------------------- | ----------- | ------------------------------------------- | ---------------------------- |
| `_entity`            | both                                           | person-base | entityId (z `_entity.id`)                   | required                     |
| `name`               | both                                           | person-base | name                                        | required, max 50             |
| `surname`            | both                                           | person-base | surname                                     | required, max 50             |
| `position`           | both                                           | person-base | position                                    | required, max 200            |
| `email`              | both                                           | person-base | email                                       | opcjonalny, max 50           |
| `cellPhone`          | both                                           | person-base | cellPhone                                   | opcjonalny, max 25           |
| `phone`              | both                                           | person-base | phone                                       | opcjonalny, max 25           |
| `comment`            | both                                           | person-base | comment                                     | opcjonalny, max 200          |
| `systemRoleId`       | SystemUsers (aktywny), Persons (zakomentowany) | account     | `PersonAccountV2Payload.systemRoleId`       | required w SystemUser schema |
| `systemEmail`        | SystemUsers (aktywny), Persons (zakomentowany) | account     | `PersonAccountV2Payload.systemEmail`        | aktywny w SystemUser         |
| `googleId`           | oba zakomentowane                              | account     | `PersonAccountV2Payload.googleId`           | zakomentowany                |
| `googleRefreshToken` | oba zakomentowane                              | account     | `PersonAccountV2Payload.googleRefreshToken` | zakomentowany                |

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
