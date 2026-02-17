# Instrukcje i Wytyczne Projektu

## ⚠️ Zasada: Backend-First

**Frontend wykrywa problemy, Backend je rozwiązuje!**

-   Frontend (React/TypeScript) **waliduje** dane z API
-   Warningi/błędy w konsoli → **napraw backend** (Node.js/Express), NIE frontend
-   Brak workaroundów - utrzymujemy **spójność API contract**

---

## Dokumentacja Business Object Selectors

### Dla Developerów

**Szybki start / użycie:**
→ [business-object-selectors.md](./business-object-selectors.md)

-   Wzorce użycia
-   Przykłady kodu
-   Debugging
-   FAQ

**Architektura i zasady działania:**
→ [selectors-architecture.md](./selectors-architecture.md)

-   **⚠️ Backend-First** - jak naprawiać błędy backendu
-   Szczegółowa architektura 3-warstwowa
-   Przepływ danych
-   Warstwa walidacji
-   Tworzenie nowych selektorów
-   Best practices

### Dla AI Assistants

**⚠️ WAŻNE - Zasady AI:**

-   Gdy widzisz warning o brakujących polach → **podaj rozwiązanie dla backendu** (Node.js/Express)
-   **NIGDY nie twórz workaroundów** na frontendzie (np. `preprocessItem`, `buildLabelKey`)
-   Frontend ma być **prosty i czytelny** - backend dostarcza kompletne dane

**Kontekst ogólny:**

-   [AI_GUIDELINES.md](./AI_GUIDELINES.md) - Ogólne wytyczne dla AI
-   [business-object-selectors.md](./business-object-selectors.md) - Wzorce i przykłady

**Szczegóły implementacji:**

-   [selectors-architecture.md](./selectors-architecture.md) - Pełna dokumentacja architektury
    -   🤖 **Checklist dla AI** (sekcja 7)
    -   🔧 **Naprawianie błędów backendu** (sekcja 5)
    -   Sekcje modułowe (każda niezależna)
    -   Szczegółowe flow diagramy
    -   Przykłady kodu z wyjaśnieniami
    -   Do/Don't patterns

## Zasada Modułowości

Każdy plik jest podzielony na sekcje, które można czytać niezależnie:

-   ✅ Możesz przeczytać tylko sekcję "Tworzenie Nowego Selektora"
-   ✅ Możesz przeczytać tylko sekcję "Helper Functions"
-   ✅ Nie musisz czytać całego dokumentu od początku do końca

## Struktura Plików

```
instructions/
├── README.md (ten plik - nawigacja)
├── AI_GUIDELINES.md (ogólne wytyczne dla AI)
├── DEVELOPMENT.md (⭐ setup środowiska, .env, dev login, testing)
│
├── business-object-selectors.md (quick start, wzorce użycia)
├── selectors-architecture.md (pełna dokumentacja architektury)
├── backend-computed-fields.md (jak naprawiać backend Node.js/Express)
├── crud-module-guide.md (⭐ receptura tworzenia nowych modułów CRUD)
├── filterable-table-data-flow.md
└── TasksGlobalView.md
```

---

## 🔧 Quick Links dla Typowych Scenariuszy

**Nowy developer - jak zacząć?**
→ [DEVELOPMENT.md](./DEVELOPMENT.md) - setup środowiska, .env, yarn scripts

**Dev login nie działa / Playwright setup?**
→ [DEVELOPMENT.md - Dev Login](./DEVELOPMENT.md#-dev-login--mock-authentication) - mock authentication

**Jak bezpiecznie commitować kod?**
→ [DEVELOPMENT.md - Security](./DEVELOPMENT.md#-security-guidelines) - .gitignore, .env, secrets

**Widzisz warning `⚠️ Brak wymaganego pola`?**
→ [backend-computed-fields.md](./backend-computed-fields.md) - przykłady naprawy backendu

**Tworzysz nowy selektor?**
→ [selectors-architecture.md - Sekcja 7](./selectors-architecture.md#7-tworzenie-nowego-selektora) - szablon + checklist

**Debugujesz istniejący selektor?**
→ [business-object-selectors.md - Debugging](./business-object-selectors.md#debugging) - typowe problemy

**Tworzysz nowy moduł CRUD?**
→ [crud-module-guide.md](./crud-module-guide.md) - receptura + szablony kodu (lub użyj `/new-crud-module`)

**AI implementuje funkcjonalność?**
→ [selectors-architecture.md - Sekcja 7](./selectors-architecture.md#7-tworzenie-nowego-selektora) - 🤖 Checklist dla AI

**Dopracowanie UI z AI (iteracyjnie, ze screenshotami)?**
→ [ui-browser-loop.md](./ui-browser-loop.md) - ustalony schemat pracy (UI Browser Loop)
├── README.md (ten plik)
├── AI_GUIDELINES.md
├── business-object-selectors.md ← Praktyczny przewodnik
├── selectors-architecture.md ← Szczegóły techniczne
└── ...

```

```
