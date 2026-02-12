# Plan refaktoru Persons v2 (FE)

Data startu: 2026-02-12
Status dokumentu: ACTIVE
Zakres: tylko Frontend dla modułów `Admin/SystemUsers` oraz `Persons`

## Cel

Migracja FE z legacy ścieżek zapisu użytkownika do API v2 account/profile:

- `GET /v2/persons/:personId/account`
- `PUT /v2/persons/:personId/account`
- `GET /v2/persons/:personId/profile`
- `PUT /v2/persons/:personId/profile`

## Zakres i ograniczenia

### W zakresie

- `Admin/SystemUsers`
- `Persons`
- Spójność przepływu odczytu i zapisu account/profile
- Usunięcie aktywnych wywołań legacy w tym obszarze

### Poza zakresem

- Experiences (`profile/experiences*`)
- Zmiany backendu
- Refaktory niezwiązane z migracją account/profile

## Session Contract

1. Każda nowa sesja zaczyna od odczytu:
    - `instructions/persons-v2-refactor/persons-v2-refactor-plan.md`
    - `instructions/persons-v2-refactor/persons-v2-refactor-progress.md`
2. W każdej sesji realizujemy wyłącznie pierwszy checkpoint ze statusem `OPEN` (najniższy ID).
3. Nie przeskakujemy do kolejnych checkpointów w tej samej sesji.
4. Na końcu sesji wpisujemy wynik do progress:
    - `DONE` + wskazanie następnego `OPEN` checkpointu, albo
    - `WAITING` + precyzyjny `Required user action`.
5. Każdy wpis sesyjny zawiera evidence (pliki/obszary + walidacja).

## Status language (obowiązkowy format)

- `DONE`: checkpoint ukończony; podaj `Next OPEN: FE-PV2-XX`
- `OPEN`: checkpoint gotowy do podjęcia
- `WAITING`: checkpoint zablokowany; podaj `Required user action: ...`

Nie używamy innych statusów (np. `In progress`, `Pending`, `Blocked`).

## Checkpointy (phased)

### Faza 1: Kontrakt danych i mapa migracji

- `FE-PV2-01` [OPEN] Finalna mapa pól formularzy do payloadów account/profile dla `SystemUsers` i `Persons`.
    - Kryterium `DONE`: pełna mapa pól bez experiences.
- `FE-PV2-02` [OPEN] Ustalenie i opis walidacji `personId` (dodatnia liczba całkowita) dla odczytu i zapisu.
    - Kryterium `DONE`: jeden wspólny scenariusz walidacji dla obu modułów.

### Faza 2: Read path v2

- `FE-PV2-03` [OPEN] Wpięcie odczytu account/profile v2 przy wejściu w edycję w `Admin/SystemUsers`.
    - Kryterium `DONE`: formularz ładuje dane z obu endpointów v2.
- `FE-PV2-04` [OPEN] Wpięcie odczytu account/profile v2 w `Persons`.
    - Kryterium `DONE`: formularz `Persons` ładuje account/profile i poprawnie obsługuje `null` payload.

### Faza 3: Write path v2

- `FE-PV2-05` [OPEN] Wdrożenie zapisu `PUT account` + `PUT profile` dla edycji w `Admin/SystemUsers`.
    - Kryterium `DONE`: zapis działa bez użycia legacy endpointów.
- `FE-PV2-06` [OPEN] Wdrożenie zapisu `PUT account` + `PUT profile` dla edycji w `Persons`.
    - Kryterium `DONE`: zapis działa i nie dotyka experiences.
- `FE-PV2-07` [OPEN] Ujednolicenie kolejności i obsługi błędów zapisu (account/profile) między modułami.
    - Kryterium `DONE`: spójny UX błędów w obu modułach.

### Faza 4: Czyszczenie legacy i spójność repo

- `FE-PV2-08` [OPEN] Usunięcie aktywnych użyć `POST /systemUser` i `PUT /user/:id` w zakresie feature.
    - Kryterium `DONE`: brak aktywnych wywołań legacy w `SystemUsers/Persons`.
- `FE-PV2-09` [OPEN] Potwierdzenie, że odświeżanie UI idzie z `repository.items` po operacjach CRUD.
    - Kryterium `DONE`: brak lokalnych mutacji omijających source of truth repo.

### Faza 5: Domknięcie i kontrola jakości

- `FE-PV2-10` [OPEN] Build i smoke test dla `Admin/SystemUsers` oraz `Persons`.
    - Kryterium `DONE`: build green, kluczowe ścieżki ręcznie potwierdzone.
- `FE-PV2-11` [OPEN] Uzupełnienie postępu sesyjnego zgodnie z kontraktem statusów.
    - Kryterium `DONE`: wszystkie wykonane checkpointy mają wpisy evidence.
- `FE-PV2-12` [OPEN] Zamknięcie checklisty post-change jako bramki końcowej.
    - Kryterium `DONE`: wszystkie pozycje checklisty oznaczone i udokumentowane.
