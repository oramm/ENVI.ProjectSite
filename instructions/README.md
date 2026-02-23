# Instrukcje i Wytyczne Projektu

## Zasada: Backend-First

**Frontend wykrywa problemy, Backend je rozwiazuje!**

-   Frontend (React/TypeScript) **waliduje** dane z API
-   Warningi/bledy w konsoli → **napraw backend** (Node.js/Express), NIE frontend
-   Brak workaroundow - utrzymujemy **spojnosc API contract**

---

## Struktura Plikow

```
instructions/              -- architektura i wzorce (canonical)
├── README.md (ten plik - nawigacja)
├── AI_GUIDELINES.md (ogolne wytyczne dla AI)
├── DEVELOPMENT.md (setup srodowiska, .env, dev login, testing)
├── docs-policy.md (polityka dokumentacji klient/serwer)
│
├── business-object-selectors.md (quick start, wzorce uzycia)
├── selectors-architecture.md (pelna dokumentacja architektury)
├── backend-computed-fields.md (jak naprawiac backend Node.js/Express)
├── crud-module-guide.md (receptura tworzenia nowych modulow CRUD)
├── filterable-table-data-flow.md
├── cv-profile-import.md (import profilu z CV — AI analiza pliku)
├── ui-browser-loop.md (iteracyjne dopracowanie UI ze screenshotami)
└── TasksGlobalView.md

documentation/operations/  -- plany, postepy, logi operacyjne
├── contract-meeting-notes/   (pointer → PS-nodeJS)
├── hr-module/                (pointer → PS-nodeJS)
├── persons-v2-refactor/      (FE plan/progress/checklist)
├── persons-v2-ui/            (FE UI plan/progress)
└── public-profile-submission/ (plan/progress/flow/api-contract)
```

Rozdzielenie: `instructions/` = architektura i wzorce, `documentation/` = plany i postepy.

---

## Dokumentacja Business Object Selectors

### Dla Developerow

**Szybki start / uzycie:**
> [business-object-selectors.md](./business-object-selectors.md)

-   Wzorce uzycia
-   Przyklady kodu
-   Debugging
-   FAQ

**Architektura i zasady dzialania:**
> [selectors-architecture.md](./selectors-architecture.md)

-   **Backend-First** - jak naprawiac bledy backendu
-   Szczegolowa architektura 3-warstwowa
-   Przeplyw danych
-   Warstwa walidacji
-   Tworzenie nowych selektorow
-   Best practices

### Dla AI Assistants

**WAZNE - Zasady AI:**

-   Gdy widzisz warning o brakujacych polach → **podaj rozwiazanie dla backendu** (Node.js/Express)
-   **NIGDY nie tworz workaroundow** na frontendzie (np. `preprocessItem`, `buildLabelKey`)
-   Frontend ma byc **prosty i czytelny** - backend dostarcza kompletne dane

**Kontekst ogolny:**

-   [AI_GUIDELINES.md](./AI_GUIDELINES.md) - Ogolne wytyczne dla AI
-   [business-object-selectors.md](./business-object-selectors.md) - Wzorce i przyklady

**Szczegoly implementacji:**

-   [selectors-architecture.md](./selectors-architecture.md) - Pelna dokumentacja architektury

## Zasada Modulowosci

Kazdy plik jest podzielony na sekcje, ktore mozna czytac niezaleznie:

-   Mozesz przeczytac tylko sekcje "Tworzenie Nowego Selektora"
-   Mozesz przeczytac tylko sekcje "Helper Functions"
-   Nie musisz czytac calego dokumentu od poczatku do konca

---

## Quick Links dla Typowych Scenariuszy

**Nowy developer - jak zaczac?**
> [DEVELOPMENT.md](./DEVELOPMENT.md) - setup srodowiska, .env, yarn scripts

**Dev login nie dziala / Playwright setup?**
> [DEVELOPMENT.md - Dev Login](./DEVELOPMENT.md#-dev-login--mock-authentication) - mock authentication

**Jak bezpiecznie commitowac kod?**
> [DEVELOPMENT.md - Security](./DEVELOPMENT.md#-security-guidelines) - .gitignore, .env, secrets

**Widzisz warning `Brak wymaganego pola`?**
> [backend-computed-fields.md](./backend-computed-fields.md) - przyklady naprawy backendu

**Tworzysz nowy selektor?**
> [selectors-architecture.md - Sekcja 7](./selectors-architecture.md#7-tworzenie-nowego-selektora) - szablon + checklist

**Debugujesz istniejacy selektor?**
> [business-object-selectors.md - Debugging](./business-object-selectors.md#debugging) - typowe problemy

**Tworzysz nowy modul CRUD?**
> [crud-module-guide.md](./crud-module-guide.md) - receptura + szablony kodu (lub uzyj `/new-crud-module`)

**AI implementuje funkcjonalnosc?**
> [selectors-architecture.md - Sekcja 7](./selectors-architecture.md#7-tworzenie-nowego-selektora) - Checklist dla AI

**Import profilu z CV (AI)?**
> [cv-profile-import.md](./cv-profile-import.md) - przeplyw, endpointy, typy danych

**Dopracowanie UI z AI (iteracyjnie, ze screenshotami)?**
> [ui-browser-loop.md](./ui-browser-loop.md) - ustalony schemat pracy (UI Browser Loop)

## Docs operacyjne

Plany, postepy i logi operacyjne znajduja sie w `documentation/operations/`.
Kazda operacja (feature/refaktor) ma osobny katalog z plikami `plan.md`, `progress.md`, `activity-log.md`.

> [documentation/operations/](../documentation/operations/) - wszystkie operacje
