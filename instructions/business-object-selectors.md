# Business Object Selectors - Wytyczne

> 📚 **Dokumentacja modułowa:**
>
> -   **Ten plik** - Praktyczny przewodnik użycia (wzorce, debugging, FAQ)
> -   **[selectors-architecture.md](./selectors-architecture.md)** - Szczegółowa architektura i zasady działania dla developerów i AI

## Rola i Zastosowanie

**Business Object Selectors** to zestaw komponentów React służących do wyboru obiektów biznesowych w formularzach (kontrakty, projekty, osoby, miasta, itp.). Są używane głównie w oknach modalnych do tworzenia relacji między obiektami.

### Główne cechy:

-   **Asynchroniczne wyszukiwanie** - dane są ładowane z serwera w odpowiedzi na wpisywanie tekstu
-   **Hermetyzacja** - każdy selektor zarządza własnym stanem i źródłem danych
-   **Reużywalność** - mogą być używane w wielu miejscach bez konfliktów
-   **Integracja z React Hook Form** - pełna walidacja i zarządzanie stanem formularza
-   **Walidacja danych** - automatyczne sprawdzanie poprawności struktur obiektów (dwuetapowa walidacja)

### Dla Developerów

**Chcesz zrozumieć architekturę?** → Przeczytaj [selectors-architecture.md](./selectors-architecture.md)

**Chcesz szybko użyć?** → Czytaj dalej ten dokument

## Obsługa Błędów i Debugging

### Typowe problemy

#### 1. Brak wymaganych pól w obiektach z serwera

**Problem:** Serwer zwraca obiekty bez wymaganych pól (np. `labelKey`, `ourId`, `alias`), co powoduje crash komponentu Typeahead.

**Rozwiązanie:**

-   `MyAsyncTypeahead` sprawdza czy obiekty mają pole `labelKey` przed przekazaniem do Typeahead
-   Funkcje `renderOption` używają bezpiecznego odczytywania pól z fallback wartościami
-   Szczegółowe komunikaty błędów w konsoli identyfikują źródło problemu

**Komunikaty błędów:**

```
❌ MyAsyncTypeahead [_contract]: Obiekt zwrócony z serwera nie ma wymaganego pola '_ourIdOrNumber_Name'.
Otrzymany obiekt: { ... }
Repository: contractSelector_temp
Route: contracts
```

**Co sprawdzić:**

1. Czy backend zwraca właściwą strukturę danych
2. Czy `labelKey` w selektorze odpowiada polu w obiekcie z serwera
3. Czy pole `labelKey` istnieje we wszystkich zwróconych obiektach

#### 2. Błędy w funkcji renderOption

**Problem:** Funkcja `renderMenuItemChildren` próbuje odczytać nieistniejące pola.

**Rozwiązanie:** Używaj try-catch i bezpiecznego odczytywania:

```typescript
function renderOption(option: unknown) {
    const optionTyped = option as MyType;

    try {
        const mainLabel = optionTyped.field1 || optionTyped.field2 || "[Brak wartości]";
        const subLabel = optionTyped.description || "[Brak opisu]";

        return (
            <div>
                <span>{mainLabel}</span>
                <div className="text-muted small text-wrap">{subLabel}</div>
            </div>
        );
    } catch (error) {
        console.error("❌ Selector renderOption error:", error, "Option:", optionTyped);
        return <div>[Błąd renderowania]</div>;
    }
}
```

### Debugowanie w konsoli deweloperskiej

Komponenty logują szczegółowe informacje:

-   ⚠️ **Ostrzeżenia** - brakujące pola ale komponent działa
-   ❌ **Błędy** - krytyczne problemy z danymi lub konfiguracją

**Przykład ostrzeżenia:**

```
⚠️ ContractSelector: Obiekt nie ma pola ourId ani number: { id: 123, ... }
```

### Helper Functions w ToolsForms

Wszystkie funkcje pomocnicze dla selektorów znajdują się w `src/React/Tools/ToolsForms.ts`:

#### `safeGetField` - Bezpieczne odczytywanie pól

Do bezpiecznego odczytywania pól z obiektów używaj `safeGetField`:

