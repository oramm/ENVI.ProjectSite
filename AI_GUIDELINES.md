# Wytyczne dla AI - ENVI.ProjectSite

## Architektura projektu

### Zasady podstawowe

1. **`repository.items` jest jedynym źródłem prawdy**

    - Wszystkie dane pochodzą z serwera i są przechowywane w `RepositoryReact.items`
    - Komponenty React synchronizują swój lokalny stan z `repository.items`
    - Synchronizacja jest **jedokierunkowa**: `repository.items` → `objects` (stan komponentu)

2. **Przepływ danych w operacjach CRUD:**

    ```
    Modal → repository.addNewItem/editItem/deleteItem (komunikacja z serwerem)
    ↓
    repository.items zostaje zaktualizowane
    ↓
    Callback (onAddNew/onEdit/onDelete) → handleAddObject/handleEditObject/handleDeleteObject
    ↓
    setObjects([...repository.items]) → synchronizacja lokalnego stanu
    ```

3. **NIE modyfikuj danych ręcznie**
    - ❌ `setObjects([...objects, newObject])` - tworzy duplikaty
    - ❌ `setObjects(objects.map(...))` - desynchronizuje z repository
    - ✅ `setObjects([...repository.items])` - zawsze synchronizowane

## FilterableTable - kluczowe zasady

### Operacje CRUD

**ZAWSZE synchronizuj lokalny stan `objects` z `repository.items`:**

```typescript
function handleAddObject(object: LeafDataItemType) {
    // ✅ repository.items już zawiera nowy obiekt (dodany przez repository.addNewItem)
    setObjects([...repository.items]);
    updateSnapshot();
}

function handleEditObject(object: LeafDataItemType) {
    if (!sections.length) {
        // ✅ repository.items już zawiera zaktualizowany obiekt
        setObjects([...repository.items]);
        updateSnapshot();
    } else {
        setSections(editNode(sections, activeSectionId, object as RepositoryDataItem));
    }
}

function handleDeleteObject(objectId: number) {
    if (!sections.length) {
        // ✅ repository.items już nie zawiera usuniętego obiektu
        setObjects([...repository.items]);
    } else {
        setSections(removeLeafFromSections(sections, objectId));
    }
    updateSnapshot();
}
```

### Dlaczego to jest poprawne?

Modalne wykonują operacje w następującej kolejności:

1. `await repository.addNewItem(data)` - wysyła do serwera i aktualizuje `repository.items`
2. `onAddNew(newObject)` - wywołuje callback z `FilterableTable`
3. `handleAddObject(newObject)` - **repository.items już jest zaktualizowane**

Jeśli dodasz obiekt ponownie (`setObjects([...objects, object])`), stworzysz **duplikat**.

## Konflikty między komponentami - izolacja repository

### Problem: Współdzielone repository

**NIE rób tego:**

```typescript
// ❌ ZŁE: Jeden repository używany w wielu miejscach
export const lettersRepository = new RepositoryReact(...);

// W FilterableTable:
<FilterableTable repository={lettersRepository} />

// W Modal > LetterSelector:
<LetterSelector repository={lettersRepository} />
// ☠️ LetterSelector ładuje tylko pisma z konkretnego kontraktu
// ☠️ Nadpisuje lettersRepository.items
// ☠️ FilterableTable traci wszystkie dane!
```

### Rozwiązanie: Lokalne repository w komponentach pomocniczych

**Zrób to:**

```typescript
export function LetterSelector({ name, label, _contract }: Props) {
    // ✅ Lokalna instancja - nie koliduje z głównym repository
    const localRepository = useMemo(
        () =>
            new RepositoryReact({
                actionRoutes: {
                    getRoute: "contractsLetters",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "letterSelector_temp", // Unikalna nazwa
            }),
        []
    );

    useEffect(() => {
        if (_contract?.id) {
            // ✅ Ładuje do lokalnego repo, nie wpływa na główne
            await localRepository.loadItemsFromServerPOST([{ contractId: _contract.id }]);
            setOptions(localRepository.items);
        }
    }, [_contract, localRepository]);
}
```

### Kiedy używać lokalnego repository?

**TAK - utwórz lokalne repository gdy:**

