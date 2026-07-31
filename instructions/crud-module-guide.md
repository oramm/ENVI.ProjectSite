# Przewodnik: Tworzenie nowego modułu CRUD

Receptura krok po kroku: nie *jak dziala*, tylko *jak stworzyc*.

---

## 1. Struktura plików

```
src/{Domain}/{SubModule}/
├── {Entity}Controller.ts          — repozytorium (factory lub globalne)
├── {Entity}Search.tsx             — strona z FilterableTable + auto-load
└── Modals/
    ├── {Entity}ModalButtons.tsx   — komponenty AddNew + Edit
    ├── {Entity}ModalBody.tsx      — formularz react-hook-form
    └── {Entity}ValidationSchema.ts — walidacja Yup
```

---

## 2. Wzorzec A: Scoped repo (factory)

Używaj gdy encja jest powiązana z rodzicem (np. Education → Person, Experience → Person).

Repozytorium tworzone dynamicznie z `parentId` — każdy parent dostaje osobną instancję.

### A1. Controller (factory)

```typescript
// src/{Domain}/{Sub}/{Entity}Controller.ts
import { MyEntityData } from "../../../Typings/bussinesTypes";
import RepositoryReact from "../../React/RepositoryReact";

export function createMyEntityRepository(parentId: number) {
    return new RepositoryReact<MyEntityData>({
        name: `parent_${parentId}_myEntities_temp`,
        actionRoutes: {
            getRoute: `v2/parents/${parentId}/myEntities/search`,
            addNewRoute: `v2/parents/${parentId}/myEntities`,
            editRoute: `v2/parents/${parentId}/myEntities`,
            deleteRoute: `v2/parents/${parentId}/myEntities`,
        },
    });
}
```

### A2. ModalButtons (factory)

```typescript
// src/{Domain}/{Sub}/Modals/{Entity}ModalButtons.tsx
import React from "react";
import { MyEntityData } from "../../../../Typings/bussinesTypes";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { MyEntityModalBody } from "./MyEntityModalBody";
import { makeMyEntityValidationSchema } from "./MyEntityValidationSchema";

export function createMyEntityEditModalButton(repository: RepositoryReact<MyEntityData>) {
    return function MyEntityEditModalButton({ modalProps: { onEdit, initialData } }: SpecificEditModalButtonProps<MyEntityData>) {
        return (
            <GeneralEditModalButton<MyEntityData>
                modalProps={{
                    onEdit,
                    ModalBodyComponent: MyEntityModalBody,
                    modalTitle: "Edycja ...",
                    repository,
                    initialData,
                    makeValidationSchema: makeMyEntityValidationSchema,
                }}
                buttonProps={{ buttonVariant: "outline-success" }}
            />
        );
    };
}

export function createMyEntityAddNewModalButton(repository: RepositoryReact<MyEntityData>) {
    return function MyEntityAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<MyEntityData>) {
        return (
            <GeneralAddNewModalButton<MyEntityData>
                modalProps={{
                    onAddNew,
                    ModalBodyComponent: MyEntityModalBody,
                    modalTitle: "Dodaj ...",
                    repository,
                    makeValidationSchema: makeMyEntityValidationSchema,
                }}
                buttonProps={{
                    buttonCaption: "Dodaj ...",
                    buttonVariant: "outline-success",
                }}
            />
        );
    };
}
```

### A3. Użycie w komponencie nadrzędnym (scoped)

```typescript
// W komponencie rodzica (np. PersonProfilePage.tsx)
const myEntityRepo = useMemo(() => createMyEntityRepository(parentId), [parentId]);
const [items, setItems] = useState<MyEntityData[] | undefined>(undefined);

useEffect(() => {
    async function fetch() {
        await myEntityRepo.loadItemsFromServerPOST([]);
        setItems([...myEntityRepo.items]);
    }
    fetch();
}, [myEntityRepo]);

const AddButton = useMemo(() => createMyEntityAddNewModalButton(myEntityRepo), [myEntityRepo]);
const EditButton = useMemo(() => createMyEntityEditModalButton(myEntityRepo), [myEntityRepo]);

// W JSX:
{items ? (
    <FilterableTable<MyEntityData>
        id={`parent_${parentId}_myEntities`}
        repository={myEntityRepo}
        initialObjects={items}
        tableStructure={[
            { header: "Nazwa", objectAttributeToShow: "name" },
        ]}
        AddNewButtonComponents={[AddButton]}
        EditButtonComponent={EditButton}
        isDeletable={true}
    />
) : (
    <SpinnerBootstrap />
)}
```

**Przykłady w kodzie:** `Education/`, `Experience/`, `ProfileSkills/` w `src/Persons/PersonProfile/`

---

## 3. Wzorzec B: Globalne repo (direct export)

Używaj gdy encja jest samodzielna lub ma własną stronę z filtrowaniem.

### B1. Controller (globalny)

```typescript
// src/{Domain}/{Entity}Controller.ts  (lub w istniejącym ContractsController.ts)
import { MyEntityData } from "../../Typings/bussinesTypes";
import RepositoryReact from "../React/RepositoryReact";

export const myEntityRepository = new RepositoryReact<MyEntityData>({
    actionRoutes: {
        getRoute: "myEntities",
        addNewRoute: "myEntity",
        editRoute: "myEntity",
        deleteRoute: "myEntity",
    },
    name: "myEntities",
});
```

### B2. ModalButtons (direct export)

