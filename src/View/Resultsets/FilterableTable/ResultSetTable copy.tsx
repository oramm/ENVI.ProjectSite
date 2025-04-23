import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowStructure } from "./FilterableTableTypes";
import { FilterableTableRow } from "./FilterableTableRow";
import ErrorBoundary from "../../Modals/ErrorBoundary";
import { isStr } from "react-toastify/dist/utils";

export type ResultSetTableProps<DataItemType extends RepositoryDataItem> = {
    showTableHeader: boolean;
    onRowClick: (id: number) => void;
    filteredObjects?: DataItemType[];
    isStriped?: boolean;
};

export function ResultSetTable<DataItemType extends RepositoryDataItem>({
    showTableHeader,
    onRowClick,
    filteredObjects,
    isStriped = true,
}: ResultSetTableProps<DataItemType>) {
    const { objects, activeRowId, tableStructure } = useFilterableTableContext<DataItemType>();
    const [objectsToShow, setObjectsToShow] = useState<DataItemType[]>([]);

    useEffect(() => {
        const objectsToShow = filteredObjects || objects;
        setObjectsToShow(objectsToShow);
    }, [objects, filteredObjects]);

    function setStrippedClassName() {
        if (objectsToShow.length < 5 || !isStriped) return "";
        if (isStriped && objectsToShow.length > 5) return "table-striped";
        return "";
    }

    return (
        <>
            <Table className={setStrippedClassName()} hover size="sm">
                {showTableHeader && (
                    <thead>
                        <tr>
                            {tableStructure.map((column, index) => (
                                <th key={column.header || index}>{renderHeaderBody(column)}</th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {objectsToShow.map((dataObject) => {
                        const isActive = dataObject.id === activeRowId;
                        return (
                            <ErrorBoundary key={dataObject.id}>
                                <FilterableTableRow<DataItemType>
                                    //key={dataObject.id}
                                    dataObject={dataObject}
                                    isActive={isActive}
                                    isStriped={isStriped}
                                    onRowClick={onRowClick}
                                />
                            </ErrorBoundary>
                        );
                    })}
                </tbody>
            </Table>
        </>
    );
}

export function renderHeaderBody<DataItemType extends RepositoryDataItem>(column: RowStructure<DataItemType>) {
    if (column.header) return column.header;
    if (!column.renderThBody) return "";
    return column.renderThBody();
}
