# Post-change checklist (Persons v2 FE)

Cel: bramka końcowa po zakończeniu checkpointów planu dla `Admin/SystemUsers` i `Persons`.

## Session Contract

1. Ta checklista jest wykonywana dopiero po zamknięciu checkpointów implementacyjnych.
2. Minimalny warunek wejścia: `FE-PV2-01` do `FE-PV2-11` mają status `DONE`.
3. Jeśli którykolwiek punkt checklisty nie przechodzi:
    - status sesji: `WAITING`
    - `Required user action`: precyzyjny opis decyzji lub danych potrzebnych od użytkownika.
4. Po pełnym przejściu checklisty:
    - `FE-PV2-12`: `DONE`
    - wpis w progress: `DONE` + brak kolejnego `OPEN` checkpointu.

## Powiązanie checklisty z checkpoint gates

- Gate A (API i flow): `FE-PV2-03`, `FE-PV2-04`, `FE-PV2-05`, `FE-PV2-06`, `FE-PV2-07`
- Gate B (legacy cleanup): `FE-PV2-08`
- Gate C (repo/source of truth): `FE-PV2-09`
- Gate D (build + smoke): `FE-PV2-10`
- Gate E (dokumentacja sesji): `FE-PV2-11`
- Gate F (zamknięcie): `FE-PV2-12`

## 1) Routing i regresja UI

- [ ] Widoki `Admin/SystemUsers` oraz `Persons` otwierają się bez regresji.
- [ ] Listy, filtry i aktywny rekord zachowują się jak przed migracją.
- [ ] Brak błędów krytycznych UI w podstawowym smoke teście.

## 2) API calls v2 (wymagane)

### Admin/SystemUsers

- [ ] Odczyt konta: `GET /v2/persons/:personId/account`
- [ ] Odczyt profilu: `GET /v2/persons/:personId/profile`
- [ ] Zapis konta: `PUT /v2/persons/:personId/account`
- [ ] Zapis profilu: `PUT /v2/persons/:personId/profile`

### Persons

- [ ] Odczyt konta: `GET /v2/persons/:personId/account`
- [ ] Odczyt profilu: `GET /v2/persons/:personId/profile`
- [ ] Zapis konta: `PUT /v2/persons/:personId/account`
- [ ] Zapis profilu: `PUT /v2/persons/:personId/profile`

## 3) Legacy removal

- [ ] Brak aktywnego `POST /systemUser` w tym feature.
- [ ] Brak aktywnego `PUT /user/:id` w tym feature.

## 4) Walidacje i UX

- [ ] Walidacja `personId` działa (dodatnia liczba całkowita).
- [ ] Obsługa `null` payload dla account/profile nie psuje formularza.
- [ ] Komunikaty błędów są spójne między `SystemUsers` i `Persons`.
- [ ] Experiences nie są odczytywane ani zapisywane.

## 5) Spójność repo i sesji

- [ ] Po zapisie UI synchronizuje dane z `repository.items`.
- [ ] Brak lokalnych mutacji omijających repo source of truth.
- [ ] Brak kolizji `sessionStorage/snapshot` między modułami.

## 6) Domknięcie

- [ ] Build projektu przechodzi.
- [ ] [documentation/operations/persons-v2-refactor/progress.md](documentation/operations/persons-v2-refactor/progress.md) ma finalny wpis `DONE`.
- [ ] `FE-PV2-12` ustawiony na `DONE` po pełnym przejściu checklisty.
