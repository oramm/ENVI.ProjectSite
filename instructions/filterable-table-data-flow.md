# FilterableTable - Przepływ Danych i Architektura

## Przegląd

`FilterableTable` to główny komponent do wyświetlania tabel z danymi, obsługujący filtrowanie, CRUD operations i interakcję z użytkownikiem. Wykorzystywany jest w wielu miejscach aplikacji (np. Letters, Entities, Projects).

## Hierarchia Komponentów

```
LettersSearch (lub inna strona)
  └─ FilterableTable
      └─ FilterableTableProvider (Context)
          └─ ResultSetTable
              └─ FilterableTableRow (dla każdego obiektu)
                  └─ RowActionMenu
                      ├─ EditButtonComponent (np. LetterEditModalButton)
                      ├─ DeleteModalButton
                      └─ CopyModalButton (opcjonalnie)
```

## Przepływ Danych - Krok po Kroku

### 1. Inicjalizacja w Stronie Głównej (np. LettersSearch)

```tsx
// src/Letters/LettersList/LettersSearch.tsx
<FilterableTable<OurLetterContract | IncomingLetterContract>
    id="contractsLetters"
    repository={lettersRepository}
    EditButtonComponent={LetterEditModalButton}
    tableStructure={[...]}
    // ... inne props
/>
```

**Przekazywane dane:**

-   `repository` - instancja RepositoryReact zawierająca `items[]` (wszystkie obiekty) i `currentItems[]` (aktualnie wybrane)
-   `EditButtonComponent` - komponent przycisku edycji (specyficzny dla danego typu danych)
-   `tableStructure` - definicja kolumn tabeli

### 2. FilterableTable - Zarządzanie Stanem

```tsx
// src/View/Resultsets/FilterableTable/FilterableTable.tsx
const [objects, setObjects] = useState(initObjects());
const [activeRowId, setActiveRowId] = useState(0);

const handleRowClick = (id: number) => {
    setActiveRowId(id);
    repository.addToCurrentItems(id); // ← Aktualizacja repository.currentItems[0]
};
```

**Kluczowe mechanizmy:**

-   `objects` - tablica obiektów do wyświetlenia (z filtra lub z sessionStorage)
-   `activeRowId` - ID aktualnie zaznaczonego wiersza
-   `repository.currentItems[0]` - **zawsze zawiera pełny obiekt aktualnie zaznaczonego wiersza**

### 3. FilterableTableProvider - Context

```tsx
// src/View/Resultsets/FilterableTable/FilterableTableContext.tsx
<FilterableTableProvider
    objects={objects}
    repository={repository}
    activeRowId={activeRowId}
    EditButtonComponent={EditButtonComponent}
    handleEditObject={handleEditObject}
    // ... inne props
>
```

**Context udostępnia:**

-   Wszystkie dane i funkcje callback dla komponentów potomnych
-   Unika prop drilling (przekazywania props przez wiele poziomów)

### 4. ResultSetTable - Renderowanie Wierszy

```tsx
// src/View/Resultsets/FilterableTable/ResultSetTable.tsx
{
    objectsToShow.map((dataObject, index) => {
        const isActive = dataObject.id === activeRowId;
        return (
            <FilterableTableRow
                dataObject={dataObject} // ← Pełny obiekt z repository.items
                isActive={isActive}
                onRowClick={onRowClick}
            />
        );
    });
}
```

**Przekazywane dane:**

-   `dataObject` - **PEŁNY obiekt** z `repository.items[]` zawierający wszystkie pola (włącznie z zagnieżdżonymi obiektami, computed fields itp.)

### 5. FilterableTableRow - Wiersz Tabeli

```tsx
// src/View/Resultsets/FilterableTable/FilterableTableRow.tsx
<Row onClick={(e) => onRowClick(dataObject.id)}>
    {/* Renderowanie kolumn */}
    {isActive && (
        <RowActionMenu
            dataObject={dataObject} // ← Pełny obiekt przekazywany dalej
            EditButtonComponent={EditButtonComponent}
            handleEditObject={handleEditObject}
        />
    )}
</Row>
```

