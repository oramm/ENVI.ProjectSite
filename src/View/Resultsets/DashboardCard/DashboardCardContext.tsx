import React, { createContext } from "react";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { DashboardCardData } from "./DashboardCard";

type DashboardCardContextProps<DataItemType extends RepositoryDataItem> = {
    objects: DataItemType[];
    repository: RepositoryReact<DataItemType>;
    cardData: DashboardCardData<DataItemType> | null;
    handleEditObject: (object: DataItemType) => void;
    handleDeleteObject: (objectId: number) => void;
    setObjects: React.Dispatch<React.SetStateAction<DataItemType[]>>;
    selectedObjectRoute: string;
    activeRowId: number;
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    isDeletable: boolean;
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
};

export const DashboardCardContext = createContext<DashboardCardContextProps<RepositoryDataItem>>({
    objects: [],
    repository: {} as RepositoryReact<RepositoryDataItem>,
    cardData: {} as DashboardCardData<RepositoryDataItem> | null,
    handleEditObject: () => {},
    handleDeleteObject: () => {},
    setObjects: () => {},
    selectedObjectRoute: "",
    activeRowId: 0,
    EditButtonComponent: undefined,
    isDeletable: true,
    shouldRetrieveDataBeforeEdit: false,
    specialRetrieveActionRoute: undefined,
});

export function DashboardCardProvider<Item extends RepositoryDataItem>({
    objects,
    setObjects,
    repository,
    handleEditObject,
    handleDeleteObject,
    cardData,
    selectedObjectRoute,
    activeRowId,
    EditButtonComponent,
    isDeletable = true,
    shouldRetrieveDataBeforeEdit = true,
    specialRetrieveActionRoute,
    children,
}: React.PropsWithChildren<DashboardCardContextProps<Item>>) {
    const DashboardCardContextGeneric = DashboardCardContext as unknown as React.Context<
        DashboardCardContextProps<Item>
    >;

    return (
        <DashboardCardContextGeneric.Provider
            value={{
                objects,
                setObjects: setObjects as React.Dispatch<React.SetStateAction<Item[]>>,
                repository,
                cardData,
                handleEditObject,
                handleDeleteObject,
                selectedObjectRoute,
                activeRowId,
                EditButtonComponent,
                isDeletable,
                shouldRetrieveDataBeforeEdit,
                specialRetrieveActionRoute,
            }}
        >
            {children}
        </DashboardCardContextGeneric.Provider>
    );
}

export function useDashboardCardContext<Item extends RepositoryDataItem>() {
    const context = React.useContext<DashboardCardContextProps<Item>>(
        DashboardCardContext as unknown as React.Context<DashboardCardContextProps<Item>>
    );
    if (!context) {
        throw new Error("useMyContext must be used under MyContextProvider");
    }
    return context;
}
