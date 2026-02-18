# Import profilu osoby z CV

## Opis funkcjonalnosci

Modul umozliwia import danych profilu osoby (doswiadczenie, wyksztalcenie, umiejetnosci) z pliku CV (PDF/DOCX). Plik jest wysylany na backend, gdzie OpenAI analizuje jego zawartosc i zwraca ustrukturyzowane dane. Uzytkownik przeglaada podglad, odznacza niepotrzebne rekordy i potwierdza import.

## Pliki

| Plik | Rola |
|------|------|
| `Typings/bussinesTypes.d.ts` | Typy: `AiProfileExperience`, `AiProfileEducation`, `AiProfileSkill`, `AiPersonProfileResult`, `ImportConfirmResponse` |
| `src/Persons/PersonProfile/Import/profileImportApi.ts` | Funkcje API: `analyzePersonProfileFile`, `confirmExperiencesImport`, `confirmEducationsImport`, `confirmSkillsImport` |
| `src/Persons/PersonProfile/Import/ImportPreviewExperiences.tsx` | Tabela podgladu doswiadczenia z checkboxami |
| `src/Persons/PersonProfile/Import/ImportPreviewEducations.tsx` | Tabela podgladu wyksztalcenia z checkboxami |
| `src/Persons/PersonProfile/Import/ImportPreviewSkills.tsx` | Tabela podgladu umiejetnosci z checkboxami |
| `src/Persons/PersonProfile/Import/ProfileImportModal.tsx` | Glowny modal — orkiestruje 4-krokowy przeplyw |
| `src/Persons/PersonProfile/PersonProfilePage.tsx` | Strona profilu — przycisk "Importuj z CV" + odswiezanie repozytoriow |

## Przeplyw UX

### Krok 1: Upload
- Uzytkownik klika **"Importuj z CV"** na stronie `PersonProfilePage`
- Otwiera sie modal z inputem plikowym (`accept=".pdf,.docx"`)
- Po wybraniu pliku klika **"Analizuj"**

### Krok 2: Analiza (spinner)
- Frontend wysyla `POST /v2/persons/:id/profile/analyze-file` z `FormData`
- Backend parsuje plik i przez OpenAI wyodrebnia dane
- Podczas oczekiwania wyswietlany jest spinner

### Krok 3: Podglad
- Wyniki AI prezentowane w 3 tabelach z checkboxami:
  - **Doswiadczenie**: organizacja, stanowisko, daty, aktualnosc
  - **Wyksztalcenie**: szkola, tytul, kierunek, daty
  - **Umiejetnosci**: nazwa, poziom, lata doswiadczenia
- Domyslnie wszystko zaznaczone — uzytkownik moze odznaczyc
- Przycisk **"Importuj zaznaczone (N)"** pokazuje liczbe zaznaczonych

### Krok 4: Import
- `Promise.allSettled` wysyla rownolegole 3 requesty:
  - `POST .../experiences/import-confirm`
  - `POST .../educations/import-confirm`
  - `POST .../skills/import-confirm`
- Backend deduplikuje i zapisuje do DB

### Krok 5: Podsumowanie
- Wyswietla ile rekordow dodano / pominieto w kazdej kategorii
- Bledy poszczegolnych endpointow pokazane jako alerty
- Po kliknieciu **"Zamknij"** modal sie zamyka i repozytoria sie odswiezaja

## Endpointy API

| Endpoint | Metoda | Body | Response |
|----------|--------|------|----------|
| `/v2/persons/:id/profile/analyze-file` | POST | `FormData` (pole `file`) | `AiPersonProfileResult` |
| `/v2/persons/:id/profile/experiences/import-confirm` | POST | `{ items: AiProfileExperience[] }` | `ImportConfirmResponse` |
| `/v2/persons/:id/profile/educations/import-confirm` | POST | `{ items: AiProfileEducation[] }` | `ImportConfirmResponse` |
| `/v2/persons/:id/profile/skills/import-confirm` | POST | `{ items: AiProfileSkill[] }` | `ImportConfirmResponse` |

## Typy danych

```typescript
interface AiProfileExperience {
    _tempId: number;
    organizationName?: string;
    positionName?: string;
    description?: string;
    dateFrom?: string;   // YYYY-MM-DD
    dateTo?: string;
    isCurrent?: boolean;
}

interface AiProfileEducation {
    _tempId: number;
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    dateFrom?: string;
    dateTo?: string;
}

interface AiProfileSkill {
    _tempId: number;
    name: string;
    levelCode?: string;
    yearsOfExperience?: number;
}

interface AiPersonProfileResult {
    experiences: AiProfileExperience[];
    educations: AiProfileEducation[];
    skills: AiProfileSkill[];
    _extractedText?: string;
}

interface ImportConfirmResponse {
    added: unknown[];
    skipped: unknown[];
    newDictionaryEntries?: unknown[];  // tylko dla skills
}
```

## Kluczowe wzorce

- **FormData bez recznego Content-Type** — boundary ustawiany automatycznie przez przegladarke
- **`_tempId`** — tymczasowy identyfikator nadawany po stronie frontendu do obslugi checkboxow (backend moze go zwrocic lub nie)
- **`Promise.allSettled`** — jeden nieudany import nie blokuje pozostalych
- **Odswiezanie repozytoriow** — po zamknieciu modala `handleImportDone` wywoluje `loadItemsFromServerPOST([])` na 3 repozytoriach i synchronizuje stan komponentu z `repository.items`
- **`ToolsFetch.fetchJsonWithSafeError`** — standardowy wrapper HTTP z obsluga bledow
- **`validatePersonId`** — walidacja personId przed kazdym wywolaniem API
