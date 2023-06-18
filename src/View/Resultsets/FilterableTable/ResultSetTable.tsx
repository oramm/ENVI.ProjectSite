import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { GDDocFileIconLink, GDFolderIconLink } from "../CommonComponents";
import { DeleteModalButton } from "./FilterableTable";
import { useFilterableTableContext } from "./FilterableTableContext";

export type ResultSetTableProps<DataItemType extends RepositoryDataItem> = {
    onRowClick: (id: number) => void,
    onIsReadyChange?: (isReady: boolean) => void
    filteredObjects?: DataItemType[],
}

export function ResultSetTable<DataItemType extends RepositoryDataItem>({
    onRowClick,
    onIsReadyChange,
    filteredObjects
}: ResultSetTableProps<DataItemType>) {
    const { objects, activeRowId, tableStructure } = useFilterableTableContext<DataItemType>();
    const [objectsToShow, setObjectsToShow] = useState<DataItemType[]>([]);

    useEffect(() => {
        const objectsToShow = filteredObjects || objects;
        setObjectsToShow(objectsToShow);
    }, [objects, filteredObjects]);

    return (
        <>
            <Table striped hover size="sm">
                <thead>
                    <tr>
                        {tableStructure.map((column) => (
                            <th key={column.renderThBody?.name || column.header}>
                                {renderHeaderBody(column)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {objectsToShow.map((dataObject) => {
                        const isActive = dataObject.id === activeRowId;
                        return (
                            <FiterableTableRow<DataItemType>
                                key={dataObject.id}
                                dataObject={dataObject}
                                isActive={isActive}
                                onIsReadyChange={onIsReadyChange}
                                onRowClick={onRowClick}
                            />
                        )
                    })}
                </tbody>
            </Table >
        </>
    );
}

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
                    <RowActionMenu dataObject={dataObject} />
                </td>
            }
        </tr>
    );
}

interface RowActionMenuProps<DataItemType extends RepositoryDataItem> {
    dataObject: DataItemType;
}

function RowActionMenu<DataItemType extends RepositoryDataItem>({
    dataObject,
}: RowActionMenuProps<DataItemType>) {
    const {
        handleEditObject,
        handleDeleteObject,
        EditButtonComponent,
        isDeletable
    } = useFilterableTableContext<DataItemType>();
    return (
        <>
            {dataObject._gdFolderUrl && (
                <GDFolderIconLink folderUrl={dataObject._gdFolderUrl} />
            )}
            {dataObject._documentOpenUrl && (
                <GDDocFileIconLink folderUrl={dataObject._documentOpenUrl} />
            )}
            {EditButtonComponent && (
                <EditButtonComponent
                    modalProps={{ onEdit: handleEditObject, initialData: dataObject, }}
                />
            )}
            {isDeletable && (
                <DeleteModalButton
                    modalProps={{ onDelete: handleDeleteObject, initialData: dataObject }}
                />
            )}
        </>
    );
}

export function renderHeaderBody<DataItemType extends RepositoryDataItem>(column: RowStructure<DataItemType>) {
    if (column.header) return column.header;
    if (!column.renderThBody) return '';
    return column.renderThBody();
}

export type RowStructure<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    header?: string,
    objectAttributeToShow?: string,
    renderTdBody?: (dataItem: DataItemType) => JSX.Element
    renderThBody?: () => JSX.Element
};