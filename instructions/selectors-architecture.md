# Business Object Selectors - Architektura i Zasady Działania

> **Modułowa dokumentacja** dla developerów i AI. Każda sekcja jest niezależna i może być czytana osobno.

## ⚠️ Zasada: Backend-First, Frontend Validates

**Frontend nie kompensuje braków backendu - informuje o nich!**

-   ✅ Backend (Node.js/Express) **MUSI** zwracać wszystkie wymagane pola (np. `_ourIdOrNumber_Name`)
-   ✅ Frontend **waliduje** i **rzuca ostrzeżeniami/błędami** gdy dane są niekompletne
-   ✅ Developer używa **logów z konsoli** do naprawienia backendu, NIE frontendu
-   ❌ **NIGDY** nie budujemy workaroundów na frontendzie - utrzymujemy spójność API

**Przykład:**

```
⚠️ [_contract] Brak wymaganego pola "_ourIdOrNumber_Name"
→ Napraw: Dodaj computed field w Node.js controller:
   contract._ourIdOrNumber_Name = `${contract.ourId || contract.number} - ${contract.alias || contract.name}`
```

---

## Spis Treści

1. [Przegląd Architektury](#1-przegląd-architektury)
2. [Repository i SessionStorage](#2-repository-i-sessionstorage)
3. [Warstwa Walidacji Danych](#3-warstwa-walidacji-danych)
4. [Komponenty Selektorów](#4-komponenty-selektorów)
5. [Helper Functions (ToolsForms)](#5-helper-functions-toolsforms)
6. [Przepływ Danych](#6-przepływ-danych)
7. [Wzorce i Best Practices](#7-wzorce-i-best-practices)
8. [Tworzenie Nowego Selektora](#8-tworzenie-nowego-selektora)

---

## 1. Przegląd Architektury

### Struktura 3-warstwowa

```
┌─────────────────────────────────────────┐
│  Warstwa Prezentacji                    │
│  (ContractSelector, ProjectSelector)    │
│  - Renderowanie UI                      │
│  - Formatowanie wyświetlanych danych    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Warstwa Logiki                         │
│  (MyAsyncTypeahead)                     │
│  - Fetch danych z API                   │
│  - WALIDACJA labelKey (ensureLabelKey)  │ ← WYKRYWA BRAKI BACKENDU
│  - Zarządzanie stanem (loading, etc.)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Warstwa Danych                         │
│  (RepositoryReact → Node.js/Express)    │
│  - Komunikacja z backend                │
│  - Cache (sessionStorage)               │
│  - ŹRÓDŁO PRAWDY dla computed fields    │ ← TUTAJ NAPRAWIAJ
└─────────────────────────────────────────┘
```

### Kluczowe Pliki

| Plik                          | Odpowiedzialność                                                   |
| ----------------------------- | ------------------------------------------------------------------ |
| `BussinesObjectSelectors.tsx` | Definicje konkretnych selektorów (Contract, Project, Person, etc.) |
| `GenericComponents.tsx`       | `MyAsyncTypeahead` - rdzeń logiki selektorów                       |
| `ToolsForms.ts`               | Helper functions: `ensureLabelKey`, `safeGetField`, logowanie      |
| `RepositoryReact.ts`          | Komunikacja z API, cache                                           |

---

## 2. Repository i SessionStorage

### ⚠️ Problem: Kolizje Nazw w SessionStorage

**Repository zapisuje dane do sessionStorage używając `name` jako klucza:**

```typescript
// RepositoryReact.ts
saveToSessionStorage() {
    sessionStorage.setItem(this.name, JSON.stringify(this));
}
```

**PUŁAPKA:** Jeśli dwa komponenty używają tego samego `name`, **nadpiszą swoje dane wzajemnie!**

#### ❌ Przykład Kolizji

```typescript
// ContractsController.ts - główne repository dla listy
export const contractsRepository = new RepositoryReact<Contract>({
    name: "contracts", // ← klucz w sessionStorage
    actionRoutes: { getRoute: "contracts", ... }
});

// GeneralModal.tsx - ładowanie szczegółów do edycji
async function loadDataObject() {
    // ❌ ZŁE: używa tego samego repository co lista
    const details = await repository.loadItemsFromServerPOST([{ id }]);
    // 💥 Nadpisuje repository.items = [tylko jeden obiekt]
    // 💥 Zapisuje do sessionStorage["contracts"] = [tylko jeden obiekt]
}
```

**Rezultat:**

-   Lista w `FilterableTable` miała 100 kontraktów
-   Po otwarciu modalu edycji ma **tylko 1** (ten edytowany)
-   SessionStorage został nadpisany
-   Po odświeżeniu strony lista ma tylko 1 element

---

### ✅ Rozwiązanie: Lokalne Repository z Unikalną Nazwą

#### Wzorzec dla Selektorów (MyAsyncTypeahead)

```typescript
export function ContractSelector({ name = "_contract", ... }) {
    // ✅ Lokalne repository z unikalną nazwą
    const localRepository = useMemo(
        () => new RepositoryReact<Contract>({
            actionRoutes: {
                getRoute: "contracts", // ← ten sam endpoint
                addNewRoute: "",
                editRoute: "",
                deleteRoute: "",
            },
            name: "contractSelector_temp", // ← UNIKALNA nazwa
        }),
        []
    );

    return (
        <MyAsyncTypeahead
            repository={localRepository}
            // ...
        />
    );
}
```

**Dlaczego działa:**

-   ✅ `getRoute: "contracts"` - pobiera z tego samego API
-   ✅ `name: "contractSelector_temp"` - zapisuje do **innego klucza** w sessionStorage
-   ✅ Główne `contractsRepository.items` pozostaje nietknięte
-   ✅ `skipCache: true` w `MyAsyncTypeahead` - nie zapisuje do sessionStorage (opcjonalne)

---

#### Wzorzec dla Modali (GeneralModal)

```typescript
// GeneralModal.tsx
async function loadDataObject() {
    // ✅ Tworzymy tymczasowe repository
    const tempRepository = new RepositoryReact<DataItemType>({
        name: `${repository.name}_modalDetails_temp`, // ← UNIKALNA nazwa
        actionRoutes: {
            getRoute: repository.actionRoutes.getRoute, // ← ten sam endpoint
            addNewRoute: "",
            editRoute: "",
            deleteRoute: "",
        },
    });

    // Pobierz szczegóły używając temp repository
    const details = await tempRepository.loadItemsFromServerPOST([{ id }]);

    // Zaktualizuj tylko jeden element w głównym repository
    repository.replaceItemById(details.id, details);
}
```

**Dlaczego działa:**

-   ✅ Temp repository ma nazwę `"contracts_modalDetails_temp"` - nie koliduje
-   ✅ Główne `contractsRepository.items` (100 elementów) pozostaje nietknięte
-   ✅ `replaceItemById` aktualizuje tylko jeden element w głównej liście
-   ✅ SessionStorage dla głównej listy nie jest nadpisywany

---

### 📋 Konwencje Nazewnictwa Repository

| Kontekst               | Nazwa Repository       | SessionStorage Key               | Przykład                              |
| ---------------------- | ---------------------- | -------------------------------- | ------------------------------------- |
| **Główne listy**       | `{resource}Repository` | `"{resource}"`                   | `contractsRepository` → `"contracts"` |
| **Selektory**          | Lokalne w `useMemo`    | `"{resource}Selector_temp"`      | `"contractSelector_temp"`             |
| **Modale (szczegóły)** | Tymczasowe             | `"{resource}_modalDetails_temp"` | `"contracts_modalDetails_temp"`       |
| **Widoki szczegółów**  | Lokalne                | `"{resource}Details_temp"`       | `"contractDetails_temp"`              |

**Zasada:** Każdy komponent, który **nie jest główną listą**, używa **lokalnego repository z sufiksem `_temp`**.

---

### 🔄 Kiedy Używać `skipCache: true`

`loadItemsFromServerPOST` ma parametr `skipCache`:

```typescript
await repository.loadItemsFromServerPOST(
    [params],
    specialRoute,
    { skipCache: true } // ← nie zapisuj do sessionStorage
);
```

**Używaj gdy:**

-   ✅ Repository jest tymczasowe (i tak ma unikalną nazwę)
-   ✅ Dane są jednorazowe (np. wyszukiwanie w selektorze)
-   ✅ Nie chcesz zaśmiecać sessionStorage

**NIE używaj gdy:**

-   ❌ To główne repository dla listy (cache jest potrzebny)
-   ❌ Chcesz zachować dane po odświeżeniu strony

**Uwaga:** Jeśli repository ma unikalną nazwę, `skipCache` jest **opcjonalny** (nie zaszkodzi, ale nie jest konieczny).

---

### 🛠️ TODO: Lekka Wersja Repository

**Propozycja:** Stworzyć `RepositoryReactLight` bez sessionStorage dla lokalnych komponentów:

```typescript
// Przyszła implementacja
class RepositoryReactLight<T> extends RepositoryReact<T> {
    saveToSessionStorage() {
        // ✅ Pusta implementacja - nie zapisuje do sessionStorage
    }

    loadFromSessionStorage() {
        // ✅ Pusta implementacja - nie czyta z sessionStorage
    }
}

// Użycie w selektorach
const localRepository = useMemo(
    () => new RepositoryReactLight<Contract>({
        actionRoutes: { getRoute: "contracts", ... },
        name: "contractSelector", // nazwa nieważna, bo nie używa sessionStorage
    }),
    []
);
```

**Korzyści:**

-   Lżejsza wersja dla komponentów lokalnych
-   Brak zaśmiecania sessionStorage
-   Wyraźna intencja w kodzie (light = lokalne, pełne = globalne)

---

## 3. Warstwa Walidacji Danych

### Dlaczego jest potrzebna?

Backend może zwrócić niepełne dane:

-   Brak pola `labelKey` → crash `react-bootstrap-typeahead`
-   Brak pól dodatkowych (alias, description) → undefined w UI

### Dwuetapowa walidacja

#### Etap 1: Walidacja labelKey (w `MyAsyncTypeahead`)

**Kiedy:** Zaraz po pobraniu danych z API, PRZED przekazaniem do `Typeahead`.

**Funkcja:** `ensureLabelKey` z `ToolsForms.ts`

```typescript
// GenericComponents.tsx - MyAsyncTypeahead.handleSearch()
repository.loadItemsFromServerPOST([params], ...)
    .then((items) => {
        // ✅ KROK 1: Walidacja labelKey dla każdego obiektu
        const validatedData = items.map((item: any) =>
            ensureLabelKey(item, labelKey, `MyAsyncTypeahead[${name}]`)
        );

        setOptions(validatedData); // ✅ Gwarantowana obecność labelKey
    });
```

**Co robi `ensureLabelKey`:**

1. Sprawdza czy obiekt ma pole `labelKey` i czy jest stringiem
2. Jeśli **NIE** → loguje ⚠️ ostrzeżenie z pełnym kontekstem
3. Jeśli **NIE** → **📧 wysyła email na serwer** (automatyczne zgłoszenie błędu backendu)
4. Jeśli **NIE** → tworzy pole z wartością `"[Brak danych]"`
5. Zwraca obiekt z zagwarantowanym `labelKey`

**Email zawiera:**

-   Nazwę selektora
-   Brakujące pole (`labelKey`)
-   Strukturę obiektu z backendu
-   URL strony gdzie wystąpił błąd
-   Timestamp

**Rezultat:** `react-bootstrap-typeahead` **nigdy** nie dostanie obiektu bez `labelKey`, a developer dostanie email z pełnym kontekstem problemu.

#### Etap 2: Walidacja pól dodatkowych (w `renderOption`)

**Kiedy:** Podczas renderowania opcji w dropdown.

**Funkcja:** `safeGetField` z `ToolsForms.ts`

```typescript
// BussinesObjectSelectors.tsx - ContractSelector
function renderOption(option: unknown) {
    const optionTyped = option as OurContract | OtherContract;

    // labelKey już zagwarantowane przez Etap 1
    // ✅ KROK 2: Bezpieczne pobieranie pól dodatkowych
    const mainLabel = safeGetField<string>(
        optionTyped,
        ["ourId", "number"], // Próbuj te pola po kolei
        "[Brak numeru]" // Fallback jeśli żadne nie istnieje
    );

    const subLabel = safeGetField<string>(optionTyped, ["alias", "name"], "[Brak nazwy]");

    return (
        <div>
            <span>{mainLabel}</span>
            <div className="text-muted small text-wrap">{subLabel}</div>
        </div>
    );
}
```

**Co robi `safeGetField`:**

1. Próbuje odczytać wartość z pierwszego pola (np. `ourId`)
2. Jeśli nie istnieje → próbuje drugiego (np. `number`)
3. Jeśli żadne nie istnieje → zwraca fallback
4. **NIE** loguje (logowanie tylko w `ensureLabelKey`)

---

## 4. Komponenty Selektorów

### Anatomia Selektora

```typescript
export function ContractSelector({
    name = "_contract", // Nazwa pola w formularzu
    multiple = false, // Single/multi select
    typesToInclude = "all", // Parametry filtrowania
    _project, // Kontekst filtrowania
    showValidationInfo = true,
    readOnly = false,
}: ContractSelectorProps) {
    // ✅ WZORZEC: Lokalne repository (hermetyzacja)
    const localRepository = useMemo(
        () =>
            new RepositoryReact<OurContract | OtherContract>({
                actionRoutes: {
                    getRoute: "contracts",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "contractSelector_temp",
            }),
        []
    );

    // ✅ WZORZEC: Bezpieczne renderowanie opcji
    function renderOption(option: unknown) {
        const optionTyped = option as OurContract | OtherContract;

        // labelKey (_ourIdOrNumber_Name) zagwarantowane przez MyAsyncTypeahead
        // Dodatkowe pola: użyj safeGetField
        const mainLabel = safeGetField<string>(optionTyped, ["ourId", "number"], "[Brak numeru]");

        const subLabel = safeGetField<string>(optionTyped, ["alias", "name"], "[Brak nazwy]");

        return (
            <div>
                <span>{mainLabel}</span>
                <div className="text-muted small text-wrap">{subLabel}</div>
            </div>
        );
    }

    return (
        <MyAsyncTypeahead
            name={name}
            labelKey="_ourIdOrNumber_Name" // ← Pole MUSI istnieć w danych z backend
            searchKey="searchText"
            contextSearchParams={{
                typesToInclude: typesToInclude,
                _project: _project,
            }}
            repository={localRepository}
            renderMenuItemChildren={renderOption}
            multiple={multiple}
            showValidationInfo={showValidationInfo}
            readOnly={readOnly}
        />
    );
}
```

### Kluczowe Właściwości

| Prop                     | Opis                                                        | Przykład                           |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------- |
| `name`                   | Nazwa pola w formularzu (React Hook Form)                   | `"_contract"`                      |
| `labelKey`               | **KRYTYCZNE**: Pole używane przez Typeahead do wyświetlania | `"ourId"`, `"_ourIdOrNumber_Name"` |
| `searchKey`              | Pole używane do wyszukiwania po stronie serwera             | `"searchText"`                     |
| `contextSearchParams`    | Dodatkowe parametry filtrowania dla API                     | `{ _project: project }`            |
| `repository`             | Źródło danych                                               | `RepositoryReact`                  |
| `renderMenuItemChildren` | Funkcja renderująca opcje w dropdown                        | `renderOption`                     |
| `multiple`               | Single vs multi select                                      | `false` / `true`                   |

---

## 5. Helper Functions (ToolsForms)

### `ensureLabelKey<T>`

**Przeznaczenie:** Gwarantuje obecność pola `labelKey` w obiekcie.

**Kiedy używać:** W `MyAsyncTypeahead.handleSearch()` po pobraniu danych z API.

**Sygnatura:**

```typescript
function ensureLabelKey<T extends Record<string, any>>(
    item: T, // Obiekt do walidacji
    labelKey: string, // Nazwa wymaganego pola
    selectorName: string // Nazwa selektora (do logowania)
): T;
```

**Zachowanie:**

```typescript
// Dane z API
const apiData = { id: 123, name: "Test" }; // ❌ Brak 'ourId'

// Po ensureLabelKey
const validated = ensureLabelKey(apiData, "ourId", "ProjectSelector");
// ✅ Result: { id: 123, name: "Test", ourId: "[Brak danych]" }

// W konsoli:
// ⚠️ [ProjectSelector] Brak wymaganego pola "ourId". Struktura obiektu:
// { receivedKeys: ['id', 'name'], object: {...} }
```

**Poziomy logowania:**

-   `error` - obiekt jest null/undefined
-   `warn` - brak pola labelKey, użyto fallback

---

### `safeGetField<T>`

**Przeznaczenie:** Bezpieczne odczytywanie pól z możliwością fallback.

**Kiedy używać:** W funkcjach `renderOption` dla pól dodatkowych (nie labelKey).

**Sygnatura:**

```typescript
function safeGetField<T>(
    obj: any, // Obiekt źródłowy
    fields: string[], // Tablica możliwych nazw pól (próbuje po kolei)
    fallback: T, // Wartość jeśli żadne pole nie istnieje
    selectorName?: string // Opcjonalnie: nazwa selektora (debug logging)
): T;
```

**Przykłady:**

```typescript
// 1. Proste pole
const alias = safeGetField<string>(contract, ["alias"], "[Brak aliasu]");

// 2. Alternatywne pola (pierwszeństwo: ourId > number)
const contractNumber = safeGetField<string>(contract, ["ourId", "number"], "[Brak numeru]");

// 3. Zagnieżdżone obiekty (sprawdza czy cały path istnieje)
const cityName = safeGetField<string>(
    offer,
    ["_city", "name"], // ⚠️ To NIE działa dla zagnieżdżeń
    "[Brak miasta]"
);
// ⚠️ Dla zagnieżdżeń użyj:
const cityName = offer?._city?.name ?? "[Brak miasta]";
// LUB:
const cityName = safeGetField<string>(offer._city, ["name"], "[Brak miasta]");
```

**Uwaga:** `safeGetField` sprawdza tylko **bezpośrednie** właściwości obiektu, NIE zagnieżdżone ścieżki.

---

### Konfiguracja Logowania

W `ToolsForms.ts`:

```typescript
const LOG_CONFIG = {
    enabled: true, // false w production
    minLevel: "warn", // 'error' | 'warn' | 'info' | 'debug'
};
```

**Poziomy:**

-   `error` - krytyczne błędy (null zamiast obiektu)
-   `warn` - ostrzeżenia (brak pola, użyto fallback) ← **domyślne**
-   `info` - informacje ogólne
-   `debug` - szczegółowe debugowanie (każde wywołanie `safeGetField`)

**W production:** `enabled: false` lub `minLevel: 'error'`

---

## 6. Przepływ Danych

### Szczegółowy Flow

```
1. USER pisze tekst w polu
   ↓
2. MyAsyncTypeahead.handleSearch("test")
   ↓
3. repository.loadItemsFromServerPOST({ searchText: "test", ...contextParams })
   ↓
4. BACKEND (Node.js/Express) zwraca: [
     { id: 1, ourId: "ABC", alias: "Test Contract" },  ← ❌ Brak _ourIdOrNumber_Name
     { id: 2, ourId: "2024/001", alias: "Project X", _ourIdOrNumber_Name: "2024/001 - Project X" }  ← ✅
   ]
   ↓
5. ensureLabelKey() waliduje każdy obiekt:
   - Obiekt 1: ⚠️ WARNING → dodaje { ..., _ourIdOrNumber_Name: "[Brak danych]" }
   - Obiekt 2: ✅ OK → przepuszcza bez zmian
   ↓
6. setOptions([...zwalidowane obiekty])
   ↓
7. Typeahead renderuje dropdown (używa labelKey do wyświetlania)
```

### 🔧 Naprawianie Błędów Backendu

**Kiedy widzisz warning w konsoli:**

```
⚠️ [_contract] Brak wymaganego pola "_ourIdOrNumber_Name" lub nie jest stringiem
   receivedKeys: ["id", "ourId", "alias", "name", "createdAt"]
   object: { id: 123, ourId: "ABC", alias: "Kontrakt XYZ", ... }
```

**Kroki naprawy (Backend Node.js/Express):**

1. **Zlokalizuj endpoint** (np. `GET /contracts` lub `POST /contracts/search`)
2. **Dodaj computed field** w kontrolerze lub modelu:

```javascript
// ❌ PRZED - backend zwraca niepełne dane
router.get("/contracts", async (req, res) => {
    const contracts = await Contract.find(req.query);
    res.json(contracts); // Brak _ourIdOrNumber_Name
});

// ✅ PO - backend dodaje wymagane pole
router.get("/contracts", async (req, res) => {
    const contracts = await Contract.find(req.query);

    // Dodaj computed field dla każdego kontraktu
    contracts.forEach((contract) => {
        const id = contract.ourId || contract.number || "[Brak ID]";
        const name = contract.alias || contract.name || "[Brak nazwy]";
        contract._ourIdOrNumber_Name = `${id} - ${name}`;
    });

    res.json(contracts);
});
```

**Lub w modelu Mongoose:**

```javascript
// Model: src/models/Contract.js
contractSchema.virtual("_ourIdOrNumber_Name").get(function () {
    const id = this.ourId || this.number || "[Brak ID]";
    const name = this.alias || this.name || "[Brak nazwy]";
    return `${id} - ${name}`;
});

// W konfiguracji schematu:
contractSchema.set("toJSON", { virtuals: true });
contractSchema.set("toObject", { virtuals: true });
```

3. **Przetestuj**: Odśwież frontend (Ctrl+F5) → warning powinien zniknąć

**Dlaczego NIE na frontendzie?**

-   ❌ Workaround komplikuje kod
-   ❌ Duplikacja logiki biznesowej (backend też używa tego pola)
-   ❌ Trudniejsze utrzymanie (2 miejsca do aktualizacji)
-   ✅ Backend = single source of truth dla computed fields

---

↓ 5. ✅ WALIDACJA (ensureLabelKey):
[
{ id: 1, name: "Test Contract", alias: "TC", \_ourIdOrNumber_Name: "[Brak danych]" }, ← ✅ Dodano
{ id: 2, \_ourIdOrNumber_Name: "2024/001", ourId: "2024/001", alias: "Project X" }
]
↓ 6. setOptions(validatedData)
↓ 7. react-bootstrap-typeahead renderuje dropdown
↓ 8. Dla każdej opcji wywołuje renderMenuItemChildren (renderOption)
↓ 9. renderOption używa safeGetField dla pól dodatkowych
↓ 10. USER widzi: - "[Brak danych]" lub prawidłową wartość - "TC" lub "[Brak nazwy]"

```

### Obsługa Błędów

```

BŁĄD w repository.loadItemsFromServerPOST
↓
catch (error)
↓
setIsLoading(false)
↓
console.error(`❌ MyAsyncTypeahead [${name}] - Błąd wyszukiwania:`, error)
↓
setOptions([]) ← Pusty dropdown, NIE crash

````

---

## 7. Wzorce i Best Practices

### ✅ DO

```typescript
// 1. Zawsze używaj useMemo dla lokalnego repository z UNIKALNĄ nazwą
const localRepository = useMemo(
    () => new RepositoryReact<DataType>({
        actionRoutes: { getRoute: "myResource", ... },
        name: "myResourceSelector_temp", // ← UNIKALNA nazwa (_temp suffix)
    }),
    [] // Pusta deps array - tworzone raz
);

// 2. Używaj safeGetField dla pól opcjonalnych
const alias = safeGetField<string>(item, ["alias"], "[Brak aliasu]");

// 3. Nie loguj w renderOption (logowanie w ensureLabelKey)
function renderOption(option: unknown) {
    // ❌ NIE: console.log, console.warn
    const label = safeGetField<string>(option, ["name"], "");
    return <div>{label}</div>;
}

// 4. labelKey MUSI odpowiadać polu z backend
<MyAsyncTypeahead
    labelKey="ourId"  // ✅ Backend zwraca { ourId: "..." }
    // ❌ NIE: labelKey="displayName" jeśli backend nie ma tego pola
/>

// 5. Używaj TypeScript types dla option
function renderOption(option: unknown) {
    const typed = option as ContractData;  // ✅
    // ❌ NIE: const typed = option as any;
}
````

### ❌ DON'T

```typescript
// 1. NIE używaj try-catch w renderOption (już nie potrzebne)
function renderOption(option: unknown) {
    try {  // ❌
        return <div>{option.name}</div>;
    } catch (error) {
        return <div>Error</div>;
    }
}

// 2. NIE przekazuj repository przez props (używaj lokalnego)
// ❌ STARE:
export function ContractSelector({ repository }: Props) {
    return <MyAsyncTypeahead repository={repository} />;
}

// ✅ NOWE:
export function ContractSelector(props: Props) {
    const localRepository = useMemo(() => new RepositoryReact(...), []);
    return <MyAsyncTypeahead repository={localRepository} />;
}

// 3. NIE używaj tej samej nazwy repository co główna lista
// ❌ ZŁE - koliduje z contractsRepository:
const repo = new RepositoryReact({
    name: "contracts", // ← nadpisze sessionStorage głównej listy!
    actionRoutes: { getRoute: "contracts", ... }
});

// ✅ DOBRE - unikalna nazwa:
const repo = useMemo(() => new RepositoryReact({
    name: "contractSelector_temp", // ← własny klucz w sessionStorage
    actionRoutes: { getRoute: "contracts", ... }
}), []);

// 4. NIE zakładaj że pole zawsze istnieje
const name = option.name;  // ❌ Może być undefined
const name = safeGetField(option, ["name"], "[Brak]");  // ✅

// 5. NIE używaj safeGetField dla labelKey w renderOption
// labelKey jest już zagwarantowane przez MyAsyncTypeahead
function renderOption(option: unknown) {
    const typed = option as ProjectData;
    // ❌ NIE potrzebne:
    const ourId = safeGetField(typed, ["ourId"], "");

    // ✅ Bezpośrednio:
    return <div>{typed.ourId}</div>;
}
```

---

## 8. Tworzenie Nowego Selektora

### 🤖 Checklist dla AI

Gdy tworzysz lub modyfikujesz selektor:

**1. Sprawdź Backend Contract** ✅

-   [ ] Czy backend zwraca pole `labelKey`? (sprawdź w Network tab lub Postman)
-   [ ] Czy pole jest **stringiem** (nie obiektem, nie liczbą)?
-   [ ] Jeśli NIE → **Nie kompensuj na frontendzie** → Zgłoś do naprawy backendu

**2. Walidacja** ✅

-   [ ] `ensureLabelKey` wywoływany w `MyAsyncTypeahead.handleSearch()`
-   [ ] `ensureLabelKey` wywoływany w `getValidatedSelected()` (dla pre-filled values)
-   [ ] `safeGetField` używany tylko dla pól **opcjonalnych** w `renderOption`

**3. Logi** ✅

-   [ ] Jeśli backend zwraca niepełne dane → **warning pojawi się automatycznie**
-   [ ] Log zawiera: `receivedKeys`, `object`, wskazuje co naprawić
-   [ ] **NIGDY nie suppress-uj warningów** - to wskazówki dla developerów

**4. Dokumentacja** ✅

-   [ ] Jeśli backend wymaga naprawy → podaj **konkretny przykład kodu Node.js**
-   [ ] Wyjaśnij **dlaczego** backend, nie frontend

---

### Szablon Nowego Selektora

```typescript
import { safeGetField } from "../../../React/Tools/ToolsForms";
import { MyAsyncTypeahead } from "./GenericComponents";

export type MyObjectSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    readOnly?: boolean;
    // Dodatkowe props specyficzne dla tego selektora
};

export function MyObjectSelector({
    name = "_myObject",
    showValidationInfo = true,
    multiple = false,
    readOnly = false,
}: MyObjectSelectorProps) {
    // 1. Lokalne repository (jeśli potrzebne)
    const localRepository = useMemo(
        () =>
            new RepositoryReact<MyObjectData>({
                actionRoutes: {
                    getRoute: "my-objects", // ← Route do API
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "myObjectSelector_temp",
            }),
        []
    );

    // 2. Funkcja renderująca opcje
    function renderOption(option: unknown) {
        const optionTyped = option as MyObjectData;

        // labelKey jest zagwarantowane przez MyAsyncTypeahead
        // Użyj safeGetField dla pól dodatkowych
        const description = safeGetField<string>(optionTyped, ["description", "desc"], "[Brak opisu]");

        const status = safeGetField<string>(optionTyped, ["status"], "");

        return (
            <div>
                <span>{optionTyped.name}</span> {/* labelKey */}
                <div className="text-muted small text-wrap">
                    {description} | {status}
                </div>
            </div>
        );
    }

    // 3. Return MyAsyncTypeahead
    return (
        <>
            <MyAsyncTypeahead
                name={name}
                labelKey="name" // ← KRYTYCZNE: musi istnieć w danych z API
                searchKey="searchText" // Pole używane do wyszukiwania
                repository={localRepository}
                renderMenuItemChildren={renderOption}
                multiple={multiple}
                showValidationInfo={showValidationInfo}
                readOnly={readOnly}
            />
        </>
    );
}
```

### Checklist

-   [ ] Określ `labelKey` - pole MUSI istnieć w danych z backend
-   [ ] Użyj `useMemo` dla lokalnego repository
-   [ ] W `renderOption`: użyj `safeGetField` dla pól opcjonalnych
-   [ ] NIE używaj try-catch w `renderOption`
-   [ ] NIE loguj w `renderOption` (logowanie w `ensureLabelKey`)
-   [ ] Dodaj TypeScript type dla props
-   [ ] Przetestuj z danymi gdzie brakuje pól opcjonalnych

---

## Podsumowanie dla AI

**Gdy tworzysz/edytujesz selektor:**

1. **MyAsyncTypeahead** już zabezpiecza `labelKey` przez `ensureLabelKey` → NIE potrzeba try-catch
2. **W renderOption**: używaj `safeGetField` tylko dla pól **dodatkowych** (nie labelKey)
3. **Nie loguj** w renderOption - logowanie jest centralne w `ensureLabelKey`
4. **Lokalne repository** w `useMemo` - hermetyzacja i izolacja
5. **labelKey prop** musi odpowiadać polu z backendu - to jest jedyne miejsce gdzie może być błąd konfiguracji

**Jeśli widzisz błąd:**

-   "Cannot read property 'X' of undefined" w renderOption → użyj `safeGetField`
-   "Typeahead crash" → sprawdź czy backend zwraca pole `labelKey`
-   Nadmiar logów → wyłącz debug w `ToolsForms.LOG_CONFIG`
