import React, { FormEventHandler, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';

import { Table, Container, Accordion, Collapse, Button, Row, Col, Form, ProgressBar } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';

type FilteredTableProps = {
    title: string,
    filters: JSX.Element[],
    onSubmitSearch: FormEventHandler,
    onEdit?: (object: RepositoryDataItem) => void,
    onDelete?: (id: number) => void,
    onIsReadyChange?: (isReady: boolean) => void,
    onAdd?: (object: RepositoryDataItem) => void,
    objects: any[],
    isReady: boolean,
    activeRowId: number,
    onRowClick: (id: number) => void,
    tableHeaders: string[],
    rowRenderer: (props: FilterTableRowProps) => JSX.Element
}

export default function FilteredTable({
    title,
    filters,
    onSubmitSearch,
    onEdit,
    onDelete,
    onIsReadyChange,
    onAdd,
    objects,
    isReady,
    activeRowId,
    onRowClick: onRowClick,
    tableHeaders,
    rowRenderer
}: FilteredTableProps) {
    return (
        <Container>
            <Row>
                <Col>
                    <TableTitle title={title} />
                </Col>
            </Row>
            <Row>
                <Col> <FilterPanel filters={filters} onSubmit={onSubmitSearch} /></Col>
            </Row>
            {!isReady && <Row><progress style={{ height: "5px" }} /></Row>}
            <Row>
                <Col>
                    {objects.length > 0 && (
                        <ResultSetTable
                            objects={objects}
                            activeRowId={activeRowId}
                            onRowClick={onRowClick}
                            tableHeaders={tableHeaders}
                            rowRenderer={rowRenderer}
                            onIsReadyChange={onIsReadyChange}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAdd={onAdd}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    );
}

function FilterPanel({ filters, onSubmit }: { filters: any[], onSubmit: FormEventHandler }) {
    return (
        <Form onSubmit={onSubmit}>

            {filters.map((filter, index) => (
                <Col key={index}> {filter} </Col>
            ))}
            <Col>
                <Button type="submit">Szukaj</Button>
            </Col>
        </Form>
    );
}

/**
 *  Obsługuje wyszukiwanie w tabeli z filtrowaniem 
 */
export async function handleSubmitFilterableTable(
    e: React.FormEvent<HTMLFormElement>,
    repository: RepositoryReact,
    additionalParameters?: { name: string; value: string }[]
) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (additionalParameters?.length)
        for (const param of additionalParameters)
            formData.append(param.name, param.value);

    return await repository.loadItemsfromServer(formData);
}

type ResultSetTableProps = {
    objects: RepositoryDataItem[],
    activeRowId: number,
    onRowClick: (id: number) => void,
    tableHeaders: string[],
    rowRenderer: (props: FilterTableRowProps) => JSX.Element;
    onIsReadyChange?: (isReady: boolean) => void
    onEdit?: (object: RepositoryDataItem) => void
    onDelete?: (id: number) => void
    onAdd?: (object: RepositoryDataItem) => void
}

function ResultSetTable({ objects,
    activeRowId,
    onRowClick,
    tableHeaders,
    rowRenderer,
    onIsReadyChange,
    onEdit,
    onDelete,
    onAdd
}: ResultSetTableProps) {
    const navigate = useNavigate();
    return (
        <Table striped hover size="sm">
            <thead>
                <tr>
                    {tableHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {objects.map((dataObject) => {
                    const isActive = dataObject.id === activeRowId;
                    return (
                        < tr
                            key={dataObject.id}
                            onClick={(e) => (onRowClick(dataObject.id))}
                            onDoubleClick={() => { console.log('dblClick'); navigate('/contract/' + dataObject.id) }}
                            className={isActive ? 'active' : ''}
                        >
                            {rowRenderer({
                                dataObject,
                                isActive,
                                onIsReadyChange,
                                onEdit,
                                onDelete,
                                onAdd
                            })}
                        </tr>)
                })}
            </tbody>
        </Table >
    );
}

export type FilterTableRowProps = {
    dataObject: RepositoryDataItem,
    isActive: boolean,
    onDelete?: (id: number) => void,
    onEdit?: (object: RepositoryDataItem) => void
    onAdd?: (object: RepositoryDataItem) => void
    onDoubleClick?: (object: RepositoryDataItem) => void
    onIsReadyChange?: (isReady: boolean) => void
}

export function TableTitle({ title }: { title: string }) {
    return <h1>{title}</h1>
}