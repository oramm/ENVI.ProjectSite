import React from 'react';
import { useNavigate } from "react-router-dom";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { GeneralDeleteModalButton } from '../../Modals/GeneralModalButtons';
import { SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../../Modals/ModalsTypes';
import { GDDocFileIconLink, GDFolderIconLink } from "../CommonComponents";
import { useFilterableTableContext } from "./FilterableTableContext";

export type FilterTableRowProps<DataItemType extends RepositoryDataItem> = {
    dataObject: DataItemType,
    isActive: boolean,
    onDoubleClick?: (object: DataItemType) => void
    onIsReadyChange?: (isReady: boolean) => void,
    onRowClick: (id: number) => void,
}

export function FiterableTableRow<DataItemType extends RepositoryDataItem>({
    dataObject,
    isActive,
    onIsReadyChange,
    onRowClick
}: FilterTableRowProps<DataItemType>): JSX.Element {
    if (!onIsReadyChange) throw new Error('onIsReadyChange is not defined');
    const navigate = useNavigate();
    const { selectedObjectRoute, tableStructure } = useFilterableTableContext<DataItemType>();
    const {
        handleEditObject,
        handleDeleteObject,
        EditButtonComponent,
        isDeletable
    } = useFilterableTableContext<DataItemType>();

    function tdBodyRender(columStructure: RowStructure<DataItemType>, dataObject: DataItemType) {
        if (columStructure.objectAttributeToShow !== undefined)
            return dataObject[columStructure.objectAttributeToShow] as string;
        if (columStructure.renderTdBody !== undefined)
            return columStructure.renderTdBody(dataObject);
        return '';
    }

    return (
        <tr
            onClick={(e) => (onRowClick(dataObject.id))}
            onDoubleClick={() => {
                if (selectedObjectRoute) navigate(selectedObjectRoute + dataObject.id)
            }}
            className={isActive ? 'active' : ''}
        >
            {tableStructure.map((column, index) => (
                <td key={column.objectAttributeToShow || index}>
                    {tdBodyRender(column, dataObject)}
                </td>
            ))}
            {isActive &&
                <td align='center'>
                    <RowActionMenu
                        dataObject={dataObject}
                        handleEditObject={handleEditObject}
                        EditButtonComponent={EditButtonComponent}
                        handleDeleteObject={handleDeleteObject}
                        isDeletable={isDeletable}
                    />
                </td>
            }
        </tr>
    );
}

interface RowActionMenuProps<DataItemType extends RepositoryDataItem> {
    dataObject: DataItemType;
    handleEditObject?: (object: DataItemType) => void
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>> | undefined
    handleDeleteObject?: (objectId: number) => void
    isDeletable: boolean
}

export function RowActionMenu<DataItemType extends RepositoryDataItem>({
    dataObject,
    handleEditObject,
    EditButtonComponent,
    handleDeleteObject,
    isDeletable,
}: RowActionMenuProps<DataItemType>) {

    return (
        <>
            {dataObject._gdFolderUrl && (
                <GDFolderIconLink folderUrl={dataObject._gdFolderUrl} />
            )}
            {dataObject._documentOpenUrl && (
                <GDDocFileIconLink folderUrl={dataObject._documentOpenUrl} />
            )}
            {EditButtonComponent && handleEditObject && (
                <EditButtonComponent
                    modalProps={{ onEdit: handleEditObject, initialData: dataObject, }}
                />
            )}
            {isDeletable && handleDeleteObject && (
                <DeleteModalButton
                    modalProps={{ onDelete: handleDeleteObject, initialData: dataObject }}
                />
            )}
        </>
    );
}

export function DeleteModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onDelete, initialData } }: SpecificDeleteModalButtonProps<DataItemType>) {

    const { repository } = useFilterableTableContext<DataItemType>();
    const modalTitle = 'Usuwanie ' + (initialData.name || 'wybranego elementu');

    return (
        <GeneralDeleteModalButton<DataItemType>
            modalProps={{
                onDelete,
                modalTitle,
                repository,
                initialData,
            }}
        />
    );
}

export type RowStructure<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    header?: string,
    objectAttributeToShow?: string,
    renderTdBody?: (dataItem: DataItemType) => JSX.Element
    renderThBody?: () => JSX.Element
};