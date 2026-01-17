# Wytyczne dla AI - ENVI.ProjectSite

> **Status projektu:** W trakcie refactoringu i modernizacji architektury

## Spis Treści

1. [Architektura projektu](#architektura-projektu)
2. [FilterableTable - zarządzanie listami](#filterabletable---zarządzanie-listami)
3. [RepositoryReact - komunikacja z API](#repositoryreact---komunikacja-z-api)
4. [Modalne i formularze](#modalne-i-formularze)
5. [Business Object Selectors](./business-object-selectors.md) ⭐ **Szczegółowa dokumentacja**
6. [Typowe błędy i rozwiązania](#typowe-błędy-i-rozwiązania)
7. [Checklist dla deweloperów](#checklist-dla-deweloperów)
8. [UI Browser Loop (dopracowanie UI)](#ui-browser-loop-dopracowanie-ui)

## UI Browser Loop (dopracowanie UI)

Jeśli chcesz dopracować UI w schemacie: **ustalamy → zmieniamy → sprawdzamy w przeglądarce → oceniamy → poprawiamy**, używaj trybu:

**Tryb: UI Browser Loop**

Pełny opis i szablon polecenia: [ui-browser-loop.md](./ui-browser-loop.md)

Minimalny zestaw informacji, żeby agent mógł działać bez dopytywania:

-   Route/ekran (`#/...`), np. `#/persons`
-   Co jest nie tak teraz + co ma być docelowo (kryteria akceptacji)
-   Czy zmiany mają dotyczyć tylko CSS/układu czy też komponentów
-   Czy ekran wymaga logowania (DEV Mock Login) i jaka rola jest potrzebna

Weryfikacja efektu: agent używa Puppeteer (skrypt `scripts/screenshot.js`) i zapisuje screenshoty do `test-results/screenshots`.

## Architektura projektu

### Zasady Podstawowe

#### 1. `repository.items` jest Jedynym Źródłem Prawdy

-   Wszystkie dane pochodzą z serwera i są przechowywane w `RepositoryReact.items`
-   Komponenty React synchronizują swój lokalny stan z `repository.items`
-   Synchronizacja jest **jedokierunkowa**: `repository.items` → `objects` (stan komponentu)

#### 2. Przepływ Danych w Operacjach CRUD

```
Modal → repository.addNewItem/editItem/deleteItem (komunikacja z serwerem)
↓
repository.items zostaje zaktualizowane
↓
Callback (onAddNew/onEdit/onDelete) → handleAddObject/handleEditObject/handleDeleteObject
↓
setObjects([...repository.items]) → synchronizacja lokalnego stanu
```

#### 3. NIE Modyfikuj Danych Ręcznie

-   ❌ `setObjects([...objects, newObject])` - tworzy duplikaty
-   ❌ `setObjects(objects.map(...))` - desynchronizuje z repository
-   ✅ `setObjects([...repository.items])` - zawsze synchronizowane

#### 4. Izolacja Komponentów

**Komponenty pomocnicze (selektory, autocomplete) używają lokalnych repozytoriów:**

```typescript
// ✅ DOBRE - każdy komponent ma własne, izolowane dane
const localRepository = useMemo(
    () => new RepositoryReact({
        actionRoutes: { getRoute: "api/endpoint", ... },
        name: "componentName_temp" // Unikalna nazwa!
    }),
    []
);
```

**Szczegółowo:** Zobacz [Business Object Selectors](./business-object-selectors.md)

## FilterableTable - Zarządzanie Listami

### Rola i Odpowiedzialności

`FilterableTable` to główny komponent do wyświetlania i zarządzania listami danych. Odpowiada za:

-   Renderowanie tabel z danymi z `repository.items`
-   Filtrowanie i sortowanie
-   Integrację z operacjami CRUD (dodawanie, edycja, usuwanie)
-   Zarządzanie snapshotami (stan filtrów i danych w sessionStorage)

**Kluczowa zasada:** `FilterableTable` używa **globalnego, współdzielonego** repository, podczas gdy komponenty pomocnicze (selektory) używają **lokalnych** repozytoriów.

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

## RepositoryReact - Komunikacja z API

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

## Modalne i Formularze

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

## Business Object Selectors

> **📖 Pełna dokumentacja:** [Business Object Selectors](./business-object-selectors.md)

### Szybkie Wprowadzenie

Business Object Selectors to komponenty do wyboru obiektów biznesowych (kontrakty, projekty, osoby) w formularzach.

**Kluczowa zasada:** Każdy selektor ma **własne, lokalne repository** - nie dzieli go z innymi komponentami.

```typescript
// ✅ DOBRE - Selektor z lokalnym repository
export function ContractSelector({ name, typesToInclude, _project }: Props) {
    const localRepository = useMemo(
        () => new RepositoryReact({
            actionRoutes: { getRoute: "contracts", ... },
            name: "contractSelector_temp", // Unikalna nazwa
        }),
        []
    );

    return <MyAsyncTypeahead repository={localRepository} {...props} />;
}

// Użycie - prosty interfejs bez przekazywania repository
<ContractSelector typesToInclude="our" _project={project} />
```

**Dlaczego?**

-   ✅ Brak konfliktów z `FilterableTable`
-   ✅ Izolacja danych - każdy selektor ma swoje
-   ✅ Prosty interfejs - nie trzeba przekazywać repository
-   ✅ Reużywalność - można używać wszędzie

**Więcej:** Pełna dokumentacja wzorca, przykłady i FAQ w [business-object-selectors.md](./business-object-selectors.md)

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

## Typowe Błędy i Rozwiązania

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

**Rozwiązanie:** Zawsze synchronizuj `objects` z `repository.items` przed `updateSnapshot()`.

## Checklist dla Deweloperów

### Przed Commitowaniem Zmian

**Operacje CRUD:**

-   [ ] Operacje CRUD synchronizują `objects` z `repository.items`
-   [ ] Nie ma ręcznych modyfikacji `objects` (dodawanie/edycja/usuwanie)
-   [ ] `updateSnapshot()` jest wywoływane po synchronizacji stanu

**Komponenty:**

-   [ ] Komponenty pomocnicze (selektory) mają własne lokalne repository
-   [ ] Nie ma mutacji obiektów/tablic - zawsze nowe referencje
-   [ ] `handleRowClick` zawsze znajdzie obiekt w `repository.items`

**Business Object Selectors:**

-   [ ] Props NIE zawierają `repository`
-   [ ] Lokalne repository utworzone z `useMemo(() => new RepositoryReact(...), [])`
-   [ ] Nazwa repository jest unikalna i kończy się `_temp`
-   [ ] Zobacz pełny checklist w [business-object-selectors.md](./business-object-selectors.md)

### Przed Refactoringiem

-   [ ] Przeczytaj aktualne wytyczne dla modyfikowanego obszaru
-   [ ] Sprawdź czy istnieje wzorzec do naśladowania
-   [ ] Upewnij się że rozumiesz przepływ danych

## Checklist przed commitowaniem zmian

### Przed Refactoringiem

-   [ ] Przeczytaj aktualne wytyczne dla modyfikowanego obszaru
-   [ ] Sprawdź czy istnieje wzorzec do naśladowania
-   [ ] Upewnij się że rozumiesz przepływ danych

## Przykłady Kodu

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

### Selektor z Lokalnym Repository

> **📖 Więcej przykładów:** [business-object-selectors.md](./business-object-selectors.md)

```typescript
export function ContractSelector({ name, typesToInclude, _project }: Props) {
    // ✅ Lokalne repository - nie koliduje z innymi komponentami
    const localRepository = useMemo(
        () => new RepositoryReact({
            actionRoutes: { getRoute: "contracts", ... },
            name: "contractSelector_temp",
        }),
        []
    );

    return (
        <MyAsyncTypeahead
            name={name}
            repository={localRepository}
            contextSearchParams={{ typesToInclude, _project }}
        />
    );
}

// Użycie
<ContractSelector typesToInclude="our" _project={project} />
```

## Dokumentacja Modułowa

Projekt jest w trakcie refactoringu. Szczegółowe wytyczne są rozdzielone na moduły:

-   **[Business Object Selectors](./business-object-selectors.md)** - Wzorce dla komponentów wyboru obiektów
-   _(Więcej modułów w przyszłości)_

## Pytania i Odpowiedzi

**Q: Czy mogę używać `repository.items` bezpośrednio w renderze?**  
A: Tak, ale lepiej używać lokalnego stanu `objects` zsynchronizowanego z `repository.items`. Daje to lepszą kontrolę nad re-renderami.

**Q: Kiedy wywołać `updateSnapshot()`?**  
A: Po każdej operacji CRUD (dodanie/edycja/usunięcie) i po synchronizacji `objects` z `repository.items`.

**Q: Czy mogę modyfikować `repository.items` bezpośrednio?**  
A: Tak, ale tylko w metodach `RepositoryReact` (addNewItem, editItem, deleteItem). W komponentach React zawsze używaj `setObjects([...repository.items])`.

**Q: Co zrobić gdy mam komponent używany w wielu miejscach?**  
A: Jeśli komponent ładuje dane z serwera (selector, autocomplete), daj mu własne lokalne repository. Jeśli tylko wyświetla dane, przekaż `repository` jako props. Zobacz [business-object-selectors.md](./business-object-selectors.md)

## Wsparcie i Kontakt

Przy wprowadzaniu zmian w projekcie, zawsze sprawdź:

1. Czy zmiany są zgodne z tymi wytycznymi
2. Czy nie łamiesz zasady "repository.items jako źródło prawdy"
3. Czy nie tworzysz konfliktów między komponentami współdzielącymi repository

W razie wątpliwości, preferuj:

-   Synchronizację zamiast modyfikacji
-   Izolację zamiast współdzielenia
-   Immutability zamiast mutacji
