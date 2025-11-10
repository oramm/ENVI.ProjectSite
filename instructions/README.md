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
│
├── business-object-selectors.md (quick start, wzorce użycia)
├── selectors-architecture.md (pełna dokumentacja architektury)
└── backend-computed-fields.md (⭐ jak naprawiać backend Node.js/Express)
```

---

## 🔧 Quick Links dla Typowych Scenariuszy

**Widzisz warning `⚠️ Brak wymaganego pola`?**
→ [backend-computed-fields.md](./backend-computed-fields.md) - przykłady naprawy backendu

**Tworzysz nowy selektor?**
→ [selectors-architecture.md - Sekcja 7](./selectors-architecture.md#7-tworzenie-nowego-selektora) - szablon + checklist

**Debugujesz istniejący selektor?**
→ [business-object-selectors.md - Debugging](./business-object-selectors.md#debugging) - typowe problemy

**AI implementuje funkcjonalność?**
→ [selectors-architecture.md - Sekcja 7](./selectors-architecture.md#7-tworzenie-nowego-selektora) - 🤖 Checklist dla AI
├── README.md (ten plik)
├── AI_GUIDELINES.md
├── business-object-selectors.md ← Praktyczny przewodnik
├── selectors-architecture.md ← Szczegóły techniczne
└── ...

```

```
