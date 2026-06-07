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
3. **Agent** uruchamia środowisko lokalne: backend `http://localhost:3000` i frontend `http://localhost:9000/docs/`.
4. **Agent** potwierdza, że frontend jest skompilowany po zmianach.
5. **Weryfikacja UI** odbywa się w jednym z dwóch trybów:
    - automatycznie przez Puppeteer i screenshoty,
    - półmanualnie: agent otwiera właściwy ekran, a użytkownik sam klika i zgłasza wynik.
6. **Agent** ocenia efekt na podstawie screenshotów, obserwacji w przeglądarce albo informacji zwrotnej od użytkownika.
7. Jeśli jest OK → koniec.
8. Jeśli jest źle → agent poprawia i wraca do kroku 4.
9. Jeśli agent nie jest pewien (brak kryteriów / zależność od backendu/danych) → dopytuje o decyzję i dopiero potem poprawia.

---

## Jak pisać polecenie (szablon)

Wklej i uzupełnij:

- Tryb: UI Browser Loop
- Route/ekran: `#/...` (np. `#/persons`)
- Co jest nie tak teraz: …
- Co ma być docelowo (kryteria akceptacji): …
- Ograniczenia: (np. nie zmieniać logiki CRUD / tylko CSS / bez nowych zależności)
- Rola użytkownika: (ADMIN / ENVI_MANAGER / ENVI_EMPLOYEE)
- Rozdzielczość: (np. 1920x1080)

---

## Automatyczna weryfikacja UI (Puppeteer)

Projekt ma skrypt do screenshotów. Agent może go używać do szybkiej weryfikacji.

## Bramka kompilacji klienta

Zanim agent odda ekran do testu albo zrobi screenshot, musi potwierdzić, że zmiany są obecne w kliencie:

- jeśli działa `yarn start`, agent czeka na zakończony rebuild webpacka bez błędów,
- jeśli sytuacja jest niejednoznaczna albo zmiana jest większa, agent uruchamia dodatkowo `yarn build`,
- test UI nie jest wiarygodny, jeśli frontend nie został przebudowany po ostatniej zmianie.

## Start środowiska z backend workspace

Jeśli agent pracuje z repo `PS-nodeJS`, preferowany start lokalnego środowiska to:

- `yarn dev:status` - sprawdza, czy backend i frontend już działają
- `yarn dev:up` - uruchamia backend i frontend razem
- `yarn dev:logs` - pokazuje logi obu procesów
- `yarn dev:down` - zatrzymuje oba procesy

To jest preferowana ścieżka, gdy użytkownik chce sam klikać w UI po ręcznym otwarciu ekranu.

## Tryb półmanualny: agent uruchamia, użytkownik klika

Ten tryb stosuj, gdy użytkownik chce samodzielnie testować UI po stronie przeglądarki.

Przebieg:

1. Agent uruchamia środowisko lokalne (`yarn dev:up` z repo `PS-nodeJS`, o ile serwery jeszcze nie działają).
2. Agent potwierdza, że frontend po zmianach zdążył się skompilować lub przebudować.
3. Agent otwiera odpowiedni adres `http://localhost:9000/docs/#/...`.
4. Użytkownik wykonuje kliknięcia, wybory i wpisywanie danych ręcznie.
5. Agent w tym czasie analizuje kod, logi albo czeka na opis wyniku.
6. Jeśli trzeba, agent robi poprawkę, znowu czeka na kompilację frontendu i ponownie otwiera ten sam ekran do retestu.

Ten wariant jest szczególnie przydatny dla ekranów zależnych od danych, uprawnień lub trudnych do stabilnej automatyzacji.

### Ustalony kontekst środowiska

- frontend dev server działa na `http://localhost:9000`, ale aplikacja jest serwowana pod `http://localhost:9000/docs/#/...`
- przy uruchomieniu na localhost frontend komunikuje się z backendem pod `http://localhost:3000`
- dla ekranów wymagających logowania używaj `ENABLE_DEV_LOGIN=true` po stronie frontendu i backendowego wsparcia dla `POST /login` z `dev_mode: true`
- gdy port `9000` lub `3000` jest już zajęty, najpierw sprawdź, czy serwer już działa, zamiast od razu go restartować lub zabijać
- `scripts/screenshot.js` obsługuje opcje `--mock-login`, `--timeout=...`, `--viewport=WxH`, `--selector=...`, `--text="..."`
- tymczasowe zrzuty ekranu zapisuj do `tmp/ui-browser-loop/` i usuń je po weryfikacji; nie są to artefakty do commita

### Wymagania

- dev server działa na `http://localhost:9000`
- jeśli ekran wymaga logowania, włącz DEV login:
    - ustaw `ENABLE_DEV_LOGIN=true` w `.env` (frontend)
    - backend musi obsługiwać `dev_mode: true` w `POST /login`

### Przykładowe komendy

Screenshot bez logowania:

- `node scripts/screenshot.js http://localhost:9000/docs/#/letters tmp/ui-browser-loop/letters.png`

Screenshot z automatycznym kliknięciem „DEV: Mock Login”:

- `node scripts/screenshot.js http://localhost:9000/docs/#/persons tmp/ui-browser-loop/persons-logged.png --mock-login`

Timeout (gdy ekran ładuje się długo):

- `node scripts/screenshot.js http://localhost:9000/docs/#/contracts tmp/ui-browser-loop/contracts.png --timeout=60000`

Gotowy skrót dla kontraktu:

- `yarn screenshot:contract`

Czyszczenie po zakończeniu iteracji:

- `yarn screenshot:cleanup`

---

## Kryteria oceny UI (co agent sprawdza)

- Czytelność (kontrast, wielkość fontu, gęstość informacji)
- Spójność (Bootstrap spacing, warianty przycisków, nagłówki)
- Układ (wyrównania, szerokości kolumn, overflow tabel)
- Stany (loading, empty state, error)
- Responsywność (minimum: 1280px i 1920px; jeśli dotyczy: mobile)

---

## Uwaga o danych

Jeśli UI zależy od danych z backendu (np. tabela pusta), agent może potrzebować:

- przykładowego rekordu/testowych danych
- wskazania, które środowisko/serwer ma być użyte
- informacji: „ma być poprawnie nawet przy pustej liście” vs „skupiamy się na stanie z danymi”

Po zakończeniu iteracji usuń zawartość `tmp/ui-browser-loop/`, aby nie zostawiać zbędnych artefaktów lokalnych.
