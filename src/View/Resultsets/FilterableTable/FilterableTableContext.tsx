import React, { createContext } from "react";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { RowStructure } from "./FilterableTableTypes";
import { SectionNode } from "./Section";

type FilterableTableContextProps<DataItemType extends RepositoryDataItem> = {
    id: string;
    objects: DataItemType[];
    repository: RepositoryReact<DataItemType>;
    sections: SectionNode<DataItemType>[];
    tableStructure: RowStructure<DataItemType>[];
    handleAddObject: (object: DataItemType) => void;
    handleEditObject: (object: DataItemType) => void;
    handleCopyObject: (object: DataItemType) => void;
    handleDeleteObject: (objectId: number) => void;
    setObjects: React.Dispatch<React.SetStateAction<DataItemType[]>>;
    handleAddSection: (sectionObject: RepositoryDataItem) => void;
    handleEditSection: (sectionObject: RepositoryDataItem) => void;
    handleDeleteSection: (sectionObjectId: number) => void;
    setSections: React.Dispatch<React.SetStateAction<SectionNode<DataItemType>[]>>;
    selectedObjectRoute: string;
    activeRowId: number;
    activeSectionId: string;
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    isDeletable: boolean;
    isCopyable: boolean;
    externalUpdate: number;
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
};

export const FilterableTableContext = createContext<FilterableTableContextProps<RepositoryDataItem>>({
    id: "",
    objects: [],
    sections: [],
    repository: {} as RepositoryReact<RepositoryDataItem>,
    tableStructure: [],
    handleAddObject: () => {},
    handleEditObject: () => {},
    handleCopyObject: () => {},
    handleDeleteObject: () => {},
    setObjects: () => {},
    handleAddSection: () => {},
    handleEditSection: () => {},
    handleDeleteSection: () => {},
    setSections: () => {},
    selectedObjectRoute: "",
    activeRowId: 0,
    activeSectionId: "",
    EditButtonComponent: undefined,
    isDeletable: true,
    isCopyable: false,
    externalUpdate: 0,
    shouldRetrieveDataBeforeEdit: false,
    specialRetrieveActionRoute: undefined,
});

export function FilterableTableProvider<Item extends RepositoryDataItem>({
    id,
    objects,
    setObjects,
    repository,
    handleAddObject,
    handleEditObject,
    handleDeleteObject,
    sections,
    setSections,
    handleAddSection,
    handleEditSection,
    handleCopyObject,
    handleDeleteSection,
    tableStructure,
    selectedObjectRoute,
    activeRowId,
    activeSectionId,
    EditButtonComponent,
    isDeletable = true,
    isCopyable = false,
    externalUpdate,
    shouldRetrieveDataBeforeEdit = false,
    specialRetrieveActionRoute,
    children,
}: React.PropsWithChildren<FilterableTableContextProps<Item>>) {
    const FilterableTableContextGeneric = FilterableTableContext as unknown as React.Context<
        FilterableTableContextProps<Item>
    >;

    return (
        <FilterableTableContextGeneric.Provider
            value={{
                id,
                objects,
                setObjects: setObjects as React.Dispatch<React.SetStateAction<Item[]>>,
                repository,
                sections,
                setSections: setSections as React.Dispatch<React.SetStateAction<SectionNode<Item>[]>>,
                handleAddSection,
                handleEditSection,
                handleDeleteSection,
                tableStructure,
                handleAddObject,
                handleEditObject,
                handleCopyObject,
                handleDeleteObject,
                selectedObjectRoute,
                activeRowId,
                activeSectionId,
                EditButtonComponent,
                isDeletable,
                isCopyable,
                externalUpdate,
                shouldRetrieveDataBeforeEdit,
                specialRetrieveActionRoute,
            }}
        >
            {children}
        </FilterableTableContextGeneric.Provider>
    );
}

export function useFilterableTableContext<Item extends RepositoryDataItem>() {
    const context = React.useContext<FilterableTableContextProps<Item>>(
        FilterableTableContext as unknown as React.Context<FilterableTableContextProps<Item>>
    );
    if (!context) {
        throw new Error("useMyContext must be used under MyContextProvider");
    }
    return context;
}