**Funkcjonalność:**

-   Wyświetla dane obiektu w kolumnach (według `tableStructure`)
-   Po kliknięciu wywołuje `onRowClick(dataObject.id)` → aktualizuje `repository.currentItems[0]`
-   Jeśli wiersz jest aktywny (`isActive`), pokazuje `RowActionMenu`

### 6. RowActionMenu - Menu Akcji

```tsx
// src/View/Resultsets/FilterableTable/FilterableTableRow.tsx
{
    EditButtonComponent && handleEditObject && (
        <EditButtonComponent
            modalProps={{
                onEdit: handleEditObject,
                initialData: dataObject, // ← PEŁNY obiekt z repository
                repository: repository,
            }}
            buttonProps={{ layout }}
        />
    );
}
```

**⚠️ UWAGA - Przekazywanie Pełnego Obiektu:**

-   `initialData` otrzymuje **CAŁY obiekt `dataObject`** z repository
-   Obiekt zawiera **wszystkie pola** włącznie z:
    -   Polem `id`
    -   Zagnieżdżonymi obiektami (np. `_contract`, `_cases`)
    -   Computed fields (np. `relatedLetterNumber`, `status`)
    -   Pola relacyjne (np. `_entitiesMain`, `_editor`)

### 7. EditButtonComponent - Modal Edycji

```tsx
// np. src/Letters/LettersList/Modals/LetterModalButtons.tsx
export function LetterEditModalButton({ modalProps: { onEdit, initialData } }) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurLetterModalBody,
                initialData: initialData, // ← Pełny obiekt Letter
                repository: lettersRepository,
            }}
        />
    );
}
```

### 8. GeneralModal - Obsługa Formularza

```tsx
// src/View/Modals/GeneralModal.tsx
<GeneralModal
    modalBodyProps={{
        isEditing: true,
        initialData: initialData, // ← Przekazywane do ModalBodyComponent
    }}
/>
```

**Flow przy zapisie z plikami:**

1. `handleSubmitRepository(data)` - otrzymuje dane z react-hook-form
2. `parseFieldValuesToFormData(data)` - konwertuje na FormData
3. `handleEditWithFiles(formData)` - dodaje kontekst
4. `appendContextData(currentDataItem, formData)` - **dodaje pola z `repository.currentItems[0]` które nie są w formularzu**

## ⚠️ Ważne Zasady - Unikanie Duplikatów

### Problem: Podwójne pola w FormData

Gdy w formularzu są dodawane pola z `initialData` przez `reset()` lub `setValue()`, mogą one powodować duplikaty w FormData.

**Przykład problemu:**

```tsx
// ❌ ŹLE - dodaje id, _contract, relatedLetterNumber do formularza
useEffect(() => {
    const resetData: any = {
        id: initialData?.id, // ← Duplikat!
        _contract: getContractFromCases(initialData?._cases), // ← Niepotrzebne w formularzu
        relatedLetterNumber: initialData?.relatedLetterNumber, // ← Backend może to obliczyć
        // ... inne pola
    };
    reset(resetData);
}, [initialData, reset]);
```

### Rozwiązanie: Minimalistyczny reset()

**Zasada:** W `reset()` lub `setValue()` dodawaj **TYLKO** pola, które:

1. Użytkownik może edytować
2. Są wymagane do walidacji formularza
3. Są potrzebne do wyświetlenia w UI (selektory, watch)

```tsx
// ✅ DOBRZE - tylko pola edytowalne przez użytkownika
useEffect(() => {
    const resetData: any = {
        _cases: initialData?._cases || [],
        description: initialData?.description || "",
        creationDate: initialData?.creationDate || nowUTC,
        registrationDate: initialData?.registrationDate || nowUTC,
        _editor: initialData?._editor,
        responseDueDate: initialData?.responseDueDate || "",
    };
    reset(resetData);

    // Dla pól potrzebnych tylko do UI (bez submit)
    if (contractFromCases) {
        setValue("_contract", contractFromCases, {
            shouldDirty: false, // Nie oznaczaj jako zmienione
            shouldValidate: false, // Nie waliduj
        });
    }
}, [initialData, reset, setValue]);
```