```typescript
import { safeGetField } from "../../../React/Tools/ToolsForms";

/**
 * Bezpieczne odczytywanie wartości z obiektu z fallback.
 * Używaj w funkcjach renderOption dla pól dodatkowych (nie labelKey).
 */
function renderOption(option: unknown) {
    const optionTyped = option as MyType;

    // Próbuje kolejno 'ourId', potem 'number', jeśli żadne nie istnieje używa '[Brak numeru]'
    const mainLabel = safeGetField<string>(
        optionTyped,
        ["ourId", "number"],
        "[Brak numeru]"
        // selectorName jest opcjonalny - użyj dla debug logging
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

#### `ensureLabelKey` - Walidacja wymaganego pola

Funkcja używana w `MyAsyncTypeahead` do zapewnienia że obiekty z API mają wymagane pole:

```typescript
import { ensureLabelKey } from "../../../React/Tools/ToolsForms";

// W MyAsyncTypeahead po pobraniu danych z serwera:
const validatedData = data.map((item) => ensureLabelKey(item, labelKey, `MyAsyncTypeahead[${name}]`));
```

#### Konfiguracja Logowania

W `ToolsForms.ts` możesz kontrolować poziom logowania:

```typescript
const LOG_CONFIG = {
    enabled: true, // Wyłącz w production
    minLevel: "warn", // 'error' | 'warn' | 'info' | 'debug'
};
```

**Poziomy logowania:**

-   `error` - krytyczne błędy (np. null zamiast obiektu)
-   `warn` - ostrzeżenia (np. brak wymaganego pola, użyto fallback)
-   `info` - informacje ogólne
-   `debug` - szczegółowe informacje debugowania

## Wzorzec Projektowy: Samodzielny Selektor

### Problem

Starsze implementacje selektorów wymagały przekazywania instancji `RepositoryReact` przez props:

```typescript
// ❌ STARE PODEJŚCIE - wymaga prop drilling
export function ContractSelector({ repository, ...props }: Props) {
    return <MyAsyncTypeahead repository={repository} />;
}

