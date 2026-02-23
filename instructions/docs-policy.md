# Polityka Dokumentacji Klienta (ENVI.ProjectSite)

> **WAZNE DLA AGENTOW AI:** Ten projekt dziala w architekturze "Dark Factory" (AI-First) i jest podzielony na dwa repozytoria.
> Repozytorium Serwera (`PS-nodeJS`) pelni role Glownego Huba (Centrali) dla wiedzy o calym systemie.

## 1. Architektura Dokumentacji (3 warstwy)

Dokumentacja jest podzielona na 3 warstwy w kazdym repozytorium. Szczegolowy opis modelu: `C:\Apache24\htdocs\PS-nodeJS\documentation\team\operations\docs-map.md`.

### Backend (PS-nodeJS) â€” 3 warstwy:

| Warstwa | Opis | Lokalizacja |
|---------|------|-------------|
| **Canonical** | Zrodlo prawdy: architektura, runbooki, operacje | `C:\Apache24\htdocs\PS-nodeJS\documentation\team\` |
| **Adaptery** | Skroty per narzedzie AI | `CLAUDE.md`, `.github/instructions/`, `AGENTS.md` |
| **Factory** | Meta-narzedzia fabryki | `factory/` |

### Klient (ENVI.ProjectSite) â€” 2 warstwy:

| Warstwa | Opis | Lokalizacja |
|---------|------|-------------|
| **Canonical** | Reguly FE, wzorce, plany operacyjne | `instructions/` + `documentation/operations/` |
| **Adaptery** | Skroty per narzedzie AI | `CLAUDE.md`, `.github/copilot-instructions.md`, `AGENTS.md` |

### Co znajduje sie CENTRALNIE (w repozytorium Serwera - Hub):

Wiedza operacyjna i architektura systemu. **NIE DUPLIKUJ ICH TUTAJ.** Jesli potrzebujesz tych informacji, uzyj narzedzia do czytania plikow na absolutnych sciezkach serwera.

- _Sciezka canonical:_ `C:\Apache24\htdocs\PS-nodeJS\documentation\team\`
- _Architektura:_ `C:\Apache24\htdocs\PS-nodeJS\documentation\team\architecture\`

---

## 2. KRYTYCZNE: Kontrakty API

Najwiekszym ryzykiem w tym projekcie jest rozjazd typow miedzy Serwerem a Klientem.

**ZELAZNA REGULA DLA AGENTOW:**
Zrodlem prawdy (SSOT) dla wszystkich kontraktow API, modeli danych (DTO) i endpointow jest repozytorium Serwera.

1.  Zanim zaczniesz implementowac integracje z nowym lub zmienionym endpointem, **MUSISZ** odczytac definicje typow z backendu:
    - _Sciezka:_ `C:\Apache24\htdocs\PS-nodeJS\src\types\types.d.ts` (lub odpowiedni plik kontrolera/modelu na serwerze).
2.  Dopiero po zweryfikowaniu kontraktu na serwerze, mozesz zaktualizowac lokalne typy klienta:
    - _Sciezka:_ `C:\Apache24\htdocs\ENVI.ProjectSite\Typings\bussinesTypes.d.ts`
3.  Nigdy nie zgaduj struktury payloadu (JSON) na podstawie samego kodu UI. Zawsze weryfikuj to z backendem.

---

## 3. Obowiazki Agenta Dokumentacyjnego (Auto-docs) na Kliencie

Po udanej implementacji zadania frontendowego (VERDICT: APPROVE), Agent Dokumentacyjny musi:

1.  Zaktualizowac lokalny plik `progress.md` (odhaczycz zadania).
2.  Dopisac log do lokalnego `activity-log.md` (jakie komponenty zmieniono, jakie decyzje UI podjeto).
3.  **NIE** aktualizowac diagramow architektury â€” to zadanie dla agentow pracujacych w repozytorium Serwera, chyba ze zmiana dotyczy wylacznie przeplywu ekranow (UI flow).