-   Komponent jest używany w modalach/dialogach
-   Komponent ładuje **podzbiór** danych (filtrowanie po parametrach)
-   Komponent jest "pomocniczy" (selector, lookup, autocomplete)
-   Dane są potrzebne tylko tymczasowo (do wyboru opcji)

**NIE - użyj globalnego repository gdy:**

-   Komponent jest głównym widokiem listy (FilterableTable)
-   Dane są współdzielone między wieloma komponentami na tym samym poziomie
-   Repository zarządza stanem całej sekcji aplikacji

## RepositoryReact - komunikacja z serwerem

### Metody CRUD automatycznie aktualizują `items`

```typescript
class RepositoryReact {
    async addNewItem(data: FormData | FieldValues) {
        // 1. Wysyła do serwera
        const response = await fetch(...);
        const newItem = await response.json();

        // 2. ✅ Aktualizuje items
        this.items.push(newItem);

        // 3. ✅ Zapisuje do sessionStorage
        this.saveToSessionStorage();

        // 4. Zwraca nowy obiekt
        return newItem;
    }

    async editItem(data: DataItemType) {
        const response = await fetch(...);
        const editedItem = await response.json();

        // ✅ Aktualizuje items
        this.items = this.items.map(x =>
            x.id === editedItem.id ? editedItem : x
        );

        this.saveToSessionStorage();
        return editedItem;
    }

    async deleteItemNodeJS(id: number) {
        await fetch(...);

        // ✅ Usuwa z items
        this.items = this.items.filter(item => item.id !== id);

        this.saveToSessionStorage();
    }
}
```

**Wniosek:** NIE musisz ręcznie aktualizować `repository.items` - metody CRUD robią to automatycznie.

## Modalne (GeneralModal)

### Przepływ danych w modalach

```typescript
// W GeneralModal:
async function handleAdd(data: FormData) {
    // 1. ✅ Repository komunikuje się z serwerem i aktualizuje items
    const newObject = await repository.addNewItem(data);

    // 2. ✅ Wywołuje callback przekazany z FilterableTable
    if (onAddNew) onAddNew(newObject);
}

// W FilterableTable:
function handleAddObject(object: LeafDataItemType) {
    // 3. ✅ Synchronizuje lokalny stan z repository.items
    setObjects([...repository.items]);
    updateSnapshot();
}
```

**Kluczowe:** Nie dodawaj obiektu ręcznie - on już jest w `repository.items`!

## Immutability i React

### Zawsze twórz nowe referencje

```typescript
// ❌ ZŁE - mutacja
repository.items.push(newItem);
setObjects(objects); // React nie wykryje zmiany

// ✅ DOBRE - nowa tablica
repository.items = [...repository.items, newItem];
setObjects([...repository.items]);
```

### Nie mutuj obiektów w miejscu

```typescript
// ❌ ZŁE
node.children.push(newChild);

// ✅ DOBRE
node.children = [...node.children, newChild];
```

## SessionStorage i snapshot

### `updateSnapshot()` używa `repository.items`

```typescript
function updateSnapshot() {
    const snapshot = {
        criteria: getCurrentCriteria(),
        storedObjects: repository.items, // ✅ Źródło prawdy
    };
    sessionStorage.setItem(snapshotName, JSON.stringify(snapshot));
}
```

**Dlatego ważne jest, żeby `repository.items` było zawsze aktualne!**

## Typowe błędy i ich rozwiązania

### 1. Duplikaty po dodaniu obiektu

**Objaw:** Po dodaniu nowego obiektu widzisz go podwójnie w liście.

**Przyczyna:**

```typescript
// ❌ ZŁE
function handleAddObject(object: LeafDataItemType) {
    setObjects([...objects, object]); // Duplikat!
}
```

**Rozwiązanie:**

```typescript
// ✅ DOBRE
function handleAddObject(object: LeafDataItemType) {
    setObjects([...repository.items]); // Synchronizacja
}
```

### 2. Błąd "Nie znaleziono elementu o id: X" w handleRowClick

**Objaw:** Kliknięcie na wiersz wywołuje błąd `repository.addToCurrentItems(id)`.

**Przyczyna:** `objects` (renderowane wiersze) są różne od `repository.items` (źródło dla `addToCurrentItems`).

