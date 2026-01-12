import React, { useEffect, useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowStructure } from "./FilterableTableTypes";
import { FilterableTableRow } from "./FilterableTableRow";
import ErrorBoundary from "../../Modals/ErrorBoundary";

export type ResultSetTableProps<DataItemType extends RepositoryDataItem> = {
    showTableHeader: boolean;
    onRowClick: (id: number, parentSectionId?: string) => void;
    filteredObjects?: DataItemType[];
    isStriped?: boolean;
    /** ID sekcji rodzica dla liści (używane do podświetlenia ścieżki przy kliknięciu) */
    parentSectionId?: string;
};

export function ResultSetTable<DataItemType extends RepositoryDataItem>({
    showTableHeader,
    onRowClick,
    filteredObjects,
    isStriped = true,
    parentSectionId,
}: ResultSetTableProps<DataItemType>) {
    const { objects, activeRowId, tableStructure } = useFilterableTableContext<DataItemType>();
    const [objectsToShow, setObjectsToShow] = useState<DataItemType[]>([]);

    useEffect(() => {
        const objectsToShow = filteredObjects || objects;
        setObjectsToShow(objectsToShow);
    }, [objects, filteredObjects]);

    return (
        <>
            <div>
                {showTableHeader && (
                    <div className="d-none d-md-block">
                        <Row className="fw-bold text-secondary">
                            {tableStructure.map((column, index) => (
                                <Col key={column.header || index} {...getColSize(column)} className="text-center">
                                    {renderHeaderBody(column)}
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
                <div className="d-flex flex-column gap-2">
                    {objectsToShow.map((dataObject, index) => {
                        const isActive = dataObject.id === activeRowId;
                        const isStripedRow = isStriped && objectsToShow.length > 5 && index % 2 === 1;

                        return (
                            <ErrorBoundary key={dataObject.id}>
                                <div>
                                    <FilterableTableRow<DataItemType>
                                        //key={dataObject.id}
                                        dataObject={dataObject}
                                        isActive={isActive}
                                        isStriped={isStripedRow}
                                        onRowClick={(id) => onRowClick(id, parentSectionId)}
                                    />
                                </div>
                            </ErrorBoundary>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export function renderHeaderBody<DataItemType extends RepositoryDataItem>(column: RowStructure<DataItemType>) {
    if (column.header) return column.header;
    if (!column.renderThBody) return "";
    return column.renderThBody();
}

export function getColSize(column: RowStructure<any>) {
    return {
        xs: 12,
        sm: column.colSm || 11,
        md: column.colMd,
        lg: column.colLg,
    };
}