// Użycie - rodzic musi znać szczegóły implementacji
<ContractSelector repository={contractsRepository} />;
```

**Problemy:**

1. **Prop Drilling** - repository musi być przekazywane przez wiele poziomów
2. **Zależność od kontekstu** - komponent nadrzędny musi wiedzieć, które repo utworzyć
3. **Konflikty stanu** - ryzyko kolizji gdy to samo repo jest używane w wielu miejscach
4. **Brak hermetyzacji** - szczegóły implementacji "wyciekają" na zewnątrz

### Rozwiązanie

**Wzorzec Samodzielnego Selektora** - komponent sam zarządza swoim lokalnym repository:

```typescript
// ✅ NOWE PODEJŚCIE - lokalne repository
export function ContractSelector({
    name = "_contract",
    typesToInclude = "all",
    _project,
    ...otherProps
}: ContractSelectorProps) {
    // Lokalna instancja repository - memoizowana
    const localRepository = useMemo(
        () =>
            new RepositoryReact<OurContract | OtherContract>({
                actionRoutes: {
                    getRoute: "contracts",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "contractSelector_temp", // ⚠️ Unikalna nazwa!
            }),
        []
    );

    return (
        <MyAsyncTypeahead
            name={name}
            repository={localRepository}
            contextSearchParams={{ typesToInclude, _project }}
            {...otherProps}
        />
    );
}

// Użycie - prosty i czytelny interfejs
<ContractSelector typesToInclude="our" _project={project} />;
```

## Implementacja Wzorca

### Krok 1: Definicja Props

```typescript
export type ContractSelectorProps = {
    name?: string;
    showValidationInfo?: boolean;
    multiple?: boolean;
    typesToInclude?: "our" | "other" | "all";
    _project?: ProjectData;
    readOnly?: boolean;
    // ❌ NIE MA prop 'repository'
};
```

### Krok 2: Utworzenie Lokalnego Repository

```typescript
const localRepository = useMemo(
    () =>
        new RepositoryReact<DataType>({
            actionRoutes: {
                getRoute: "api/endpoint", // ✅ Endpoint dla tego typu danych
                addNewRoute: "", // Puste - selector nie dodaje danych
                editRoute: "",
                deleteRoute: "",
            },
            name: "uniqueSelectorName_temp", // ⚠️ WAŻNE: Unikalna nazwa!
        }),
    [] // Pusta tablica - instancja tworzona TYLKO RAZ
);
```

**Kluczowe elementy:**

-   **`useMemo` z `[]`** - zapewnia utworzenie instancji tylko raz w cyklu życia komponentu
-   **Unikalna nazwa** - zapobiega konfliktom z innymi repozytoriami
-   **Sufiks `_temp`** - konwencja nazewnicza dla repozytoriów tymczasowych

### Krok 3: Przekazanie do MyAsyncTypeahead

```typescript
return (
    <MyAsyncTypeahead
        name={name}
        labelKey="_ourIdOrNumber_Name"
        searchKey="searchText"
        repository={localRepository} // ✅ Lokalne repo
        contextSearchParams={{
            // Parametry filtrowania
            typesToInclude,
            _project,
        }}
        renderMenuItemChildren={renderOption}
        {...otherProps}
    />
);
```

## Zalety Wzorca

### 1. Hermetyzacja (Encapsulation)

**Przed:**

```typescript
// ❌ Rodzic musi znać szczegóły
import { contractsRepository } from "./ContractsController";

<ContractSelector repository={contractsRepository} />;
```

**Po:**

```typescript
// ✅ Prosty interfejs bez szczegółów implementacji
<ContractSelector typesToInclude="our" _project={project} />
```

### 2. Eliminacja Prop Drilling

**Przed:**

```typescript
// ❌ Repository przekazywane przez wiele poziomów
<ModalBody>
    <FormSection>
        <ContractSelector repository={contractsRepository} />
    </FormSection>
</ModalBody>
```

**Po:**

```typescript
// ✅ Żadnego przekazywania repository
<ModalBody>
    <FormSection>
        <ContractSelector />
    </FormSection>
</ModalBody>
```

### 3. Izolacja Stanu

Każdy selektor ma własne, izolowane dane:

```typescript
// ✅ Dwa selektory, różne filtry, ZERO konfliktów
<ContractSelector
    name="_mainContract"
    typesToInclude="our"
    _project={project1}
/>

<ContractSelector
    name="_relatedContract"
    typesToInclude="all"
    _project={project2}
/>
```

### 4. Brak Konfliktów z FilterableTable

**Problem (stare podejście):**

```typescript
// ❌ Główna lista używa contractsRepository
<FilterableTable repository={contractsRepository} />

// ❌ Selektor w modalu NADPISUJE contractsRepository.items
<ContractSelector repository={contractsRepository} />
// ☠️ FilterableTable traci dane!
```

**Rozwiązanie (nowe podejście):**

```typescript
// ✅ Główna lista używa globalnego repo
<FilterableTable repository={contractsRepository} />

// ✅ Selektor używa WŁASNEGO, lokalnego repo
<ContractSelector />
// ✅ Brak konfliktu - każdy ma swoje dane!
```

## Kiedy Stosować Wzorzec?

### ✅ TAK - Utwórz lokalne repository gdy:

-   Komponent jest używany w **modalach/dialogach**
-   Komponent ładuje **podzbiór danych** (filtrowanie po parametrach)
-   Komponent jest **pomocniczy** (selector, lookup, autocomplete)
-   Dane są potrzebne tylko **tymczasowo** (do wyboru opcji)
-   Komponent może być używany **wielokrotnie** na tej samej stronie

### ❌ NIE - Użyj globalnego repository gdy:

-   Komponent jest **głównym widokiem listy** (`FilterableTable`)
-   Dane są **współdzielone** między wieloma komponentami na tym samym poziomie
-   Repository **zarządza stanem** całej sekcji aplikacji
-   Potrzebujesz **cache'owania** danych między różnymi częściami UI

## Przykłady Implementacji

### 1. ContractSelector

```typescript
/**
 * Komponent formularza wyboru kontraktu z wyszukiwaniem asynchronicznym
 * Używa lokalnego repository aby nie kolidować z innymi komponentami
 */
export function ContractSelector({
    name = "_contract",
    showValidationInfo = true,
    multiple = false,
    typesToInclude = "all",
    _project,
    readOnly = false,
}: ContractSelectorProps) {
    // ✅ Lokalna instancja repository tylko dla tego selectora
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

    function renderOption(option: unknown) {
        const optionTyped = option as OurContract | OtherContract;
        const mainLabel = "ourId" in optionTyped ? optionTyped.ourId : optionTyped.number;
        return (
            <div>
                <span>{mainLabel}</span>
                <div className="text-muted small text-wrap">{optionTyped.alias || optionTyped.name}</div>
            </div>
        );
    }

    return (
        <MyAsyncTypeahead
            name={name}
            labelKey="_ourIdOrNumber_Name"
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

### 2. PersonSelector

```typescript
/**
 * Komponent formularza wyboru osoby z wyszukiwaniem asynchronicznym
 * Używa lokalnego repository aby nie kolidować z innymi komponentami
 */
export function PersonSelector({
    name = "_person",
    showValidationInfo = true,
    multiple = false,
    allowNew = false,
}: PersonSelectorProps) {
    // ✅ Lokalna instancja repository tylko dla tego selectora
    const localRepository = useMemo(
        () =>
            new RepositoryReact<PersonData>({
                actionRoutes: {
                    getRoute: "persons",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "personSelector_temp",
            }),
        []
    );

    function renderOption(option: any) {
        const typedOption = option as PersonData;
        return (
            <>
                <div>{typedOption._nameSurnameEmail}</div>
                <div className="text-muted small text-wrap">{typedOption._entity.name}</div>
            </>
        );
    }

    return (
        <MyAsyncTypeahead
            name={name}
            labelKey="_nameSurnameEmail"
            searchKey="searchText"
            repository={localRepository}
            renderMenuItemChildren={renderOption}
            multiple={multiple}
            allowNew={allowNew}
            showValidationInfo={showValidationInfo}
        />
    );
}
```

### 3. LetterSelector (z useEffect)

Gdy potrzebujesz załadować dane przy montowaniu komponentu:

```typescript
export function LetterSelector({ name, label, _contract, showValidationInfo = true }: LetterSelectorProps) {
    const [options, setOptions] = useState<LetterData[]>([]);

    // ✅ Lokalna instancja repository
    const localRepository = useMemo(
        () =>
            new RepositoryReact<OurLetterContract | IncomingLetterContract>({
                actionRoutes: {
                    getRoute: "contractsLetters",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "letterSelector_temp",
            }),
        []
    );

    // Ładowanie danych przy zmianie kontraktu
    useEffect(() => {
        const fetchData = async () => {
            if (_contract?.id) {
                await localRepository.loadItemsFromServerPOST([{ contractId: _contract.id }]);
                setOptions(localRepository.items);
            } else {
                setOptions([]);
            }
        };
        fetchData();
    }, [_contract, localRepository]);

    return <Typeahead options={options} labelKey="number" placeholder="-- Wybierz pismo z listy --" {...otherProps} />;
}
```

## Checklist Implementacji

Przed utworzeniem lub refaktoryzacją selektora, upewnij się że:

-   [ ] Props **NIE zawierają** `repository`
-   [ ] Lokalne repository utworzone z **`useMemo(() => new RepositoryReact(...), [])`**
-   [ ] Nazwa repository jest **unikalna** i kończy się `_temp`
-   [ ] Endpoint (`getRoute`) jest **poprawny** dla tego typu danych
-   [ ] `addNewRoute`, `editRoute`, `deleteRoute` są **puste** (selector nie modyfikuje danych)
-   [ ] `labelKey` wskazuje na **istniejące pole** w obiektach z API
-   [ ] `searchKey` odpowiada **parametrowi wyszukiwania** w API
-   [ ] `renderMenuItemChildren` wyświetla **czytelną reprezentację** obiektu
-   [ ] `contextSearchParams` przekazuje **filtry** (jeśli potrzebne)
-   [ ] Komponent ma **JSDoc komentarz** opisujący jego rolę

## Migracja Starych Selektorów

### Krok 1: Zidentyfikuj selektory do migracji

Szukaj wzorców:

```typescript
// ❌ Do migracji
export type XYZSelectorProps = {
    repository: RepositoryReact; // ← Obecność tego prop
    // ...
};
```

### Krok 2: Usuń prop `repository`

```diff
export type ContractSelectorProps = {
    name?: string;
-   repository: RepositoryReact;
    typesToInclude?: "our" | "other" | "all";
};
```

### Krok 3: Dodaj lokalne repository

```typescript
export function ContractSelector(props: ContractSelectorProps) {
+   const localRepository = useMemo(
+       () => new RepositoryReact({
+           actionRoutes: { getRoute: "contracts", ... },
+           name: "contractSelector_temp",
+       }),
+       []
+   );

    return (
        <MyAsyncTypeahead
-           repository={repository}
+           repository={localRepository}
            {...props}
        />
    );
}
```

### Krok 4: Zaktualizuj użycia

Usuń przekazywanie repository w miejscach użycia:

```diff
- <ContractSelector repository={contractsRepository} />
+ <ContractSelector />
```

### Krok 5: Usuń nieużywane importy

```diff
- import { contractsRepository } from './ContractsController';

function MyModal() {
    return <ContractSelector />;
}
```

## Testowanie

Po implementacji/migracji selektora, przetestuj:

1. **Podstawowe działanie:**

    - [ ] Wpisywanie tekstu wywołuje zapytanie do API
    - [ ] Wyniki są poprawnie wyświetlane
    - [ ] Wybór opcji ustawia wartość w formularzu

2. **Izolacja:**

    - [ ] Otwarcie modala z selektorem NIE wpływa na główną listę
    - [ ] Zamknięcie modala NIE wpływa na dane głównej listy
    - [ ] Wiele selektorów na stronie działa niezależnie

3. **Integracja z formularzem:**

    - [ ] Walidacja działa poprawnie
    - [ ] Wartość jest przekazywana przy submit
    - [ ] Reset formularza czyści selektor

4. **Edge cases:**
    - [ ] Selektor działa bez filtrów kontekstowych
    - [ ] Selektor działa gdy filtry są `undefined`
    - [ ] Puste wyniki nie powodują błędów

## Dokumentacja w Kodzie

Każdy selektor powinien mieć komentarz JSDoc:

````typescript
/**
 * Komponent formularza wyboru kontraktu z wyszukiwaniem asynchronicznym.
 *
 * Komponent jest w pełni samodzielny i nie wymaga przekazywania repozytorium z zewnątrz.
 * Używa własnej, lokalnej instancji `RepositoryReact` do pobierania danych, co zapewnia
 * izolację i upraszcza jego użycie w formularzach, zwłaszcza w oknach modalnych.
 *
 * Zapytania są wykonywane asynchronicznie w odpowiedzi na wpisywanie tekstu przez użytkownika.
 *
 * @param name - Nazwa pola w formularzu (domyślnie "_contract")
 * @param typesToInclude - Rodzaj kontraktów: "our" | "other" | "all"
 * @param _project - Projekt do filtrowania kontraktów (opcjonalnie)
 * @param multiple - Czy można wybrać wiele kontraktów
 * @param showValidationInfo - Czy pokazywać komunikaty walidacji
 * @param readOnly - Czy pole jest tylko do odczytu
 *
 * @example
 * ```tsx
 * <ContractSelector
 *     name="_contract"
 *     typesToInclude="our"
 *     _project={selectedProject}
 * />
 * ```
 */
export function ContractSelector({ ... }: ContractSelectorProps) { ... }
````

## Wzorzec: Pick-or-Create (inline tworzenie w panelu bocznym)

Selektor zwykle tylko **wybiera** istniejące obiekty. Czasem brakującego obiektu nie
da się dodać bez opuszczenia formularza (np. Sprawa, której CRUD żyje tylko w
`TasksGlobal`). Wzorzec **pick-or-create** pozwala stworzyć obiekt **w miejscu**, w
panelu bocznym (Offcanvas), bez zamykania nadrzędnego modala, i auto-zaznaczyć go w
selektorze. Pierwsza implementacja: tworzenie Sprawy z formularza pisma (PR1).

### Elementy wzorca

| Element | Plik | Rola |
| --- | --- | --- |
| `InlineCreateDrawer<T>` (generyczny) | `src/View/Modals/InlineCreateDrawer.tsx` | Panel `Offcanvas` (`placement="end"`, `backdrop={false}`, 420px, `zIndex 1060`) z własnym `FormProvider` + Zapisz/Anuluj. Lustro ścieżki dodawania z `GeneralModal`. |
| `+ Nowa sprawa` w selektorze | `CaseSelectMenuElement` (`BussinesObjectSelectors.tsx`) | Opcjonalny prop `onRequestCreate?: () => void`. Gdy podany — przycisk obok Typeahead; gdy pominięty — render IDENTYCZNY jak dotychczas (żadne istniejące wywołanie nie zmienia zachowania). |
| Treść panelu (kompozycja) | `src/TasksGlobal/Modals/Case/CaseInlineCreateBody.tsx` | `MilestoneSelector` (pisze `_parent`) + **niezmieniony** `CaseModalBody`, montowany dopiero po wybraniu kamienia milowego (przekazanego jako `contextData`). |
| Host / wiring | `src/Letters/LettersList/Modals/LetterModalBody.tsx` | `useState(showCreateCase)`, `onRequestCreate`, mount `<InlineCreateDrawer<Case>>`, `onCreated` auto-select. |

### Zasady wiring (RepositoryReact)

- **Ta sama instancja repository** dla panelu i selektora. Drawer dostaje
  `repository={casesRepository}` — dokładnie tę instancję, z której selektor czyta opcje.
  Inaczej nowy obiekt nie pojawi się na liście.
- **`onCreated(created)`** czyta świeży obiekt z `repository.items` (źródło prawdy), po czym
  `setValue("_cases", [...current, created], { shouldValidate: true })` (z deduplikacją).
  Żadnej bezpośredniej mutacji stanu.
- **Odświeżenie opcji selektora** przez licznik `refreshToken` (prop na `CaseSelectMenuElement`,
  dodany do zależności `useEffect` ładującego opcje). Bump tokena ⇒ opcje przebudowane z
  `repository.items`. Pominięty ⇒ bez zmian.
- **Walidacja**: drawer działa w `mode: "onChange"` + `yupResolver`, więc warunkowe pola
  (np. „Nazwa sprawy" tylko dla typu wielokrotnego) re-walidują się natychmiast po zmianie typu.

### Przyszłe haki (TODO(graf))

PR1 świadomie ogranicza się do poziomu Sprawy i jednego call-site (pismo). Punkty rozszerzeń
oznaczone w kodzie markerem `TODO(graf)`:

- **Rekurencyjne tworzenie Kamienia milowego** — `MilestoneSelector.onRequestCreate`
  (`BussinesObjectSelectors.tsx`): hook do otwierania zagnieżdżonego panelu tworzenia Milestone,
  gdy dla kontraktu brak kamieni. Dziś stan „brak kamieni" = link do `TasksGlobal`.
- **Zagnieżdżanie paneli** — `InlineCreateDrawer.tsx`: panele mogą się stackować (panel Milestone
  otwarty z wnętrza panelu Sprawy).
- **Reużycie dla innych selektorów** — `InlineCreateDrawer<T>` jest generyczny; ten sam wzorzec
  (`onRequestCreate` + drawer + `onCreated` auto-select) można dołożyć do Contract/Project/Person
  (przyszły PR2).

## FAQ

**Q: Czy lokalne repository jest wydajne? Czy to nie powoduje zbyt wielu instancji?**  
A: `useMemo` z pustą tablicą zależności zapewnia, że instancja jest tworzona **tylko raz** na cykl życia komponentu. To bardzo wydajne podejście.

**Q: Co jeśli potrzebuję współdzielić dane między dwoma selektorami?**  
A: Jeśli selektory muszą pokazywać te same dane, rozważ użycie globalnego repository przekazywanego przez props, lub przenieś zarządzanie stanem wyżej (lifting state up).

**Q: Czy mogę cache'ować wyniki wyszukiwania?**  
A: `RepositoryReact` automatycznie cache'uje dane w `sessionStorage`. Lokalne repository też z tego korzysta.

**Q: Co z testami jednostkowymi?**  
A: Mockuj `RepositoryReact` w testach. Lokalne repository ułatwia testowanie, bo nie musisz mockować zewnętrznych zależności.

**Q: Czy ten wzorzec jest zgodny z React best practices?**  
A: Tak! To przykład "Composition over Inheritance" i hermetyzacji komponentów - kluczowych zasad React.

## Podsumowanie

Wzorzec Samodzielnego Selektora to **zalecane podejście** dla wszystkich komponentów wyboru obiektów biznesowych w projekcie. Zapewnia:

✅ **Hermetyzację** - komponenty są niezależne  
✅ **Izolację** - brak konfliktów między komponentami  
✅ **Prostotę** - czysty i intuicyjny interfejs  
✅ **Reużywalność** - można używać wszędzie bez obaw  
✅ **Testowalność** - łatwe mockowanie i testowanie

**Status migracji:** Obecnie w trakcie refactoringu. Nowe selektory powinny być tworzone według tego wzorca, stare stopniowo migrowane.