### appendContextData - Ochrona przed Duplikatami

```tsx
// src/View/Modals/GeneralModal.tsx
function appendContextData(currentDataItem: Record<string, any>, data: FormData) {
    for (const key in currentDataItem) {
        if (!data.has(key)) {  // ← Sprawdza czy pole już istnieje
            const value = currentDataItem[key];
            // ... dodaje tylko brakujące pola
            data.append(key, ...);
        }
    }
}
```

**Mechanizm:**

-   Iteruje po WSZYSTKICH polach z `repository.currentItems[0]`
-   Dodaje **TYLKO** te, których **NIE MA** w FormData
-   Zapewnia że `id` i inne pola kontekstowe są zawsze przesłane

## Najczęstsze Błędy i Rozwiązania

### 1. Podwójne `id` w FormData

**Przyczyna:** Pole `id` jest dodawane zarówno w `reset()` jak i w `appendContextData()`

**Rozwiązanie:** Usuń `id` z `reset()` - zostanie dodane automatycznie przez `appendContextData()`

### 2. Niepotrzebne zagnieżdżone obiekty w FormData

**Przyczyna:** Computed fields lub relacyjne obiekty są dodawane do `resetData`

**Rozwiązanie:**

-   Backend powinien obliczać computed fields
-   Przekazuj tylko ID relacji, nie całe obiekty (chyba że selector wymaga pełnego obiektu)

### 3. Dane z formularza nie są aktualizowane

**Przyczyna:** `shouldDirty: false` uniemożliwia wykrycie zmian

**Rozwiązanie:**

-   Usuń `shouldDirty: false` dla pól edytowalnych
-   Używaj `shouldDirty: false` tylko dla pól pomocniczych (np. `_contract` do wyboru `_cases`)

## Wzorzec: Edycja z Plikami vs bez Plików

### Z plikami (FormData)

```tsx
async function handleEditWithFiles(data: FormData) {
    const currentDataItem = { ...repository.currentItems[0] };

    appendContextData(currentDataItem, data); // Dodaje brakujące pola
    data.append("_originalData", JSON.stringify(currentDataItem));

    await repository.editItem(data, specialActionRoute, fieldsToUpdate);
}
```

### Bez plików (JSON)

```tsx
async function handleEditWithoutFiles(data: FieldValues) {
    const currentDataItem = { ...repository.currentItems[0] };

    const objectToEdit = merge(
        {},
        currentDataItem, // Bazowe dane
        data, // Zmiany z formularza
        { _contextData: modalBodyProps.contextData },
        { _originalData: currentDataItem }
    );

    await repository.editItem(objectToEdit, specialActionRoute, fieldsToUpdate);
}
```

## Podsumowanie - Kluczowe Punkty

1. **`dataObject` zawsze jest PEŁNYM obiektem** z `repository.items[]`
2. **`repository.currentItems[0]` zawsze wskazuje na aktualnie wybrany wiersz**
3. **`initialData` w modalu = pełny obiekt** z wszystkimi polami i relacjami
4. **`reset()` powinien zawierać TYLKO pola edytowalne** przez użytkownika
5. **`appendContextData()` automatycznie dodaje brakujące pola** z `currentItems[0]`
6. **Computed fields i relacje powinny być obliczane na backendzie** lub dodawane przez `appendContextData()`

## Zobacz Również

-   [Backend Computed Fields](./backend-computed-fields.md) - Jak backend oblicza pola
-   [Business Object Selectors](./business-object-selectors.md) - Jak działają selektory
-   [Selectors Architecture](./selectors-architecture.md) - Architektura selektorów
