# Moduł Wyciągów Bankowych — Instrukcja obsługi

## Dostęp

Menu główne → **Faktury** → **Wyciągi bankowe**

Dostęp: role **ADMIN** i **ENVI_MANAGER**.

---

## Przegląd modułu

Moduł służy do importu wyciągów bankowych z banku PKO BP (format XML MT940), automatycznego dopasowywania przelewów do faktur sprzedaży i ofertowych, oraz ręcznego zarządzania alokacjami.

---

## Zakładki

### 1. Oczekujące (domyślna)

Wyświetla przelewy wymagające uwagi:

- **Niedopasowane (UNMATCHED)** — przelewy bez żadnego dopasowania do faktury.
- **Proponowane (PROPOSED)** — przelewy z propozycją dopasowania wymagającą potwierdzenia.

Dla każdego przelewu dostępny jest przycisk **Alokacje** otwierający modal zarządzania alokacjami.

### 2. Wszystkie przelewy

Tabela wszystkich zaimportowanych przelewów z filtrowaniem:

| Filtr | Opis |
|---|---|
| Status | UNMATCHED / PROPOSED / CONFIRMED / MANUAL |
| Kierunek | IN (wpływ) / OUT (wypływ) |
| Data od / do | Zakres dat realizacji przelewu |
| Strona | Paginacja (domyślnie 50/stronę) |

Każdy wiersz: kierunek (↓ IN / ↑ OUT), kwota, waluta, data, kontrahent, numer konta, opis, status.

### 3. Duplikaty

Automatyczne wykrywanie podejrzanych przelewów:

- **Grupowanie po kontrahencie** — ta sama kwota, konto, kierunek i waluta w krótkim czasie.
- **Grupowanie po numerze faktury** — ten sam numer faktury w opisie kilku przelewów wychodzących.

Każda grupa wyświetla identyfikujący sygnał i listę przelewów.

### 4. Wadium

Przegląd obligacji wadialnych z ofert i dopasowanie do przelewów zwrotnych.

- Dla każdej obligacji widoczna jest lista przelewów dopasowanych kwotowo (tolerancja ±5% lub ±200 PLN).
- Obligacje ze statusem RETURNED oznaczone są jako **Zwrócone**.

---

## Import wyciągu bankowego

1. Kliknij **Importuj wyciąg XML** (przycisk na górze strony).
2. Wybierz plik XML w formacie PKO BP MT940.
3. System przesyła plik i wyświetla **podgląd importu**:
   - Łączna liczba operacji w pliku
   - Automatycznie dopasowane (CONFIRMED)
   - Proponowane (PROPOSED)
   - Niedopasowane (UNMATCHED)
   - Opłaty bankowe (MANUAL)
   - Operacje w walucie obcej (MANUAL)
4. Kliknij **Zatwierdź import** aby zapisać przelewy w bazie, lub **Anuluj** aby odrzucić.

> Powtórny import tego samego pliku jest bezpieczny — duplikaty są ignorowane dzięki hashowi operacji.

---

## Zarządzanie alokacjami

Alokacja = powiązanie przelewu bankowego z fakturą (sprzedaży lub kosztową) na określoną kwotę.

### Otwarcie okna alokacji

Kliknij przycisk **Alokacje** przy dowolnym przelewie w zakładkach **Oczekujące** lub **Wszystkie przelewy** (kolumna Akcje).

### Okno alokacji

**Górna część — istniejące alokacje:**

Lista aktualnych powiązań przelewu z fakturami. Każda pozycja pokazuje:
- typ (Faktura / Kosztowa) i numer id faktury
- kwotę alokacji
- status dopasowania

Przycisk **Usuń** usuwa daną alokację.

**Dolna część — dodaj nową alokację:**

1. Wybierz typ faktury: **Faktura sprzedaży** lub **Faktura kosztowa**.
2. Wpisz numer faktury lub nazwę kontrahenta w polu wyszukiwania (wyszukiwanie zaczyna się po ~400 ms).
3. Kliknij fakturę na liście wyników — pola wypełnią się automatycznie.
4. W razie potrzeby zmień **Kwotę alokacji** (domyślnie = kwota przelewu).
5. Kliknij **Zapisz alokację**.

> Przelew oznaczony jako **MANUAL** (opłata bankowa, waluta obca) nie może mieć ręcznej alokacji.

---

## Statusy przelewów

