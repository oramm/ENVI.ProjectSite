# Plan refaktoru Persons v2 (FE)

Data startu: 2026-02-12
Status dokumentu: ACTIVE
Zakres: tylko Frontend dla modulow `Admin/SystemUsers` oraz `Persons`

## Cel

Migracja FE z legacy sciezek zapisu uzytkownika do API v2 account/profile:

- `GET /v2/persons/:personId/account`
- `PUT /v2/persons/:personId/account`
- `GET /v2/persons/:personId/profile`
- `PUT /v2/persons/:personId/profile`

## Zakres i ograniczenia

### W zakresie

- `Admin/SystemUsers`
- `Persons`
- Spojnosc przeplywu odczytu i zapisu account/profile
- Usuniecie aktywnych wywolan legacy w tym obszarze

### Poza zakresem

- Experiences (`profile/experiences*`)
- Zmiany backendu
- Refaktory niezwiazane z migracja account/profile

## Session Contract

1. Kazda nowa sesja zaczyna od odczytu:
    - `documentation/operations/persons-v2-refactor/plan.md`
    - `documentation/operations/persons-v2-refactor/progress.md`
2. W kazdej sesji realizujemy wylacznie pierwszy checkpoint ze statusem `OPEN` (najnizszy ID).
3. Nie przeskakujemy do kolejnych checkpointow w tej samej sesji.
4. Na koncu sesji wpisujemy wynik do progress:
    - `DONE` + wskazanie nastepnego `OPEN` checkpointu, albo
    - `WAITING` + precyzyjny `Required user action`.
5. Kazdy wpis sesyjny zawiera evidence (pliki/obszary + walidacja).

## Status language (obowiazkowy format)

- `DONE`: checkpoint ukonczony; podaj `Next OPEN: FE-PV2-XX`
- `OPEN`: checkpoint gotowy do podjecia
- `WAITING`: checkpoint zablokowany; podaj `Required user action: ...`

Nie uzywamy innych statusow (np. `In progress`, `Pending`, `Blocked`).

## Checkpointy (phased)

### Faza 1: Kontrakt danych i mapa migracji

- `FE-PV2-01` [OPEN] Finalna mapa pol formularzy do payloadow account/profile dla `SystemUsers` i `Persons`.
    - Kryterium `DONE`: pelna mapa pol bez experiences.
- `FE-PV2-02` [OPEN] Ustalenie i opis walidacji `personId` (dodatnia liczba calkowita) dla odczytu i zapisu.
    - Kryterium `DONE`: jeden wspolny scenariusz walidacji dla obu modulow.

### Faza 2: Read path v2

- `FE-PV2-03` [OPEN] Wpiecie odczytu account/profile v2 przy wejsciu w edycje w `Admin/SystemUsers`.
    - Kryterium `DONE`: formularz laduje dane z obu endpointow v2.
- `FE-PV2-04` [OPEN] Wpiecie odczytu account/profile v2 w `Persons`.
    - Kryterium `DONE`: formularz `Persons` laduje account/profile i poprawnie obsluguje `null` payload.

### Faza 3: Write path v2

- `FE-PV2-05` [OPEN] Wdrozenie zapisu `PUT account` + `PUT profile` dla edycji w `Admin/SystemUsers`.
    - Kryterium `DONE`: zapis dziala bez uzycia legacy endpointow.
- `FE-PV2-06` [OPEN] Wdrozenie zapisu `PUT account` + `PUT profile` dla edycji w `Persons`.
    - Kryterium `DONE`: zapis dziala i nie dotyka experiences.
- `FE-PV2-07` [OPEN] Ujednolicenie kolejnosci i obslugi bledow zapisu (account/profile) miedzy modulami.
    - Kryterium `DONE`: spojny UX bledow w obu modulach.

### Faza 4: Czyszczenie legacy i spojnosc repo

- `FE-PV2-08` [OPEN] Usuniecie aktywnych uzyc `POST /systemUser` i `PUT /user/:id` w zakresie feature.
    - Kryterium `DONE`: brak aktywnych wywolan legacy w `SystemUsers/Persons`.
- `FE-PV2-09` [OPEN] Potwierdzenie, ze odswiezanie UI idzie z `repository.items` po operacjach CRUD.
    - Kryterium `DONE`: brak lokalnych mutacji omijajacych source of truth repo.

### Faza 5: Domkniecie i kontrola jakosci

- `FE-PV2-10` [OPEN] Build i smoke test dla `Admin/SystemUsers` oraz `Persons`.
    - Kryterium `DONE`: build green, kluczowe sciezki recznie potwierdzone.
- `FE-PV2-11` [OPEN] Uzupelnienie postepu sesyjnego zgodnie z kontraktem statusow.
    - Kryterium `DONE`: wszystkie wykonane checkpointy maja wpisy evidence.
- `FE-PV2-12` [OPEN] Zamkniecie checklisty post-change jako bramki koncowej.
    - Kryterium `DONE`: wszystkie pozycje checklisty oznaczone i udokumentowane.
