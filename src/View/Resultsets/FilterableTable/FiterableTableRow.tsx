import React from "react";
import { render } from "react-dom";
import { set } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { GeneralDeleteModalButton } from "../../Modals/GeneralModalButtons";
import { SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { GDDocFileIconLink, GDFolderIconLink, SpinnerBootstrap } from "../CommonComponents";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowStructure } from "./FilterableTableTypes";

export type FilterTableRowProps<DataItemType extends RepositoryDataItem> = {
    dataObject: DataItemType;
    isActive: boolean;
    onDoubleClick?: (object: DataItemType) => void;
    onIsReadyChange?: (isReady: boolean) => void;
    onRowClick: (id: number) => void;
};

export function FiterableTableRow<DataItemType extends RepositoryDataItem>({
    dataObject,
    isActive,
    onIsReadyChange,
    onRowClick,
}: FilterTableRowProps<DataItemType>): JSX.Element {
    if (!onIsReadyChange) throw new Error("onIsReadyChange is not defined");
    const navigate = useNavigate();
    const { selectedObjectRoute, tableStructure } = useFilterableTableContext<DataItemType>();
    const {
        handleEditObject,
        handleDeleteObject,
        EditButtonComponent,
        isDeletable,
        repository,
        shouldRetrieveDataBeforeEdit,
    } = useFilterableTableContext<DataItemType>();

    function tdBodyRender(columnStructure: RowStructure<DataItemType>, dataObject: DataItemType) {
        if (columnStructure.objectAttributeToShow !== undefined) {
            const key = columnStructure.objectAttributeToShow;
            return String(dataObject[key] ?? "");
        }
        if (columnStructure.renderTdBody !== undefined) return columnStructure.renderTdBody(dataObject);
        return "";
    }

    return (
        <tr
            onClick={(e) => onRowClick(dataObject.id)}
            onDoubleClick={() => {
                if (selectedObjectRoute) navigate(selectedObjectRoute + dataObject.id, { state: { repository } });
            }}
            className={isActive ? "active" : ""}
        >
            {tableStructure.map((column, index) => (
                <td key={String(column.objectAttributeToShow) || index}>{tdBodyRender(column, dataObject)}</td>
            ))}
            {isActive && (
                <td align="center">
                    <RowActionMenu
                        dataObject={dataObject}
                        handleEditObject={handleEditObject}
                        EditButtonComponent={EditButtonComponent}
                        handleDeleteObject={handleDeleteObject}
                        isDeletable={isDeletable}
                        shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
                    />
                </td>
            )}
        </tr>
    );
}

interface RowActionMenuProps<DataItemType extends RepositoryDataItem> {
    dataObject: DataItemType;
    sectionRepository?: RepositoryReact;
    handleEditObject?: (object: DataItemType) => void;
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    handleDeleteObject?: (objectId: number) => void;
    isDeletable: boolean;
    layout?: "vertical" | "horizontal";
    shouldRetrieveDataBeforeEdit?: boolean;
}

export function RowActionMenu<DataItemType extends RepositoryDataItem>({
    dataObject,
    handleEditObject,
    EditButtonComponent,
    handleDeleteObject,
    isDeletable,
    layout = "vertical",
    sectionRepository,
    shouldRetrieveDataBeforeEdit = false,
}: RowActionMenuProps<DataItemType>) {
    const repository = sectionRepository || useFilterableTableContext<DataItemType>().repository;

    return (
        <>
            {dataObject._gdFolderUrl && <GDFolderIconLink layout={layout} folderUrl={dataObject._gdFolderUrl} />}
            {dataObject._documentOpenUrl && (
                <GDDocFileIconLink layout={layout} folderUrl={dataObject._documentOpenUrl} />
            )}
            {EditButtonComponent && handleEditObject && (
                <EditButtonComponent
                    modalProps={{ onEdit: handleEditObject, initialData: dataObject, shouldRetrieveDataBeforeEdit }}
                    buttonProps={{ layout }}
                />
            )}
            {isDeletable && handleDeleteObject && (
                <DeleteModalButton
                    modalProps={{ onDelete: handleDeleteObject, initialData: dataObject, repository }}
                    buttonProps={{ layout }}
                />
            )}
        </>
    );
}

export function DeleteModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onDelete, initialData, repository },
    buttonProps,
}: SpecificDeleteModalButtonProps<DataItemType>) {
    const name = "name" in initialData ? initialData.name : undefined;
    const modalTitle = "Usuwanie " + (name || "wybranego elementu");

    return (
        <GeneralDeleteModalButton<DataItemType>
            modalProps={{
                onDelete,
                modalTitle,
                repository,
                initialData,
            }}
            buttonProps={buttonProps}
        />
    );
}
