import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { useFilterableTableContext } from "./FilterableTableContext";
import { FiterableTableRow, RowStructure } from "./FiterableTableRow";

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

export function renderHeaderBody<DataItemType extends RepositoryDataItem>(column: RowStructure<DataItemType>) {
    if (column.header) return column.header;
    if (!column.renderThBody) return '';
    return column.renderThBody();
}