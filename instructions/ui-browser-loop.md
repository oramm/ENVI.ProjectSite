# UI Browser Loop (ENVI)

Ten dokument opisuje **ustalony tryb współpracy** do dopracowywania UI w ENVI.ProjectSite z automatycznym sprawdzaniem efektu w przeglądarce (Puppeteer).

## Nazwa trybu / hasło

Używaj w rozmowie hasła:

**Tryb: UI Browser Loop**

Gdy napiszesz to hasło + opis zadania, pracujemy iteracyjnie według kroków poniżej.

---

## Schemat pracy (iteracyjny)

1. **Ty** opisujesz cel UI + zakres (gdzie / co zmienić) i uzgadniamy plan.
2. **Agent** analizuje kod i wprowadza zmiany.
3. **Agent** sprawdza efekt w przeglądarce (automatycznie przez Puppeteer).
4. **Agent** ocenia, czy UI wygląda dobrze (czytelność, układ, spójność z Bootstrap, responsywność).
5. Jeśli jest OK → koniec.
6. Jeśli jest źle → agent poprawia i wraca do kroku 3.
7. Jeśli agent nie jest pewien (brak kryteriów / zależność od backendu/danych) → dopytuje o decyzję i dopiero potem poprawia.

---

## Jak pisać polecenie (szablon)

Wklej i uzupełnij:

-   Tryb: UI Browser Loop
-   Route/ekran: `#/...` (np. `#/persons`)
-   Co jest nie tak teraz: …
-   Co ma być docelowo (kryteria akceptacji): …
-   Ograniczenia: (np. nie zmieniać logiki CRUD / tylko CSS / bez nowych zależności)
-   Rola użytkownika: (ADMIN / ENVI_MANAGER / ENVI_EMPLOYEE)
-   Rozdzielczość: (np. 1920x1080)

---

## Automatyczna weryfikacja UI (Puppeteer)

Projekt ma skrypt do screenshotów. Agent może go używać do szybkiej weryfikacji.

### Wymagania

-   dev server działa na `http://localhost:9000`
-   jeśli ekran wymaga logowania, włącz DEV login:
    -   ustaw `ENABLE_DEV_LOGIN=true` w `.env` (frontend)
    -   backend musi obsługiwać `dev_mode: true` w `POST /login`

### Przykładowe komendy

Screenshot bez logowania:

-   `node scripts/screenshot.js http://localhost:9000/docs/#/letters test-results/screenshots/letters.png`

Screenshot z automatycznym kliknięciem „DEV: Mock Login”:

-   `node scripts/screenshot.js http://localhost:9000/docs/#/persons test-results/screenshots/persons-logged.png --mock-login`

Timeout (gdy ekran ładuje się długo):

-   `node scripts/screenshot.js http://localhost:9000/docs/#/contracts test-results/screenshots/contracts.png --timeout=60000`

---

## Kryteria oceny UI (co agent sprawdza)

-   Czytelność (kontrast, wielkość fontu, gęstość informacji)
-   Spójność (Bootstrap spacing, warianty przycisków, nagłówki)
-   Układ (wyrównania, szerokości kolumn, overflow tabel)
-   Stany (loading, empty state, error)
-   Responsywność (minimum: 1280px i 1920px; jeśli dotyczy: mobile)

---

## Uwaga o danych

Jeśli UI zależy od danych z backendu (np. tabela pusta), agent może potrzebować:

-   przykładowego rekordu/testowych danych
-   wskazania, które środowisko/serwer ma być użyte
-   informacji: „ma być poprawnie nawet przy pustej liście” vs „skupiamy się na stanie z danymi”
