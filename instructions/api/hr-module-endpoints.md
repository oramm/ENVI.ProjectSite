# HR Module - API Specification (PS-nodeJS)

Branch: `persons-v2`
Data: 2026-02-14
Status: Backend zaimplementowany (sesje 1-3 zakończone)

---

## Spis treści

1. [Persons Search (rozszerzony)](#1-persons-search-rozszerzony)
2. [Person Profile (istniejący, rozszerzony)](#2-person-profile)
3. [Education CRUD](#3-education-crud)
4. [Skills Dictionary CRUD](#4-skills-dictionary-crud)
5. [Profile Skills CRUD](#5-profile-skills-crud)
6. [TypeScript Interfaces](#6-typescript-interfaces)

---

## 1. Persons Search (rozszerzony)

Istniejący endpoint `POST /persons` - rozszerzony o nowe pola.

### Nowe pola w `searchParams`

```typescript
interface PersonsSearchParams {
    // ... istniejące pola (projectId, contractId, systemRoleName, searchText, ...) ...
    skillIds?: number[];    // filtruj: osoba ma DOWOLNY z podanych skilli (OR)
    hasProfile?: boolean;   // filtruj: tylko osoby z profilem
}
```

### Nowe pole w response (lista osób)

Każdy obiekt Person na liście zawiera teraz dodatkowe pole:

```typescript
{
    // ... istniejące pola Person ...
    _skillNames?: string   // np. "Node.js, React, TypeScript" — GROUP_CONCAT z profilu
}
```

### Wyszukiwanie tekstowe (`searchText`)

`searchText` przeszukuje teraz również nazwy skilli z profilu osoby. Np. wpisanie "React" znajdzie osoby mające skill "React" w profilu.

---

## 2. Person Profile

### GET `/v2/persons/:personId/profile`

Pobiera profil osoby. **Rozszerzony** — teraz zwraca też `profileEducations` i `profileSkills`.

**Response (200):**
```json
{
    "id": 1,
    "personId": 42,
    "headline": "Senior Konsultant",
    "summary": "15 lat doświadczenia w nadzorze inwestorskim",
    "profileIsVisible": true,
    "profileExperiences": [
        {
            "id": 1,
            "personProfileId": 1,
            "organizationName": "ENVI Konsulting",
            "positionName": "Inspektor nadzoru",
            "description": "Nadzór nad projektami drogowymi",
            "dateFrom": "2020-01-15",
            "dateTo": null,
            "isCurrent": true,
            "sortOrder": 1
        }
    ],
    "profileEducations": [
        {
            "id": 1,
            "personProfileId": 1,
            "schoolName": "Politechnika Warszawska",
            "degreeName": "mgr inż.",
            "fieldOfStudy": "Budownictwo",
            "dateFrom": "2005-10-01",
            "dateTo": "2010-06-30",
            "sortOrder": 1
        }
    ],
    "profileSkills": [
        {
            "id": 1,
            "personProfileId": 1,
            "skillId": 3,
            "levelCode": "EXPERT",
            "yearsOfExperience": 10,
            "sortOrder": 1,
            "_skill": {
                "id": 3,
                "name": "Nadzór inwestorski",
                "nameNormalized": "nadzór inwestorski"
            }
        }
    ]
}
```

Jeśli osoba nie ma profilu, zwraca `null`.

### PUT `/v2/persons/:personId/profile`

Tworzy lub aktualizuje profil (upsert). Bez zmian — dotyczy tylko pól `headline`, `summary`, `profileIsVisible`.

**Request body:**
```json
{
    "headline": "Senior Konsultant",
    "summary": "15 lat doświadczenia...",
    "profileIsVisible": true
}
```

---

## 3. Education CRUD

Zarządzanie wykształceniem w profilu osoby.

### GET `/v2/persons/:personId/profile/educations`

Lista wpisów wykształcenia osoby. Sortowane po `sortOrder ASC, id ASC`.

**Response (200):** `PersonProfileEducationV2Record[]`
```json
[
    {
        "id": 1,
        "personProfileId": 5,
        "schoolName": "Politechnika Warszawska",
        "degreeName": "mgr inż.",
        "fieldOfStudy": "Budownictwo",
        "dateFrom": "2005-10-01",
        "dateTo": "2010-06-30",
        "sortOrder": 1
    }
]
```

### POST `/v2/persons/:personId/profile/educations`

Dodaje wpis wykształcenia. Automatycznie tworzy PersonProfile jeśli nie istnieje.

**Request body:** `PersonProfileEducationV2Payload`
```json
{
    "schoolName": "Politechnika Warszawska",
    "degreeName": "mgr inż.",
    "fieldOfStudy": "Budownictwo",
    "dateFrom": "2005-10-01",
    "dateTo": "2010-06-30",
    "sortOrder": 1
}
```

Wszystkie pola opcjonalne.

**Response (200):** `PersonProfileEducationV2Record` (z `id` i `personProfileId`)

### PUT `/v2/persons/:personId/profile/educations/:educationId`

Aktualizuje wpis wykształcenia.

**Request body:** `PersonProfileEducationV2Payload` (jak POST)

**Response (200):** `PersonProfileEducationV2Record`

**Błędy:**
- `400` — educationId nie istnieje dla tej osoby

### DELETE `/v2/persons/:personId/profile/educations/:educationId`

Usuwa wpis wykształcenia.

**Response (200):**
```json
{ "id": 1 }
```

**Błędy:**
- `400` — educationId nie istnieje dla tej osoby

---

## 4. Skills Dictionary CRUD

Globalny słownik umiejętności (shared, nie per-person).

### GET `/v2/skills`

Lista umiejętności. Do dropdownów i autocomplete.

**Query params:**
- `searchText` (string, optional) — filtruje po nazwie (LIKE `%searchText%`)

**Response (200):** `SkillDictionaryRecord[]`
```json
[
    { "id": 1, "name": "Nadzór inwestorski", "nameNormalized": "nadzór inwestorski" },
    { "id": 2, "name": "Kosztorysowanie", "nameNormalized": "kosztorysowanie" },
    { "id": 3, "name": "AutoCAD", "nameNormalized": "autocad" }
]
```

### POST `/v2/skills`

Dodaje umiejętność do słownika.

**Request body:** `SkillDictionaryPayload`
```json
{ "name": "Nadzór inwestorski" }
```

**Walidacja:**
- `name` — **wymagane**, non-empty string
- `nameNormalized` generowany automatycznie (lowercase, trim, collapse whitespace)
- UNIQUE constraint na `Name` — duplikat zwraca błąd DB

**Response (200):** `SkillDictionaryRecord`
```json
{ "id": 1, "name": "Nadzór inwestorski", "nameNormalized": "nadzór inwestorski" }
```

### PUT `/v2/skills/:skillId`

Zmienia nazwę umiejętności.

**Request body:**
```json
{ "name": "Nadzór inwestorski budowlany" }
```

**Walidacja:** jak POST (`name` wymagane, non-empty)

**Response (200):** `SkillDictionaryRecord`

### DELETE `/v2/skills/:skillId`

Usuwa umiejętność ze słownika.

**Response (200):**
```json
{ "id": 1 }
```

**Błędy:**
- `500` (FK constraint) — jeśli skill jest przypisany do jakiejkolwiek osoby (PersonProfileSkills). Należy najpierw usunąć przypisania.

---

## 5. Profile Skills CRUD

Zarządzanie umiejętnościami przypisanymi do profilu osoby.

### GET `/v2/persons/:personId/profile/skills`

Lista skilli osoby. Sortowane po `sortOrder ASC, id ASC`. Zawiera dane ze słownika w `_skill`.

**Response (200):** `PersonProfileSkillV2Record[]`
```json
[
    {
        "id": 1,
        "personProfileId": 5,
        "skillId": 3,
        "levelCode": "EXPERT",
        "yearsOfExperience": 10,
        "sortOrder": 1,
        "_skill": {
            "id": 3,
            "name": "Nadzór inwestorski",
            "nameNormalized": "nadzór inwestorski"
        }
    },
    {
        "id": 2,
        "personProfileId": 5,
        "skillId": 7,
        "levelCode": "INTERMEDIATE",
        "yearsOfExperience": 5,
        "sortOrder": 2,
        "_skill": {
            "id": 7,
            "name": "AutoCAD",
            "nameNormalized": "autocad"
        }
    }
]
```

### POST `/v2/persons/:personId/profile/skills`

Przypisuje skill do profilu osoby. Automatycznie tworzy PersonProfile jeśli nie istnieje.

**Request body:** `PersonProfileSkillV2Payload`
```json
{
    "skillId": 3,
    "levelCode": "EXPERT",
    "yearsOfExperience": 10,
    "sortOrder": 1
}
```

**Walidacja:**
- `skillId` — **wymagane**, must be a number
- `levelCode`, `yearsOfExperience`, `sortOrder` — opcjonalne
- UNIQUE constraint na `(PersonProfileId, SkillId)` — ten sam skill nie może być przypisany dwukrotnie

**Response (200):** `PersonProfileSkillV2Record` (z `_skill` object)

### PUT `/v2/persons/:personId/profile/skills/:skillEntryId`

Aktualizuje przypisanie skilla (levelCode, yearsOfExperience, sortOrder). **Nie zmienia skillId.**

**Request body:**
```json
{
    "levelCode": "EXPERT",
    "yearsOfExperience": 12,
    "sortOrder": 1
}
```

**Response (200):** `PersonProfileSkillV2Record`

### DELETE `/v2/persons/:personId/profile/skills/:skillEntryId`

Usuwa przypisanie skilla z profilu osoby.

**Response (200):**
```json
{ "id": 1 }
```

---

## 6. TypeScript Interfaces

```typescript
// === Profile (istniejące, dla kontekstu) ===

interface PersonProfileV2Payload {
    personId: number;
    headline?: string;
    summary?: string;
    profileIsVisible?: boolean;
}

interface PersonProfileV2Record extends PersonProfileV2Payload {
    id: number;
}

// === Experience (istniejące, dla kontekstu) ===

interface PersonProfileExperienceV2Payload {
    organizationName?: string;
    positionName?: string;
    description?: string;
    dateFrom?: string;
    dateTo?: string;
    isCurrent?: boolean;
    sortOrder?: number;
}

interface PersonProfileExperienceV2Record extends PersonProfileExperienceV2Payload {
    id: number;
    personProfileId: number;
}

// === Education (nowe — sesja 1) ===

interface PersonProfileEducationV2Payload {
    schoolName?: string;
    degreeName?: string;
    fieldOfStudy?: string;
    dateFrom?: string;
    dateTo?: string;
    sortOrder?: number;
}

interface PersonProfileEducationV2Record extends PersonProfileEducationV2Payload {
    id: number;
    personProfileId: number;
}

// === Skills Dictionary (nowe — sesja 2) ===

interface SkillDictionaryPayload {
    name: string;
}

interface SkillDictionaryRecord extends SkillDictionaryPayload {
    id: number;
    nameNormalized: string;
}

// === Profile Skills (nowe — sesja 2) ===

interface PersonProfileSkillV2Payload {
    skillId: number;
    levelCode?: string;
    yearsOfExperience?: number;
    sortOrder?: number;
}

interface PersonProfileSkillV2Record extends PersonProfileSkillV2Payload {
    id: number;
    personProfileId: number;
    _skill?: SkillDictionaryRecord;
}

// === Search params (rozszerzenie — sesja 3) ===

interface PersonsSearchParams {
    projectId?: string;
    contractId?: number;
    systemRoleName?: string;
    systemEmail?: string;
    id?: number;
    showPrivateData?: boolean;
    searchText?: string;
    skillIds?: number[];      // NEW: filtruj po skillach (OR logic)
    hasProfile?: boolean;     // NEW: filtruj po istnieniu profilu
}
```

---

## Podsumowanie endpointów

| # | Metoda | Endpoint | Opis |
|---|--------|----------|------|
| 1 | GET | `/v2/persons/:personId/profile` | Profil z educations + skills |
| 2 | PUT | `/v2/persons/:personId/profile` | Upsert profilu |
| 3 | GET | `/v2/persons/:personId/profile/educations` | Lista wykształcenia |
| 4 | POST | `/v2/persons/:personId/profile/educations` | Dodaj wykształcenie |
| 5 | PUT | `/v2/persons/:personId/profile/educations/:educationId` | Edytuj wykształcenie |
| 6 | DELETE | `/v2/persons/:personId/profile/educations/:educationId` | Usuń wykształcenie |
| 7 | GET | `/v2/skills` | Słownik skilli (query: `?searchText=`) |
| 8 | POST | `/v2/skills` | Dodaj skill do słownika |
| 9 | PUT | `/v2/skills/:skillId` | Edytuj nazwę skilla |
| 10 | DELETE | `/v2/skills/:skillId` | Usuń skill (fails if in use) |
| 11 | GET | `/v2/persons/:personId/profile/skills` | Lista skilli osoby |
| 12 | POST | `/v2/persons/:personId/profile/skills` | Przypisz skill do osoby |
| 13 | PUT | `/v2/persons/:personId/profile/skills/:skillEntryId` | Edytuj przypisanie |
| 14 | DELETE | `/v2/persons/:personId/profile/skills/:skillEntryId` | Usuń przypisanie |

### Wspólne reguły

- **Walidacja path params**: wszystkie `:personId`, `:educationId`, `:skillId`, `:skillEntryId` muszą być pozytywnymi liczbami całkowitymi (parseInt > 0). Błąd → throw Error (obsługiwany przez global error handler).
- **Content-Type**: `application/json`
- **Automatyczne tworzenie profilu**: POST education i POST profile skill automatycznie tworzą PersonProfile dla osoby, jeśli jeszcze nie istnieje.
- **Transakcje**: Wszystkie operacje write (POST/PUT/DELETE) wykonywane w transakcji DB.
