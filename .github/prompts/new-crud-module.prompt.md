# Prompt: New CRUD Module

Generuje nowy moduł CRUD w ENVI.ProjectSite, zgodnie z wzorcami z `instructions/crud-module-guide.md`.

## Kiedy używać (agent inference)

Uruchom ten prompt, gdy z kontekstu wynika potrzeba nowego modułu CRUD, nawet jeśli użytkownik nie napisał słowa „CRUD” explicite.

Sygnały pozytywne:
- prośba o nową encję z listą i formularzami Add/Edit,
- prośba o nową stronę opartą o `FilterableTable`,
- potrzeba nowego repozytorium `RepositoryReact` + modale + walidacja,
- checkpoint planu mówi o „nowym module” lub „nowej sekcji danych” od zera.

Sygnały negatywne (nie uruchamiaj tego promptu):
- drobna poprawka istniejącego modułu,
- zmiana pojedynczego pola/modala bez tworzenia nowej struktury,
- task stricte bugfix/refactor bez nowej encji.

## Complexity Guard (obowiązkowy)

Jeśli uznasz, że wzorzec z `instructions/crud-module-guide.md` nie pasuje do zadania lub spowoduje niepotrzebne komplikacje, zatrzymaj generowanie i dopytaj użytkownika.

Dopytanie jest dozwolone i wymagane zarówno:
- na etapie planowania,
- jak i podczas wdrażania (gdy wyjdzie konflikt architektoniczny).

W takiej sytuacji podaj 2 opcje:
1. pełny moduł CRUD według guide,
2. minimalna zmiana istniejącego kodu.

## Wejście

`$ARGUMENTS` może być:
- krótkim opisem tekstowym,
- JSON-em z polami.

Obsługiwane dane wejściowe:
- `entityName` (wymagane),
- `targetPath` (opcjonalne),
- `fields` (opcjonalne),
- `endpoints` (opcjonalne),
- `repoType` = `scoped` | `global` (opcjonalne),
- `parentContext` np. `personId`, `contractId` (opcjonalne).

## Krok 1: Parsowanie argumentów

1. Odczytaj `entityName` i podstawowy kontekst domeny.
2. Jeśli dane są niepełne, dopytaj tylko o brakujące elementy krytyczne (najpierw: `repoType`, endpointy, kluczowe pola formularza).
3. Jeśli argumenty są kompletne (np. przekazane przez agenta z planu), przejdź bez pytań.

## Krok 2: Generowanie plików (w tej kolejności)

Użyj szablonów i zasad z `instructions/crud-module-guide.md`.

1. Typ TypeScript w `Typings/bussinesTypes.d.ts` (jeśli brak).
2. Controller:
   - `createXxxRepository(parentId)` dla `repoType=scoped`,
   - lub `export const xxxRepository` dla `repoType=global`.
3. Validation schema: `make{Entity}ValidationSchema(isEditing)`.
4. Modal body: formularz oparty o `useFormContext()`.
5. Modal buttons:
   - factory (`createXxxAddNewModalButton`/`createXxxEditModalButton`) dla scoped,
   - direct export dla global.
6. Search component `{Entity}Search.tsx` z `FilterableTable`, auto-load i poprawnym source-of-truth (`setItems([...repository.items])`).

## Krok 3: Integracja

- Dodaj route, jeśli moduł jest nową stroną top-level.
- Nie twórz route, jeśli moduł jest osadzany w istniejącym widoku.

## Krok 4: Weryfikacja

Uruchom:
- `npx tsc --noEmit`

## Zasady wykonania

- Stosuj tylko wzorce z dokumentacji projektu, nie twórz nowych frameworków/patternów.
- Utrzymuj kod minimalny (MVP), bez nadmiarowych komponentów.
- Zachowaj zasadę single source of truth dla `RepositoryReact`.
- Gdy pojawia się konflikt wymagań lub ryzyko overengineeringu: dopytaj użytkownika zamiast zgadywać.

## Przykłady użycia

- Ręcznie (skrót):
  - `/new-crud-module PersonEducation`
- Z pełnymi argumentami (agent/plan):
  - `{"entityName":"MeetingNote","targetPath":"src/Contracts/ContractsList/ContractDetails/MeetingNotes","repoType":"global","fields":[{"name":"title","type":"string"}],"endpoints":{"getRoute":"meetingNotes","addNewRoute":"meetingNote","editRoute":"meetingNote","deleteRoute":"meetingNote"}}`