| Status | Znaczenie |
|---|---|
| **UNMATCHED** | Brak dopasowania do faktury |
| **PROPOSED** | Algorytm znalazł kandydata (score ≥ 60/100), czeka na potwierdzenie |
| **CONFIRMED** | Alokacja zatwierdzona |
| **MANUAL** | Opłata bankowa lub waluta obca — alokacja niedostępna |

---

## Algorytm automatycznego dopasowania

Dopasowanie odbywa się podczas importu. Każdy przelew jest porównywany z fakturami wg punktacji:

| Kryterium | Punkty |
|---|---|
| Kwota | 35 |
| NIP kontrahenta w opisie | 30 |
| Numer faktury w opisie | 25 |
| Numer konta bankowego | 20 |
| Data (±7 dni od terminu płatności) | 10 |

Przelew uzyskuje status CONFIRMED przy wyniku ≥ 60 pkt. Poniżej progu — PROPOSED lub UNMATCHED.

---

## Funkcjonalności dodane w module

### Backend (`d:/GitHub/PS-nodeJS/src/bankSync/`)

- **Parser XML PKO BP** (`parsers/PkoBpXmlParser.ts`) — parsowanie formatu MT940 eksportowanego przez PKO BP
- **Pomocniki opisu** (`parsers/pkoBpDescriptionHelpers.ts`) — wyodrębnianie NIP, numerów faktur, nazw kontrahentów z pola opisu przelewu
- **Sygnały dopasowania** (`matching/signals.ts`) — generowanie sygnałów (NIP, numer rachunku, numer faktury) z przelewu i faktury
- **Matcher przelewów** (`matching/TransferMatcher.ts`) — ważona punktacja 0–100, threshold 60
- **BankStatement** — encja i repozytorium dla wyciągów bankowych (z hashowaniem pliku SHA-256)
- **BankTransfer** — encja i repozytorium dla pojedynczych operacji (z hashowaniem operacji, deduplicacja `INSERT IGNORE`)
- **PaymentAllocation** — encja i repozytorium dla alokacji przelew↔faktura
- **BankSyncController** — logika biznesowa: upload, commit, CRUD alokacji, wykrywanie duplikatów, dopasowanie wadium
- **BankSyncRouter** — REST API:
  - `POST /bank-statements` — upload XML
  - `POST /bank-statements/:id/commit` — zatwierdzenie importu
  - `GET /bank-transfers` — lista z filtrami (status, kierunek, daty, paginacja)
  - `GET /bank-transfers/pending` — oczekujące (UNMATCHED + PROPOSED)
  - `GET /bank-transfers/duplicates` — grupy duplikatów
  - `GET /bank-transfers/wadium-matches` — dopasowania wadium
  - `GET /bank-transfers/:id/allocations` — alokacje przelewu
  - `POST /bank-transfers/:id/allocations` — tworzenie alokacji
  - `DELETE /bank-transfers/:id/allocations/:allocId` — usuwanie alokacji
- **Migracje SQL** (`migrations/001_create_bank_sync_tables.sql`) — tabele `bank_statements`, `bank_transfers`, `payment_allocations`

### Frontend (`C:/xampp/htdocs/envi/ENVI.ProjectSite/src/Erp/BankSyncList/`)

- **`BankSyncSearch.tsx`** — główny komponent z 4 zakładkami, uploadem pliku, podglądem importu
  - Zakładka Oczekujące (`PendingTab`) — UNMATCHED + PROPOSED z przyciskiem Alokacje
  - Zakładka Wszystkie przelewy (`TransfersTab`) — filtrowanie, paginacja, przycisk Alokacje
  - Zakładka Duplikaty (`DuplicatesTab`) — grupowane podejrzane przelewy
  - Zakładka Wadium (`WadiumTab`) — obligacje z dopasowanymi przelewami zwrotnymi
- **`AllocationModal.tsx`** — modal zarządzania alokacjami
  - Podgląd istniejących alokacji z możliwością usunięcia
  - Wyszukiwanie faktur sprzedaży i kosztowych (debounced 400 ms)
  - Tworzenie nowych alokacji z walidacją kwoty
- **`BankSyncController.ts`** — warstwa API: wszystkie wywołania backendu
- **Routing** — `/bankSync` w `index.tsx`, dostęp dla ADMIN i ENVI_MANAGER
- **Menu** — pozycja "Wyciągi bankowe" w dropdownie Faktury
- **Typy** (`bussinesTypes.d.ts`) — `BankTransfer`, `BankStatement`, `PaymentAllocation`, `DuplicateGroup`, `WadiumMatchResult`, `MatchingStatus`, `TransferDirection`