**Rozwiązanie:** Upewnij się, że wszystkie operacje CRUD synchronizują `objects` z `repository.items`.

### 3. Utrata danych po zamknięciu modala

**Objaw:** Po zamknięciu modala z selektorem, główna lista pokazuje mniej elementów.

**Przyczyna:** Selector używa tego samego `repository` co główna lista i nadpisuje `repository.items`.

**Rozwiązanie:** Utwórz lokalne repository w selectorze (patrz sekcja "Izolacja repository").

### 4. Stare dane po odświeżeniu strony

**Objaw:** Po odświeżeniu strony (F5) dane wracają do starego stanu.

**Przyczyna:** `updateSnapshot()` zapisywało nieaktualne `repository.items`.

**Rozwiązanie:** Zawsze synchronizuj `objects` z `repository.items` przed `updateSnapshot()`.

## Checklist przed commitowaniem zmian

-   [ ] Operacje CRUD synchronizują `objects` z `repository.items`
-   [ ] Nie ma ręcznych modyfikacji `objects` (dodawanie/edycja/usuwanie)
-   [ ] Komponenty pomocnicze (selectory) mają własne lokalne repository
-   [ ] Nie ma mutacji obiektów/tablic - zawsze nowe referencje
-   [ ] `updateSnapshot()` jest wywoływane po synchronizacji stanu
-   [ ] `handleRowClick` zawsze znajdzie obiekt w `repository.items`

## Przykłady kodu

### Poprawny komponent z FilterableTable

```typescript
export function MyList() {
    const [objects, setObjects] = useState(repository.items);

    function handleAddObject(object: DataType) {
        setObjects([...repository.items]);
        updateSnapshot();
    }

    function handleEditObject(object: DataType) {
        setObjects([...repository.items]);
        updateSnapshot();
    }

    function handleDeleteObject(objectId: number) {
        setObjects([...repository.items]);
        updateSnapshot();
    }

    return (
        <FilterableTable
            repository={repository}
            onAddNew={handleAddObject}
            onEdit={handleEditObject}
            onDelete={handleDeleteObject}
        />
    );
}
```

### Poprawny selector z lokalnym repository

```typescript
export function MySelector({ _parentObject }: Props) {
    const [options, setOptions] = useState([]);

    const localRepository = useMemo(() => new RepositoryReact({
        actionRoutes: { getRoute: "myData", ... },
        name: "mySelector_temp",
    }), []);

    useEffect(() => {
        if (_parentObject?.id) {
            await localRepository.loadItemsFromServerPOST([{ parentId: _parentObject.id }]);
            setOptions(localRepository.items);
        }
    }, [_parentObject, localRepository]);

    return <Typeahead options={options} ... />;
}
```

## Pytania i odpowiedzi

**Q: Czy mogę używać `repository.items` bezpośrednio w renderze?**  
A: Tak, ale lepiej używać lokalnego stanu `objects` zsynchronizowanego z `repository.items`. Daje to lepszą kontrolę nad re-renderami.

**Q: Kiedy wywołać `updateSnapshot()`?**  
A: Po każdej operacji CRUD (dodanie/edycja/usunięcie) i po synchronizacji `objects` z `repository.items`.

**Q: Czy mogę modyfikować `repository.items` bezpośrednio?**  
A: Tak, ale tylko w metodach `RepositoryReact` (addNewItem, editItem, deleteItem). W komponentach React zawsze używaj `setObjects([...repository.items])`.

**Q: Co zrobić gdy mam komponent używany w wielu miejscach?**  
A: Jeśli komponent ładuje dane z serwera (selector, autocomplete), daj mu własne lokalne repository. Jeśli tylko wyświetla dane, przekaż `repository` jako props.

## Kontakt i wsparcie

Przy wprowadzaniu zmian w projekcie, zawsze sprawdź:

1. Czy zmiany są zgodne z tymi wytycznymi
2. Czy nie łamiesz zasady "repository.items jako źródło prawdy"
3. Czy nie tworzysz konfliktów między komponentami współdzielącymi repository

W razie wątpliwości, preferuj:

-   Synchronizację zamiast modyfikacji
-   Izolację zamiast współdzielenia
-   Immutability zamiast mutacji