```typescript
// src/{Domain}/Modals/{Entity}ModalButtons.tsx
import React from "react";
import { MyEntityData } from "../../../Typings/bussinesTypes";
import { SpecificAddNewModalButtonProps } from "../../View/Modals/ModalsTypes";
import { GeneralAddNewModalButton } from "../../View/Modals/GeneralModalButtons";
import { MyEntityModalBody } from "./MyEntityModalBody";
import { myEntityRepository } from "../MyEntityController";
import { makeMyEntityValidationSchema } from "./MyEntityValidationSchema";

export function MyEntityAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<MyEntityData>) {
    return (
        <GeneralAddNewModalButton<MyEntityData>
            modalProps={{
                onAddNew,
                ModalBodyComponent: MyEntityModalBody,
                modalTitle: "Dodaj ...",
                repository: myEntityRepository,
                makeValidationSchema: makeMyEntityValidationSchema,
            }}
            buttonProps={{
                buttonCaption: "Dodaj ...",
                buttonVariant: "outline-success",
            }}
        />
    );
}
```

Jeśli modal potrzebuje kontekstu rodzica (np. `contractId`), przekaż go przez `contextData`:
```typescript
contextData: parentId,   // w GeneralAddNewModalButton modalProps
```
i odbierz w ModalBody jako trzeci argument:
```typescript
function MyEntityModalBody({ isEditing, initialData, contextData }: ModalBodyProps<MyEntityData>) { ... }
```

### B3. Search component (globalne repo)

```typescript
// src/{Domain}/{Entity}Search.tsx
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { MyEntityData } from "../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../View/Resultsets/CommonComponents";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { myEntityRepository } from "./MyEntityController";
import { MyEntityAddNewModalButton } from "./Modals/MyEntityModalButtons";

export default function MyEntitySearch() {
    const [items, setItems] = useState<MyEntityData[] | undefined>(undefined);

    useEffect(() => {
        async function fetchItems() {
            await myEntityRepository.loadItemsFromServerPOST([]);
            setItems([...myEntityRepository.items]);
        }
        fetchItems();
    }, []);

    return (
        <Card>
            <Card.Body>
                {items ? (
                    <FilterableTable<MyEntityData>
                        id="myEntities"
                        title="Moje encje"
                        initialObjects={items}
                        repository={myEntityRepository}
                        AddNewButtonComponents={[MyEntityAddNewModalButton]}
                        tableStructure={[
                            { header: "Nazwa", objectAttributeToShow: "name" },
                        ]}
                        isDeletable={false}
                    />
                ) : (
                    <>Ładowanie... <SpinnerBootstrap /></>
                )}
            </Card.Body>
        </Card>
    );
}
```

**Przykłady w kodzie:** `MeetingNotes` w `src/Contracts/ContractsList/ContractDetails/MeetingNotes/`

---

## 4. Wspólne pliki (oba wzorce)

### ValidationSchema

```typescript
// Modals/{Entity}ValidationSchema.ts
import * as Yup from "yup";

export function makeMyEntityValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        name: Yup.string()
            .required("Nazwa jest wymagana")
            .max(200, "Maksymalnie 200 znaków"),
        // dodaj pola...
    });
}
```

### ModalBody

```typescript
// Modals/{Entity}ModalBody.tsx
import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { MyEntityData } from "../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../View/Modals/CommonFormComponents/GenericComponents";

export function MyEntityModalBody({ isEditing, initialData }: ModalBodyProps<MyEntityData>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        reset({
            name: initialData?.name || "",
        });
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="name" className="mb-3">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>
        </>
    );
}
```

### Typ TypeScript

```typescript
// Typings/bussinesTypes.d.ts — dodaj:
interface MyEntityData extends RepositoryDataItem {
    id: number;
    name: string;
    // ...pola
}
```

---

## 5. Checklist — 8 kroków

1. **Typ** — dodaj interfejs w `Typings/bussinesTypes.d.ts`
2. **Controller** — utwórz repozytorium (factory `createXxxRepository(parentId)` lub globalne `export const xxxRepository`)
3. **ValidationSchema** — `makeXxxValidationSchema(isEditing)` z polami Yup
4. **ModalBody** — formularz z `useFormContext()`, `reset()` w `useEffect`
5. **ModalButtons** — AddNew + Edit (factory `createXxxAddNewModalButton(repo)` lub direct export)
6. **Search/Page** — komponent z `FilterableTable`, auto-load w `useEffect`, stan `undefined | T[]`
7. **Route** — dodaj `<Route>` w MainWindow (jeśli nowa strona top-level)
8. **Weryfikacja** — `npx tsc --noEmit`, `yarn start`, sprawdź w przeglądarce

### Sygnały poprawności:
- Stan `undefined` → spinner, `[]` → pusta tabela, `[...]` → dane
- Po CRUD operacji: `setItems([...repository.items])` (sync z repo!)
- Brak warningów w konsoli
- `updateSnapshot()` wywoływane przez FilterableTable automatycznie

---

## 6. Decyzja: factory vs global?

| Kryterium | Factory (scoped) | Global (direct) |
|-----------|------------------|-----------------|
| Encja zależy od parentId | ✅ | — |
| Osobna strona / route | — | ✅ |
| Wiele instancji jednocześnie | ✅ | — |
| Prostsza struktura | — | ✅ |
| Przykłady | Education, Skills | MeetingNotes, Letters |
