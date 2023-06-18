import React, { createContext } from "react";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { SectionStruture } from "./FilterableTable";
import { RowStructure } from "./ResultSetTable";

type FilterableTableContextProps<DataItemType extends RepositoryDataItem> = {
    objects: DataItemType[];
    repository: RepositoryReact<DataItemType>;
    sectionsStructure: SectionStruture[];
    tableStructure: RowStructure<DataItemType>[],
    handleAddObject: (object: DataItemType) => void;
    handleEditObject: (object: DataItemType) => void;
    handleDeleteObject: (objectId: number) => void;
    setObjects: React.Dispatch<React.SetStateAction<DataItemType[]>>;
    selectedObjectRoute: string,
    activeRowId: number,
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>,
    isDeletable: boolean,
    externalUpdate: number,
};

export const FilterableTableContext = createContext<FilterableTableContextProps<RepositoryDataItem>>({
    objects: [],
    sectionsStructure: [],
    repository: {} as RepositoryReact<RepositoryDataItem>,
    tableStructure: [],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    selectedObjectRoute: '',
    activeRowId: 0,
    EditButtonComponent: undefined,
    isDeletable: true,
    externalUpdate: 0,
});

export function FilterableTableProvider<Item extends RepositoryDataItem>({
    objects,
    setObjects,
    repository,
    handleAddObject,
    handleEditObject,
    handleDeleteObject,
    sectionsStructure,
    tableStructure,
    selectedObjectRoute,
    activeRowId,
    EditButtonComponent,
    isDeletable = true,
    externalUpdate,
    children, }: React.PropsWithChildren<FilterableTableContextProps<Item>>
) {
    const FilterableTableContextGeneric = FilterableTableContext as unknown as React.Context<FilterableTableContextProps<Item>>;

    return <FilterableTableContextGeneric.Provider value={{
        objects,
        setObjects: setObjects as React.Dispatch<React.SetStateAction<Item[]>>,
        repository,
        sectionsStructure,
        tableStructure,
        handleAddObject,
        handleEditObject,
        handleDeleteObject,
        selectedObjectRoute,
        activeRowId,
        EditButtonComponent,
        isDeletable,
        externalUpdate,
    }}>
        {children}
    </FilterableTableContextGeneric.Provider>;
}

export function useFilterableTableContext<Item extends RepositoryDataItem>() {
    const context = React.useContext<FilterableTableContextProps<Item>>(
        (FilterableTableContext as unknown) as React.Context<FilterableTableContextProps<Item>>
    );
    if (!context) {
        throw new Error('useMyContext must be used under MyContextProvider');
    }
    return context;
}